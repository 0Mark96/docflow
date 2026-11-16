# Plan m2-02: Documents and storage

- Milestone: M2
- Depends on: m2-01 (companies, profiles, `current_company_id()`, Supabase clients and `getCurrentUser()`)
- Status: in progress
- Branch: `claude/project-thread-1vc9uh` from `main`

## Goal

A logged-in user can upload a PDF, TXT or FatturaPA XML file, see it in the list of their company's documents, download it and delete it. Files sit in a private Storage bucket under the company's folder, and neither the table nor the files of one company are visible to another (RLS). The "File caricati" page (m2-03) is built on this API.

## Tasks

1. **API contract first** (`docs/api/documents.md`, `src/lib/documents/types.ts`): document shape, statuses, list filters and counts, limits, error codes. Shared with m2-03 before any code.
2. **Migration** `20261116000200_documents_and_storage.sql`: enums `document_kind` and `document_status`; table `documents` with `company_id` defaulting to `current_company_id()`, original file name, MIME type, size, SHA-256 of the content (unique per company), storage path checked to start with the company id; RLS policies for select, insert and delete; private bucket `documents` (4 MB, PDF / text / XML) with Storage policies on the first folder of the object name.
3. **Validation** (`src/lib/documents/validation.ts`): kind from the extension, confirmed by the content (`%PDF-`, `FatturaElettronica` root element, valid UTF-8); file name reduced to its base name; storage path `<company_id>/<document_id>.<ext>` without user text.
4. **Data access** (`src/lib/documents/repository.ts`) with the user's Supabase client, so RLS always applies: list with filters, counts and pagination; get; upload (file first, then row; the file is removed if the row fails); delete (file first, then row); signed download URL (60 s, original name).
5. **Route Handlers** under `src/app/api/documents/`: `401` without a session, contract errors otherwise. **Server entry points** (`src/lib/documents/service.ts`): `listDocuments` and `getDocument` for Server Components.
6. **Tests** (Vitest): validation, error responses, upload and delete order with a fake client, route handlers without session or with bad input.
7. **Docs**: architecture (upload flow and `documents` columns), plan index.

## Verification

- `npm run lint`, `npm run type-check`, `npm test` pass.
- With m2-01 merged and a Supabase project: `supabase db reset` applies both migrations; logged in as a user of company A, `POST /api/documents` with `fixtures/documents/preventivo_gialli_trasporti_2026-087.pdf` answers `201`; the same file again answers `409 duplicate_file`; `GET /api/documents` lists it with `counts.pdf = 1`; `GET /api/documents/:id/download` downloads it with its original name; a user of company B gets `404` on the same id and an empty list; `DELETE` answers `204` and the object disappears from the bucket.

## Out of scope

- The "File caricati" page and the document detail page (m2-03).
- Extraction and the `processing` / `ready` / `failed` states (M3). The table has no update policy until then.
- Files over 4 MB (direct upload to Storage with a signed upload URL), signed FatturaPA (`.p7m`).
- Audit log of uploads and deletions, and the two-tenant isolation test across all tables (M5).

## Outcome

To be filled when the task is merged.
