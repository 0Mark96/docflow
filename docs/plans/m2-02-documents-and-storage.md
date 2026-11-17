# Plan m2-02: Documents and storage

- Milestone: M2
- Depends on: m2-01 (companies, profiles, `current_company_id()`, Supabase clients, `getCurrentUser()`)
- Status: to do
- Branch: `feature/m2-documents-storage` from `main`

## Goal

A logged-in user can upload a PDF, TXT or FatturaPA XML file, list their company's documents, download one and delete it. Files sit in a private Storage bucket under the company's folder; neither the table nor the files of one company are visible to another (RLS). This plan has no page: the "File caricati" page (m2-03) is built on the API defined here.

## Decisions for this plan

- **Size limit: 4 MB per file**, below the 4.5 MB request body limit of Vercel Functions. Larger files (direct upload to Storage with a signed URL) are a later change.
- **Type from the content**, not only the extension: a `.pdf` starts with `%PDF-`, a `.xml` has a `FatturaElettronica` root element, a `.txt` is valid UTF-8. Signed FatturaPA (`.p7m`) is not accepted yet.
- **Duplicates by content:** a file whose SHA-256 is already stored in the company is rejected with `409 duplicate_file` and the id of the existing document, so the page can link it. Two different files with the same name are both accepted. This rule can be changed (for example, accept and mark as duplicate) by updating this plan before the code.
- **Storage path without user text:** `<company_id>/<document_id>.<ext>`; the original file name is stored in the table.

## Tasks

1. **API contract first** (`docs/api/documents.md`, `src/lib/documents/types.ts` with Zod schemas): document shape, statuses (`uploaded`, `processing`, `ready`, `failed`; in M2 every document stays `uploaded`), list filters, counts per type, pagination, limits and error codes with Italian messages.
2. **Migration `documents_and_storage`:** enums `document_kind` and `document_status`; table `documents` with `company_id` defaulting to `current_company_id()`, original file name, MIME type, size, SHA-256 (unique per company), storage path checked to start with the company id; RLS policies for select, insert and delete; private bucket `documents` (4 MB, PDF / text / XML) with Storage policies on the first folder of the object name. Regenerate `src/lib/supabase/database.types.ts`.
3. **Validation** (`src/lib/documents/validation.ts`): kind from extension confirmed by content, file name reduced to its base name, storage path.
4. **Data access** (`src/lib/documents/repository.ts`) with the user's Supabase client, so RLS always applies: list with filters, counts and pagination; get; upload (file first, then row; remove the file if the row fails); delete (file first, then row); signed download URL (60 s, original name).
5. **Route Handlers** under `src/app/api/documents/`: `POST` (upload), `GET` (list), `GET /:id`, `DELETE /:id`, `GET /:id/download`. `401` without a session; another company's document answers `404`, never `403`. Server Components use `listDocuments` / `getDocument` from `src/lib/documents/service.ts` instead of calling the API over HTTP.
6. **Fixtures and tests:** small synthetic files in `fixtures/documents/` (one PDF, one TXT, one FatturaPA XML; no real customer data). Vitest for validation, error responses and upload/delete order; pgTAP for RLS on `documents` and on Storage objects.
7. **Docs:** upload flow and `documents` columns in `docs/architecture.md`.

## Verification

- `npx supabase db reset` applies both migrations.
- Logged in as a user of company A, `POST /api/documents` with the synthetic PDF from `fixtures/documents/` answers `201`; the same file again answers `409 duplicate_file`; a `.jpg` answers `415`; a 5 MB file answers `413`.
- `GET /api/documents` lists the document with `counts.pdf = 1`; `GET /api/documents/:id/download` downloads it with its original name.
- A user of company B gets `404` on the same id and an empty list.
- `DELETE` answers `204` and the object disappears from the bucket (Supabase Studio, `http://127.0.0.1:54323`).
- `npx supabase test db`, `npm run lint`, `npm run type-check`, `npm test` pass.

## Out of scope

- The "File caricati" page and the document detail page (m2-03).
- Extraction and the `processing` / `ready` / `failed` states (M3). The table has no update policy until then.
- Files over 4 MB, signed FatturaPA (`.p7m`).
- Audit log of uploads and deletions, two-tenant test across all tables (M5).

## Outcome

To be filled when the task is merged.
