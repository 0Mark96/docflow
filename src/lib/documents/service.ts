import "server-only";

import { getCurrentUser } from "@/lib/auth/current-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DocumentError } from "./errors";
import { getDocumentWith, listDocumentsWith } from "./repository";
import { z } from "zod";
import {
  DEFAULT_PAGE_SIZE,
  listDocumentsQuerySchema,
  type Document,
  type DocumentList,
} from "./types";

/**
 * Entry points for Server Components. They return the same shapes as the API
 * (docs/api/documents.md). They throw DocumentError("unauthenticated") without
 * a session (pages call requireUser() first); getDocument returns null for a
 * missing document.
 */

/**
 * Same as listDocumentsQuerySchema, but an invalid value (e.g. a hand-edited
 * URL) falls back to its default instead of failing.
 */
const lenientQuerySchema = z.object({
  page: listDocumentsQuerySchema.shape.page.catch(1),
  pageSize: listDocumentsQuerySchema.shape.pageSize.catch(DEFAULT_PAGE_SIZE),
  kind: listDocumentsQuerySchema.shape.kind.catch(undefined),
  status: listDocumentsQuerySchema.shape.status.catch(undefined),
});

/**
 * Accepts raw search params (e.g. from the page URL): missing or invalid
 * values get their defaults.
 */
export async function listDocuments(
  query: Record<string, unknown> = {},
): Promise<DocumentList> {
  const parsed = lenientQuerySchema.parse(query);
  if (!(await getCurrentUser())) throw new DocumentError("unauthenticated");
  return listDocumentsWith(await createSupabaseServerClient(), parsed);
}

/** The document, or null when it does not exist or belongs to another company. */
export async function getDocument(id: string): Promise<Document | null> {
  if (!(await getCurrentUser())) throw new DocumentError("unauthenticated");
  try {
    return await getDocumentWith(await createSupabaseServerClient(), id);
  } catch (error) {
    if (error instanceof DocumentError && error.code === "not_found") {
      return null;
    }
    throw error;
  }
}
