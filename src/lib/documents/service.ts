/**
 * TEMPORARY MOCK of the documents service (plan m2-02), with the same
 * signatures and shapes as the contract in docs/api/documents.md.
 * Data lives in memory and is lost on restart. Replaced by the real
 * Supabase implementation when m2-02 is merged: keep that version on rebase.
 */
import { createHash, randomUUID } from "node:crypto";
import type {
  Document,
  DocumentCounts,
  DocumentList,
  DocumentKind,
  ListDocumentsQuery,
} from "./types";

type StoredDocument = Document & { bytes: Uint8Array; sha256: string };

const store = globalThis as typeof globalThis & {
  __docflowMockDocuments?: StoredDocument[];
};

function seed(): StoredDocument[] {
  const day = 24 * 60 * 60 * 1000;
  const items: [string, DocumentKind, string, number, Partial<Document>?][] = [
    ["fattura_IT01234_2026-118.xml", "fatturapa", "application/xml", 18_400],
    ["contratto_bianchi.pdf", "pdf", "application/pdf", 412_000],
    ["preventivo_verdi_luce.pdf", "pdf", "application/pdf", 236_000],
    ["note_riunione_fornitori.txt", "text", "text/plain", 4_100],
    [
      "scansione_ricevuta.pdf",
      "pdf",
      "application/pdf",
      1_840_000,
      {
        status: "failed",
        errorMessage: "È una scansione senza testo selezionabile.",
      },
    ],
  ];
  return items.map(([fileName, kind, mimeType, sizeBytes, extra], i) => {
    const bytes = new TextEncoder().encode(`Documento di prova: ${fileName}`);
    return {
      id: randomUUID(),
      fileName,
      kind,
      mimeType,
      sizeBytes,
      status: "uploaded",
      errorMessage: null,
      createdAt: new Date(Date.now() - (i + 1) * day).toISOString(),
      ...extra,
      bytes,
      sha256: createHash("sha256").update(bytes).digest("hex"),
    };
  });
}

function all(): StoredDocument[] {
  store.__docflowMockDocuments ??= seed();
  return store.__docflowMockDocuments;
}

function toDocument(stored: StoredDocument): Document {
  const { bytes, sha256, ...doc } = stored;
  void bytes;
  void sha256;
  return doc;
}

export async function listDocuments(
  query: ListDocumentsQuery,
): Promise<DocumentList> {
  const docs = all();
  const counts: DocumentCounts = {
    all: docs.length,
    fatturapa: docs.filter((d) => d.kind === "fatturapa").length,
    pdf: docs.filter((d) => d.kind === "pdf").length,
    text: docs.filter((d) => d.kind === "text").length,
    failed: docs.filter((d) => d.status === "failed").length,
  };
  const filtered = docs
    .filter((d) => !query.kind || d.kind === query.kind)
    .filter((d) => !query.status || d.status === query.status)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const start = (query.page - 1) * query.pageSize;
  return {
    documents: filtered.slice(start, start + query.pageSize).map(toDocument),
    total: filtered.length,
    page: query.page,
    pageSize: query.pageSize,
    counts,
  };
}

export async function getDocument(id: string): Promise<Document | null> {
  const doc = all().find((d) => d.id === id);
  return doc ? toDocument(doc) : null;
}

/* Used only by the mock Route Handlers. */

export async function mockCreateDocument(
  file: File,
  kind: DocumentKind,
): Promise<{ document: Document } | { duplicateOf: Document }> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const existing = all().find((d) => d.sha256 === sha256);
  if (existing) return { duplicateOf: toDocument(existing) };
  const stored: StoredDocument = {
    id: randomUUID(),
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: file.size,
    kind,
    status: "uploaded",
    errorMessage: null,
    createdAt: new Date().toISOString(),
    bytes,
    sha256,
  };
  all().unshift(stored);
  return { document: toDocument(stored) };
}

export async function mockDeleteDocument(id: string): Promise<boolean> {
  const docs = all();
  const index = docs.findIndex((d) => d.id === id);
  if (index < 0) return false;
  docs.splice(index, 1);
  return true;
}

export async function mockReadFile(
  id: string,
): Promise<{ document: Document; bytes: Uint8Array } | null> {
  const doc = all().find((d) => d.id === id);
  return doc ? { document: toDocument(doc), bytes: doc.bytes } : null;
}
