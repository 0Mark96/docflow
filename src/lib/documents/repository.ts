import type { SupabaseClient as UntypedClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { z } from "zod";
import { DocumentError } from "./errors";
import {
  documentKindSchema,
  documentStatusSchema,
  MAX_UPLOAD_BYTES,
  type Document,
  type DocumentCounts,
  type DocumentKind,
  type DocumentStatus,
  type DocumentList,
  type ListDocumentsQuery,
} from "./types";
import {
  detectDocumentKind,
  MIME_TYPE_BY_KIND,
  sanitizeFileName,
  sha256Hex,
  storagePath,
} from "./validation";

/**
 * Data access for documents. Every function receives a Supabase client acting
 * as the logged-in user, so RLS limits it to the user's company.
 */

type SupabaseClient = UntypedClient<Database>;

export const BUCKET = "documents";
const SIGNED_URL_SECONDS = 60;
const UNIQUE_VIOLATION = "23505";

const COLUMNS =
  "id, file_name, mime_type, size_bytes, kind, status, error_message, created_at, file_path";

const documentRowSchema = z.object({
  id: z.uuid(),
  file_name: z.string(),
  mime_type: z.string(),
  size_bytes: z.number(),
  kind: documentKindSchema,
  status: documentStatusSchema,
  error_message: z.string().nullable(),
  created_at: z.string(),
  file_path: z.string(),
});
type DocumentRow = z.infer<typeof documentRowSchema>;

export function toDocument(row: DocumentRow): Document {
  return {
    id: row.id,
    fileName: row.file_name,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    kind: row.kind,
    status: row.status,
    errorMessage: row.error_message,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

function parseRow(data: unknown): DocumentRow {
  const parsed = documentRowSchema.safeParse(data);
  if (!parsed.success) throw new Error("Unexpected documents row shape");
  return parsed.data;
}

const uuidSchema = z.uuid();

/** Malformed ids answer 404 like missing ones, so the API never reveals anything. */
function assertId(id: string): void {
  if (!uuidSchema.safeParse(id).success) throw new DocumentError("not_found");
}

async function countDocuments(
  supabase: SupabaseClient,
  filter: { kind?: DocumentKind; status?: DocumentStatus } = {},
): Promise<number> {
  let query = supabase
    .from("documents")
    .select("id", { count: "exact", head: true });
  if (filter.kind) query = query.eq("kind", filter.kind);
  if (filter.status) query = query.eq("status", filter.status);
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

async function getCounts(supabase: SupabaseClient): Promise<DocumentCounts> {
  const [all, fatturapa, pdf, text, failed] = await Promise.all([
    countDocuments(supabase),
    countDocuments(supabase, { kind: "fatturapa" }),
    countDocuments(supabase, { kind: "pdf" }),
    countDocuments(supabase, { kind: "text" }),
    countDocuments(supabase, { status: "failed" }),
  ]);
  return { all, fatturapa, pdf, text, failed };
}

export async function listDocumentsWith(
  supabase: SupabaseClient,
  query: ListDocumentsQuery,
): Promise<DocumentList> {
  const from = (query.page - 1) * query.pageSize;
  let request = supabase
    .from("documents")
    .select(COLUMNS, { count: "exact" })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(from, from + query.pageSize - 1);
  if (query.kind) request = request.eq("kind", query.kind);
  if (query.status) request = request.eq("status", query.status);

  const [{ data, count, error }, counts] = await Promise.all([
    request,
    getCounts(supabase),
  ]);
  // PostgREST answers 416 when the page is past the end: treat it as an empty page.
  if (error && error.code !== "PGRST103") throw error;

  return {
    documents: (data ?? []).map((row) => toDocument(parseRow(row))),
    total: count ?? 0,
    page: query.page,
    pageSize: query.pageSize,
    counts,
  };
}

async function getRow(
  supabase: SupabaseClient,
  id: string,
): Promise<DocumentRow> {
  assertId(id);
  const { data, error } = await supabase
    .from("documents")
    .select(COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new DocumentError("not_found");
  return parseRow(data);
}

export async function getDocumentWith(
  supabase: SupabaseClient,
  id: string,
): Promise<Document> {
  return toDocument(await getRow(supabase, id));
}

async function findByHash(
  supabase: SupabaseClient,
  hash: string,
): Promise<{ id: string; file_name: string } | null> {
  const { data, error } = await supabase
    .from("documents")
    .select("id, file_name")
    .eq("content_sha256", hash)
    .maybeSingle();
  if (error) throw error;
  return data;
}

function duplicateError(existing: { id: string; file_name: string }) {
  return new DocumentError("duplicate_file", {
    message: `Questo file è già caricato come «${existing.file_name}».`,
    existingDocumentId: existing.id,
  });
}

/**
 * Validates the file, stores it under the company's folder and creates the
 * documents row. If the row cannot be created, the stored file is removed.
 */
export async function uploadDocumentWith(
  supabase: SupabaseClient,
  user: { userId: string; companyId: string },
  file: File,
): Promise<Document> {
  if (file.size === 0) throw new DocumentError("file_empty");
  if (file.size > MAX_UPLOAD_BYTES) throw new DocumentError("file_too_large");

  const fileName = sanitizeFileName(file.name);
  if (!fileName) throw new DocumentError("unsupported_type");

  const bytes = new Uint8Array(await file.arrayBuffer());
  const kind = detectDocumentKind(fileName, bytes);
  if (!kind) throw new DocumentError("unsupported_type");

  const hash = await sha256Hex(bytes);
  const existing = await findByHash(supabase, hash);
  if (existing) throw duplicateError(existing);

  const id = crypto.randomUUID();
  const path = storagePath(user.companyId, id, kind);
  const mimeType = MIME_TYPE_BY_KIND[kind];

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: mimeType, upsert: false });
  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from("documents")
    .insert({
      id,
      company_id: user.companyId,
      file_path: path,
      file_name: fileName,
      mime_type: mimeType,
      size_bytes: bytes.byteLength,
      content_sha256: hash,
      kind,
      created_by: user.userId,
    })
    .select(COLUMNS)
    .single();

  if (error) {
    await supabase.storage.from(BUCKET).remove([path]);
    if (error.code === UNIQUE_VIOLATION) {
      // Same file uploaded at the same moment by another request.
      const other = await findByHash(supabase, hash);
      if (other) throw duplicateError(other);
    }
    throw error;
  }
  return toDocument(parseRow(data));
}

/**
 * Deletes the file first, then the row (whose foreign keys cascade to
 * extracted fields and chunks). A failure never leaves a file without its row.
 */
export async function deleteDocumentWith(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const row = await getRow(supabase, id);

  const { error: storageError } = await supabase.storage
    .from(BUCKET)
    .remove([row.file_path]);
  if (storageError) throw storageError;

  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) throw error;
}

/** Short-lived signed URL that downloads the file with its original name. */
export async function getDownloadUrlWith(
  supabase: SupabaseClient,
  id: string,
): Promise<string> {
  const row = await getRow(supabase, id);
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(row.file_path, SIGNED_URL_SECONDS, {
      download: row.file_name,
    });
  if (error || !data) throw error ?? new Error("No signed URL");
  return data.signedUrl;
}
