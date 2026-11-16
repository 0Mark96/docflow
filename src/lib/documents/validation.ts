import { ACCEPTED_EXTENSIONS, type DocumentKind } from "./types";

export const MIME_TYPE_BY_KIND: Record<DocumentKind, string> = {
  fatturapa: "application/xml",
  pdf: "application/pdf",
  text: "text/plain",
};

const EXTENSION_BY_KIND: Record<DocumentKind, string> = {
  fatturapa: "xml",
  pdf: "pdf",
  text: "txt",
};

const MAX_FILE_NAME_LENGTH = 255;
/** How far into an XML file to look for the FatturaPA root element. */
const XML_ROOT_SCAN_BYTES = 8 * 1024;

/**
 * Keeps only the base name, removes control characters and trims it to 255
 * characters, keeping the extension. Returns null when nothing usable is left.
 */
export function sanitizeFileName(raw: string): string | null {
  const baseName = raw.split(/[/\\]/).pop() ?? "";
  const cleaned = baseName.replace(/[\u0000-\u001f\u007f]/g, "").trim();
  if (cleaned === "" || cleaned === "." || cleaned === "..") return null;
  if (cleaned.length <= MAX_FILE_NAME_LENGTH) return cleaned;

  const dot = cleaned.lastIndexOf(".");
  const extension = dot > 0 ? cleaned.slice(dot) : "";
  return cleaned.slice(0, MAX_FILE_NAME_LENGTH - extension.length) + extension;
}

function extensionOf(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  return dot > 0 ? fileName.slice(dot).toLowerCase() : "";
}

function startsWith(bytes: Uint8Array, prefix: string): boolean {
  if (bytes.length < prefix.length) return false;
  for (let i = 0; i < prefix.length; i++) {
    if (bytes[i] !== prefix.charCodeAt(i)) return false;
  }
  return true;
}

function isUtf8Text(bytes: Uint8Array): boolean {
  if (bytes.includes(0)) return false;
  try {
    new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return true;
  } catch {
    return false;
  }
}

function hasFatturaPaRoot(bytes: Uint8Array): boolean {
  // FatturaPA files are UTF-8 or ISO-8859-1; the root element name is ASCII in both.
  const head = new TextDecoder("latin1").decode(
    bytes.subarray(0, XML_ROOT_SCAN_BYTES),
  );
  return /<([A-Za-z_][\w.-]*:)?FatturaElettronica[\s>/]/.test(head);
}

/**
 * Decides the document kind from the extension and checks that the content
 * matches it. The browser's MIME type is not trusted.
 */
export function detectDocumentKind(
  fileName: string,
  bytes: Uint8Array,
): DocumentKind | null {
  const extension = extensionOf(fileName);
  if (!(extension in ACCEPTED_EXTENSIONS)) return null;
  const kind =
    ACCEPTED_EXTENSIONS[extension as keyof typeof ACCEPTED_EXTENSIONS];

  switch (kind) {
    case "pdf":
      return startsWith(bytes, "%PDF-") ? kind : null;
    case "text":
      return isUtf8Text(bytes) ? kind : null;
    case "fatturapa":
      return hasFatturaPaRoot(bytes) ? kind : null;
  }
}

/** Storage object name: <company_id>/<document_id>.<ext>. No user text in the path. */
export function storagePath(
  companyId: string,
  documentId: string,
  kind: DocumentKind,
): string {
  return `${companyId}/${documentId}.${EXTENSION_BY_KIND[kind]}`;
}

export async function sha256Hex(
  bytes: Uint8Array<ArrayBuffer>,
): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}
