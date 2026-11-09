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

## How we work

Two places, two jobs:

- **Claude desktop** is for deciding and planning: what to build next, in which order, what to change in the roadmap. It also runs cloud threads, which work on their own and open a pull request.
- **The chat in VS Code** is for building and trying on your own computer: you see the app at `http://localhost:3000` and fix what does not work.

For each task:

1. Pick the next task in [`docs/roadmap.md`](docs/roadmap.md).
2. Read or write its plan in [`docs/plans/`](docs/plans/README.md) (naming, index and which plans can run in parallel are there).
3. Ask Claude to run the plan, one step at a time. Read what it did.
4. Open a pull request, check that CI is green, merge it.
5. Before switching between the two places, make sure everything is in a pull request and run `git pull` on the other side.

Work on one task at a time until M3; parallel threads come after, as described in the plans README.

## Getting started

Setup instructions will be added with milestone 1 (project scaffold).
