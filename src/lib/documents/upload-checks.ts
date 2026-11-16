import {
  ACCEPTED_EXTENSIONS,
  MAX_UPLOAD_BYTES,
  type DocumentKind,
} from "./types";

export type FileCheck =
  { ok: true; kind: DocumentKind } | { ok: false; reason: string };

/**
 * Checks done in the browser before sending, so the user gets an answer at
 * once. The server repeats them and also checks the content.
 */
export function checkFile(file: { name: string; size: number }): FileCheck {
  const dot = file.name.lastIndexOf(".");
  const extension = dot >= 0 ? file.name.slice(dot).toLowerCase() : "";
  const kind =
    extension in ACCEPTED_EXTENSIONS
      ? ACCEPTED_EXTENSIONS[extension as keyof typeof ACCEPTED_EXTENSIONS]
      : undefined;
  if (!kind) {
    return {
      ok: false,
      reason: "formato non supportato (usa PDF, TXT o fattura XML)",
    };
  }
  if (file.size === 0) return { ok: false, reason: "il file è vuoto" };
  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      reason: `supera i ${MAX_UPLOAD_BYTES / 1024 / 1024} MB`,
    };
  }
  return { ok: true, kind };
}
