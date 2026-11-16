import { z } from "zod";

/**
 * Shared contract for documents, used by the API (server) and by the
 * "File caricati" page (client). See docs/api/documents.md.
 */

/** Maximum upload size. Kept under the 4.5 MB request body limit of Vercel Functions. */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

/** File extensions accepted by the upload, with the kind they map to. */
export const ACCEPTED_EXTENSIONS = {
  ".pdf": "pdf",
  ".txt": "text",
  ".xml": "fatturapa",
} as const;

/** Value for the `accept` attribute of a file input. */
export const ACCEPT_ATTRIBUTE =
  ".pdf,.txt,.xml,application/pdf,text/plain,application/xml,text/xml";

export const documentKindSchema = z.enum(["fatturapa", "pdf", "text"]);
export type DocumentKind = z.infer<typeof documentKindSchema>;

/**
 * - `uploaded`: file stored, extraction not started (the only state in M2).
 * - `processing`: extraction running (M3).
 * - `ready`: fields extracted (M3).
 * - `failed`: extraction failed; `errorMessage` says why (M3).
 */
export const documentStatusSchema = z.enum([
  "uploaded",
  "processing",
  "ready",
  "failed",
]);
export type DocumentStatus = z.infer<typeof documentStatusSchema>;

export const documentSchema = z.object({
  id: z.uuid(),
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().nonnegative(),
  kind: documentKindSchema,
  status: documentStatusSchema,
  /** User-facing message in Italian, set only when status is `failed`. */
  errorMessage: z.string().nullable(),
  /** ISO 8601 timestamp. */
  createdAt: z.string(),
});
export type Document = z.infer<typeof documentSchema>;

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/** Query string of `GET /api/documents`. */
export const listDocumentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_PAGE_SIZE)
    .default(DEFAULT_PAGE_SIZE),
  /** Optional filters, applied before pagination. */
  kind: documentKindSchema.optional(),
  status: documentStatusSchema.optional(),
});
export type ListDocumentsQuery = z.infer<typeof listDocumentsQuerySchema>;

/** Counts over the whole company, independent of the filters (tabs of the list). */
export const documentCountsSchema = z.object({
  all: z.number().int().nonnegative(),
  fatturapa: z.number().int().nonnegative(),
  pdf: z.number().int().nonnegative(),
  text: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
});
export type DocumentCounts = z.infer<typeof documentCountsSchema>;

export const documentListSchema = z.object({
  documents: z.array(documentSchema),
  /** Documents matching the filters, before pagination. */
  total: z.number().int().nonnegative(),
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  counts: documentCountsSchema,
});
export type DocumentList = z.infer<typeof documentListSchema>;

export const apiErrorCodeSchema = z.enum([
  "unauthenticated",
  "invalid_request",
  "file_missing",
  "file_empty",
  "file_too_large",
  "unsupported_type",
  "duplicate_file",
  "not_found",
  "server_error",
]);
export type ApiErrorCode = z.infer<typeof apiErrorCodeSchema>;

/** Body of every error response: `{ error: { code, message } }`. `message` is Italian and can be shown as is. */
export const apiErrorSchema = z.object({
  error: z.object({
    code: apiErrorCodeSchema,
    message: z.string(),
    /** Only with `duplicate_file`: the document that already has the same content. */
    existingDocumentId: z.uuid().optional(),
  }),
});
export type ApiError = z.infer<typeof apiErrorSchema>;
