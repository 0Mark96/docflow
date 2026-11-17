# Plan m2-03: "File caricati" page

- Milestone: M2
- Depends on: m2-01 (login, `requireUser()`, `signOut`), m2-02 (documents API, `docs/api/documents.md`)
- Status: to do
- Branch: `feature/m2-uploaded-files-page` from `main`

## Goal

After login the user lands on "File caricati" (`/documents`): they drop or pick PDF, TXT and FatturaPA XML files, see them in a list that survives reload, filter it by type, open a document's detail page and come back to the same tab, page and row, download or delete files. Layout, labels and states follow `docs/design/mockup.html`.

## Steps

1. **App shell** (`src/app/(app)/layout.tsx`, `src/components/app-shell/`): sidebar with logo, "Carica documenti", menu (File caricati; Tabella dati disabled until M3) and the user block (email, company, "Esci").
2. **Shared UI** (`src/components/ui/`): `Button` (variants primary, secondary, danger, ghost), `Dialog`, toasts. Tailwind only (ADR 0005).
3. **Upload:** drop zone and file picker, plus the sidebar button, sharing one upload controller. Checks in the browser before sending (extension, empty file, 4 MB), then one `POST /api/documents` per file. Rejected files are listed in one dialog with the server's Italian message; a duplicate links the existing document.
4. **List** (`src/app/(app)/documents/page.tsx`, Server Component): tabs Tutti, Fatture XML, PDF, Testo, Con errori (only when there are failed files), with counts. Tab and page live in the URL (`?tipo=pdf&pagina=2`), so reload and Back keep them. Rows: type badge, file name, size, upload date, status, actions (open, download, delete).
5. **States:** empty company ("Non hai ancora caricato documenti"), empty filter ("Nessun documento in questa vista"), loading skeleton, status labels.
6. **Detail page** (`/documents/[id]`): file name, type, size, date, status, download and delete. The back link returns to the list URL it came from, scrolls to the row and highlights it. A deleted or foreign document shows "Questo documento non esiste più".
7. **Tests:** Vitest for the pure helpers (file checks, URL filter parsing, size and date formatting).

## Verification

- `npm run dev`, log in, open `/documents`: drop the synthetic PDF from `fixtures/documents/`; it appears at the top and is still there after reload.
- Drop a `.jpg` and a 5 MB PDF: one dialog lists both with the reason; nothing is uploaded. Drop the same PDF again: the dialog links the existing document.
- Click "PDF", go to page 2, open a document, use the back link: same tab, same page, the row is highlighted.
- Delete a document from the detail page: back on the list it is gone, with a confirmation toast.
- `npm run lint`, `npm run type-check`, `npm test` pass.

## Out of scope

- "In scadenza" panel, "Da fare" strip, supplier under the file name, "Riprova" on failed files: they need extracted data (M3).
- Bulk download as ZIP, undo after delete.
- Files over 4 MB.

## Outcome

To be filled when the task is merged.
