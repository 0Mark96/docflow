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
- **Private by default.** No user accounts in the MVP: the browser never queries the database, every read and write runs on the server, and an audit log records uploads, exports and corrections (see [ADR 0004](docs/decisions/0004-no-user-login-in-mvp.md)).

## Tech stack

| Area | Choice |
|---|---|
| Framework | Next.js (App Router), React, TypeScript (strict), Tailwind CSS |
| Data | Supabase: Postgres, Storage, Row Level Security, pgvector |
| AI | Anthropic Claude API, called server-side only |
| Validation | Zod |
| E-invoices | fast-xml-parser (FatturaPA) |
| Testing | Vitest (unit, LLM evals), Playwright (end-to-end) |
| CI/CD | GitHub Actions, Vercel |

Why these choices: [`docs/decisions/`](docs/decisions/).

## Documentation

Start from [`docs/README.md`](docs/README.md).

## Getting started

Setup instructions will be added with milestone 1 (project scaffold).
