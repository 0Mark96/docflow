/** TEMPORARY MOCK helper (plan m2-02 replaces the whole api/documents folder). */
import type { ApiError, ApiErrorCode } from "@/lib/documents/types";

export function apiError(
  status: number,
  code: ApiErrorCode,
  message: string,
  existingDocumentId?: string,
): Response {
  const body: ApiError = { error: { code, message, existingDocumentId } };
  return Response.json(body, { status });
}
