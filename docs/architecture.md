# Architecture

Status: **as designed**. Update this document when the implementation diverges.

## 1. Overview

```
Browser (React)
   │  HTTPS
   ▼
Next.js on Vercel ─────────────► Anthropic API (extraction, answers)
   │  Server Components,          (server-side only)
   │  Route Handlers,
   │  Server Actions        ─────► Embeddings provider (retrieval)
   ▼
Supabase
   ├─ Postgres  (documents, extracted fields, chunks + pgvector, audit log)
   └─ Storage   (original files, private bucket)
```

The browser talks only to the Next.js server. Every call to Supabase and to an AI provider happens on the server, where the keys live. There are no user accounts in the MVP (ADR 0004).

## 1.1 Pages

| Path | Name in the UI | Content |
|---|---|---|
| `/` | Home | What DocFlow does, in plain words, with a concrete example; leads to the upload |
| `/documents` | File caricati | Upload and list of documents with their status |
| `/documents/[id]` | Document detail | File name, type, status, extracted fields, download |
| `/documents/table` | Tabella dati | Extracted fields of all documents, filter, sort, CSV export |
| `/chat` | Chat | Questions with cited documents |

Filters and sort live in the URL query string, so going back from a document detail restores the list as it was. Styling uses Tailwind; form controls are shared components in `src/components/ui/` (no native `<select>`).

## 2. Data flows

### 2.1 Upload and extraction

1. The user uploads a file. A Server Action validates type and size, stores the file in the private Storage bucket and creates a `documents` row with `status = 'processing'`.
2. The file type decides the extractor:
   - **FatturaPA XML** → deterministic parser (`fast-xml-parser`), mapped to the `ExtractedFields` schema.
   - **PDF / TXT** → text extraction, then an LLM call with a JSON schema; the result is validated with Zod.
3. Fields are stored in `extracted_fields` with `source = 'parser' | 'llm'`. The document becomes `ready` or `failed` with an error message.
4. The text is split into chunks, embedded and stored in `document_chunks` for retrieval.

### 2.2 Questions with sources (RAG)

1. The user asks a question in the chat.
2. The server embeds the question and retrieves the most similar chunks (full-text search first, vector similarity later).
3. The server sends the model a system prompt (answer only from context, cite sources, say when not found), the retrieved chunks and the question.
4. The answer is returned with the cited documents as links.

Retrieval starts with Postgres full-text search and moves to vector search (pgvector) once the evaluation set shows the need (roadmap M4).

## 3. Data model (initial)

| Table | Key columns | Notes |
|---|---|---|
| `documents` | `id`, `file_path`, `file_name`, `kind`, `status`, `error`, `created_at` | `kind`: `fatturapa`, `pdf`, `text` |
| `extracted_fields` | `document_id`, `supplier`, `amount`, `currency`, `due_date`, `source`, `confidence`, `corrected_at` | One row per document (MVP) |
| `document_chunks` | `id`, `document_id`, `content`, `embedding` | |
| `audit_log` | `id`, `action`, `target_id`, `created_at` | Append-only |

## 4. Security

- **Access (ADR 0004):** no login. The browser never queries Supabase: all data access runs on the server with a server-only key. RLS is enabled on every table with no policies for the `anon` and `authenticated` roles, and the Storage bucket is private; files are served through short-lived signed URLs.
- **Deployed app:** protected at the hosting level (Vercel Deployment Protection or an equivalent password gate), because anyone who can open the app can see every document.
- **Secrets:** server-only environment variables; `.env.example` documents them without values.
- **Input validation:** Zod on every Server Action and Route Handler input.
- **LLM output:** schema-validated; never executed, never rendered as HTML.
- **Data sent to AI providers:** only the document text needed for the task. Provider data-retention terms are documented for customers (open point, see roadmap).
- **Audit:** uploads, deletions, exports and corrections are written to `audit_log`.

## 5. Quality

- **Unit tests** (Vitest): parser, schemas, utilities.
- **LLM evals** (Vitest, separate command): a versioned fixture set with expected fields and answers; reports accuracy per field. Run before changing prompts or models.
- **End-to-end** (Playwright): upload → table → question, against a test Supabase project.
- **CI** (GitHub Actions): lint, type-check, unit tests on every pull request. Evals run on demand.

## 6. Open points

- Embeddings provider (Anthropic does not offer an embeddings model): choose in M4 with an ADR.
- Data residency: Supabase EU region; document the AI provider's data handling for customers.
- PDF text extraction library and handling of scanned PDFs (OCR) — decided in M3.
