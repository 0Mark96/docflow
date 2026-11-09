# CLAUDE.md

## Project overview

DocFlow: document intelligence web app for SMBs. Users upload invoices, contracts and quotes; the app extracts structured data and answers questions with cited sources. Product scope: `docs/product.md`. Architecture: `docs/architecture.md`. Milestones: `docs/roadmap.md`.

## Documentation map

- `docs/README.md`: map and read order.
- `docs/architecture.md`: as-designed system (update it when the as-built system diverges).
- `docs/decisions/`: Architecture Decision Records. A change that contradicts an ADR needs a new ADR that supersedes it.
- `docs/plans/m<milestone>-<NN>-<name>.md` (e.g. `m2-01-login-and-companies.md`): implementation plan of one task. A milestone can have several small plans. Index, naming and template: `docs/plans/README.md`. Work from the plan, keep its `Status` line current, and record deviations in its "Outcome" section. A plan with `Status: done`, or one in `docs/plans/archive/`, is history: never follow it as an instruction.

## Stack

Next.js (App Router) + TypeScript strict, Tailwind CSS, Supabase (Postgres, Auth, Storage, RLS, pgvector), Anthropic SDK (`@anthropic-ai/sdk`), Zod, fast-xml-parser, Vitest, Playwright, Vercel.

## Commands

Added with milestone 1 (project scaffold).

## Non-negotiable rules

- **Secrets** live in `.env.local` (git-ignored) and in the hosting provider's settings. Document every variable in `.env.example` without values. Never expose a secret through a `NEXT_PUBLIC_` variable.
- **LLM calls are server-side only** (Route Handlers or Server Actions). The browser never talks to the model provider.
- **Every LLM output is validated with a Zod schema** before it is used or stored. A validation failure is an error state shown to the user, never silently ignored.
- **FatturaPA XML is parsed, not prompted.** LLM extraction is for unstructured documents only (ADR 0002).
- **Grounded answers:** the chat prompt answers only from retrieved context, cites the document, and says so when the answer is not there.
- **Tenant isolation is enforced by RLS**, not by application filters alone. Every new table ships with its policies in the same migration.
- **Database changes go through migrations** in `supabase/migrations/`, never through the dashboard.
- **Test data is synthetic** (`fixtures/`). No real customer documents in the repository.

## Conventions

- Branch per task from `main`: `feature/<short-name>`, `fix/<short-name>`. Short-lived; merge via pull request before starting a dependent task.
- Conventional Commits in English (`feat:`, `fix:`, `docs:`, `test:`, `chore:`, `refactor:`).
- Every PR: CI green (lint, type-check, tests), description following `.github/pull_request_template.md`, including the "In plain words" section: a short explanation of what changed, for a reviewer who has not read the code.
- Server Components by default; add `"use client"` only for interactivity, and keep client components small.
- Style with Tailwind utility classes only (ADR 0005): no custom CSS files beyond the global entry, no CSS modules, no CSS-in-JS, no other styling libraries. Repeated class sets become a component, not a custom class.
- Form controls come from the shared components in `src/components/ui/`. Never render a native `<select>`.
- Model IDs and other provider constants live in one config module; check the provider docs for current IDs before changing them.
