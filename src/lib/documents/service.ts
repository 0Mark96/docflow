import { getCurrentUser } from "@/lib/auth/current-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DocumentError } from "./errors";
import { getDocumentWith, listDocumentsWith } from "./repository";
import {
  listDocumentsQuerySchema,
  type Document,
  type DocumentList,
} from "./types";

/**
 * Entry points for Server Components. They return the same shapes as the API
 * (docs/api/documents.md) and throw DocumentError ("unauthenticated",
 * "not_found", ...) on expected failures.
 */

/** Accepts raw search params (e.g. from the page URL) and applies the defaults. */
export async function listDocuments(
  query: Record<string, unknown> = {},
): Promise<DocumentList> {
  const parsed = listDocumentsQuerySchema.safeParse(query);
  if (!parsed.success) throw new DocumentError("invalid_request");
  if (!(await getCurrentUser())) throw new DocumentError("unauthenticated");
  return listDocumentsWith(await createSupabaseServerClient(), parsed.data);
}

export async function getDocument(id: string): Promise<Document> {
  if (!(await getCurrentUser())) throw new DocumentError("unauthenticated");
  return getDocumentWith(await createSupabaseServerClient(), id);
}
