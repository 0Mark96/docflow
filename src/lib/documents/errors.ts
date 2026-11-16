import type { ApiError, ApiErrorCode } from "./types";
import { MAX_UPLOAD_BYTES } from "./types";

const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  unauthenticated: 401,
  invalid_request: 400,
  file_missing: 400,
  file_empty: 400,
  file_too_large: 413,
  unsupported_type: 415,
  duplicate_file: 409,
  not_found: 404,
  server_error: 500,
};

const MESSAGE_BY_CODE: Record<ApiErrorCode, string> = {
  unauthenticated: "Accedi per continuare.",
  invalid_request: "Richiesta non valida.",
  file_missing: "Scegli un file da caricare.",
  file_empty: "Il file è vuoto.",
  file_too_large: `Il file supera il limite di ${MAX_UPLOAD_BYTES / (1024 * 1024)} MB.`,
  unsupported_type:
    "Formato non supportato. Carica un PDF, un file di testo (.txt) o una fattura elettronica XML.",
  duplicate_file: "Questo file è già caricato.",
  not_found: "Documento non trovato.",
  server_error: "Si è verificato un errore. Riprova tra poco.",
};

/** An expected failure with a code from the API contract. */
export class DocumentError extends Error {
  constructor(
    readonly code: ApiErrorCode,
    readonly details: { message?: string; existingDocumentId?: string } = {},
  ) {
    super(code);
    this.name = "DocumentError";
  }
}

export function errorBody(
  code: ApiErrorCode,
  details: { message?: string; existingDocumentId?: string } = {},
): ApiError {
  return {
    error: {
      code,
      message: details.message ?? MESSAGE_BY_CODE[code],
      ...(details.existingDocumentId
        ? { existingDocumentId: details.existingDocumentId }
        : {}),
    },
  };
}

export function errorResponse(
  code: ApiErrorCode,
  details: { message?: string; existingDocumentId?: string } = {},
): Response {
  return Response.json(errorBody(code, details), {
    status: STATUS_BY_CODE[code],
  });
}

/**
 * Turns any thrown value into a contract error response. Unexpected errors are
 * logged with the operation name only: no file names or content (ADR 0008).
 */
export function toErrorResponse(error: unknown, operation: string): Response {
  if (error instanceof DocumentError) {
    return errorResponse(error.code, error.details);
  }
  console.error(`[documents] ${operation} failed`, {
    name: error instanceof Error ? error.name : typeof error,
  });
  return errorResponse("server_error");
}
