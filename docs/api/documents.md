# Documents API

Contract between the documents backend (plan `m2-02-documents-and-storage`) and the "File caricati" page. Types and Zod schemas: `src/lib/documents/types.ts`; import them, never redefine them.

All endpoints require a logged-in user (Supabase session cookie). Every query runs with the user's session, so RLS limits it to the user's company: a document of another company answers `404`, never `403`, so its existence is not revealed.

## Document

```ts
type Document = {
  id: string;            // uuid
  fileName: string;      // original name, e.g. "preventivo_2026-087.pdf"
  mimeType: string;      // "application/pdf" | "text/plain" | "application/xml"
  sizeBytes: number;
  kind: "fatturapa" | "pdf" | "text";
  status: "uploaded" | "processing" | "ready" | "failed";
  errorMessage: string | null; // Italian, only when status is "failed"
  createdAt: string;     // ISO 8601
};
```

Status: in M2 every document stays `uploaded`. `processing`, `ready` and `failed` are set by the extraction pipeline (M3).

## Limits

- Formats: PDF (`.pdf`), plain text (`.txt`), FatturaPA XML (`.xml`). The server checks the content, not only the extension (a `.pdf` must start with `%PDF-`, a `.xml` must contain a `FatturaElettronica` root element, a `.txt` must be valid UTF-8). Signed FatturaPA (`.xml.p7m`) is not accepted yet.
- Size: at most 4 MB (`MAX_UPLOAD_BYTES`), below the 4.5 MB request limit of Vercel Functions. Larger files need direct upload to Storage with a signed URL, a later change.
- One file per request.
- Duplicates: a file whose content (SHA-256) is already stored in the company is rejected with `409 duplicate_file`, whatever its name. Two different files with the same name are both accepted.

## Endpoints

| Method and path | Request | Success |
|---|---|---|
| `POST /api/documents` | `multipart/form-data`, field `file` | `201 { document: Document }` |
| `GET /api/documents?page=1&pageSize=20&kind=pdf&status=failed` | `page` ≥ 1 (default 1), `pageSize` 1–100 (default 20), optional filters `kind` and `status` | `200 { documents: Document[], total, page, pageSize, counts }`, newest first |
| `GET /api/documents/:id` | | `200 { document: Document }` |
| `DELETE /api/documents/:id` | | `204`, file and row removed |
| `GET /api/documents/:id/download` | | `302` to a signed Storage URL valid for 60 seconds, which downloads the file with its original name |

`total` counts the documents matching the filters. `counts` is `{ all, fatturapa, pdf, text, failed }` over the whole company, independent of the filters, for the tabs of the list.

Server Components do not call the API over HTTP: they import `listDocuments` and `getDocument` from `src/lib/documents/service.ts`, which return the same shapes.

## Errors

Every error has the body `{ error: { code, message } }`. `message` is in Italian and can be shown to the user as is; branch on `code`, never on `message`.

| HTTP | `code` | When |
|---|---|---|
| 400 | `invalid_request` | Bad query string, malformed id or body that is not `multipart/form-data` |
| 400 | `file_missing` | No `file` field |
| 400 | `file_empty` | File of 0 bytes |
| 413 | `file_too_large` | Over 4 MB |
| 415 | `unsupported_type` | Extension or content not accepted |
| 409 | `duplicate_file` | Same content already uploaded; the body also has `error.existingDocumentId` |
| 401 | `unauthenticated` | No session |
| 404 | `not_found` | No document with that id in the user's company |
| 500 | `server_error` | Storage or database failure; details only in server logs, by id |
