# Plan m2-03: "File caricati" page

- Milestone: M2
- Depends on: m2-01 (login), m2-02 (documents API and storage); built in parallel against the contract in `docs/api/documents.md`
- Status: in progress
- Branch: `claude/project-thread-1wikno` from `main`

## Goal

After login the user lands on "File caricati" (`/documents`): they drop or pick PDF, TXT and FatturaPA XML files, see them in a list that survives reload, filter it by type, open a document's detail page and come back to the same page, filter and row, download or delete files. Layout, labels and states follow `docs/design/mockup.html`.

## Steps

1. **App shell** (`src/app/(app)/layout.tsx`, `src/components/app-shell/`): sidebar with logo, "Carica documenti", menu (File caricati, Tabella dati disabled until M3) and the user block (email, company, "Esci") wired to `requireUser()` and `signOut` from m2-01.
2. **Shared UI** (`src/components/ui/`): `Button` (variants primary, secondary, danger, ghost; sizes sm, md, lg), `Dialog` on the native `<dialog>` element (focus trap and Esc for free), toasts.
3. **Upload**: drop zone and file picker on the page, plus the sidebar button, sharing one upload controller. Client-side checks before sending (extension, empty file, 4 MB), then one `POST /api/documents` per file. Rejected files are listed in one dialog with the server's Italian message; `duplicate_file` links the existing document.
4. **List** (`src/app/(app)/documents/page.tsx`): tabs Tutti, Fatture XML, PDF, Testo, Con errori (shown only when there are failed files), with counts from `counts`. Tab and page live in the URL (`?tipo=pdf&pagina=2`), so reload and Back keep them. Rows: type badge, file name, size, upload date, status, actions (open, download, delete). Multi-select with bulk delete.
5. **States**: empty company ("Non hai ancora caricato documenti"), empty filter ("Nessun documento in questa vista"), loading skeleton, status labels (Caricato, In elaborazione, Pronto, Non elaborato with the error line).
6. **Detail page** (`/documents/[id]`): file name, type, size, date, status, download and delete. The back link returns to the list URL it came from (`?da=`) with `#doc-<id>`, which scrolls to the row and highlights it. A deleted or foreign document shows "Questo documento non esiste più".
7. **Tests**: Vitest for the pure helpers (file checks, URL filter parsing, size and date formatting).

## Verification

- `npm run dev`, log in, open `/documents`: drop the synthetic PDF from `fixtures/`; it appears at the top as "Caricato" and is still there after reload.
- Drop a `.jpg` and a 5 MB PDF: one dialog lists both with the reason; nothing is uploaded.
- Click "PDF", go to page 2, open a document, click "File caricati" in the back link: same tab, same page, the row is highlighted.
- Delete a document from the detail page: back on the list it is gone, with a confirmation toast.
- `npm run lint`, `npm run type-check`, `npm test` pass.

## Out of scope

- "In scadenza" panel, "Da fare" strip, supplier under the file name, "Riprova" on failed files: they need extracted data (M3).
- Bulk download as ZIP, undo after delete (the file is removed from Storage at once).
- Files over 4 MB (direct upload to Storage with a signed URL).

## Outcome

To be filled when the task is merged.
