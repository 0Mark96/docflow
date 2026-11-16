# DocFlow

Document intelligence for small and medium businesses: upload invoices, contracts and quotes, get their key data in a structured table, and ask questions in plain language with answers that cite the source document.

> **Status:** early development. The architecture and roadmap are defined in [`docs/`](docs/); the application is being built milestone by milestone (see [`docs/roadmap.md`](docs/roadmap.md)).

## The problem

Small businesses keep contracts, quotes and invoices scattered across inboxes and shared folders. Finding a contract's end date or the total owed to a supplier means opening files one by one, and key data is copied into spreadsheets by hand.

## What DocFlow does

- **Structured extraction.** Supplier, amount, due date and other fields are extracted into a table you can filter and export.
  - Italian e-invoices (FatturaPA XML) are parsed deterministically: no AI, no guesswork.
  - Unstructured documents (contracts, quotes, PDFs) are processed by an LLM with schema-validated output.
- **Questions with sources.** "When does the Bianchi contract end?" → "31/03/2027 — *contratto_bianchi.pdf*, art. 4". When the answer is not in the documents, DocFlow says so.
- **Multi-tenant by design.** Each company sees only its own documents, enforced at database level (Row Level Security), with an access log.

## Tech stack

| Area | Choice |
|---|---|
| Framework | Next.js (App Router), React, TypeScript (strict), Tailwind CSS |
| Data | Supabase: Postgres, Auth, Storage, Row Level Security, pgvector |
| AI | Anthropic Claude API, called server-side only |
| Validation | Zod |
| E-invoices | fast-xml-parser (FatturaPA) |
| Testing | Vitest (unit, LLM evals), Playwright (end-to-end) |
| CI/CD | GitHub Actions, Vercel |

Why these choices: [`docs/decisions/`](docs/decisions/).

## Documentation

Start from [`docs/README.md`](docs/README.md).

## Getting started

Requirements: Node.js 24, npm and Docker (for the local Supabase stack).

```bash
git clone https://github.com/0Mark96/docflow.git
cd docflow
npm install
npx supabase start           # local Postgres, Auth, Storage and Mailpit, with migrations and seed
cp .env.example .env.local   # fill in API_URL and PUBLISHABLE_KEY printed by `npx supabase status`
npm run dev
```

The app runs at <http://localhost:3000>. Log in with a synthetic seed user (`anna@officina-esempio.test` or `luca@studio-demo.test`, two different companies) or any email: the login link arrives in the local mailbox at <http://127.0.0.1:54324>. `npx supabase test db` runs the database tests; `npx supabase stop` stops the stack. `npm install` also installs a Git pre-commit hook that lints and formats staged files and type-checks the project.

Common scripts: `npm run lint`, `npm run type-check`, `npm test`, `npm run format`. The full list is in [`CLAUDE.md`](CLAUDE.md#commands).
