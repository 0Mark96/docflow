# Roadmap

Each milestone ends with merged pull requests, green CI and its exit criteria met. Implementation plans live in [`plans/`](plans/).

| # | Milestone | Exit criteria |
|---|---|---|
| M1 | **Project scaffold** | Next.js + TypeScript strict app runs locally; lint, type-check and Vitest configured; CI on pull requests; `.env.example`; README setup section |
| M2 | **Login, documents and storage** | Login page that also presents the product; email login (Supabase Auth); `companies` and `profiles`; Supabase project with migrations; upload to private Storage under the company's folder; "File caricati" list survives reload; document detail page; RLS per company on `documents` and Storage (ADR 0004) |
| M3 | **Structured extraction** | FatturaPA parser with 100% accuracy on fixtures; LLM extraction for PDF/TXT validated by Zod; "Tabella dati" page with source badge, filters kept in the URL; first eval set (≥ 30 synthetic documents, accuracy per field, zero invented values), run in CI on prompt, model or schema changes |
| M4 | **Questions with sources** | Chat with cited sources and explicit "not found"; full-text retrieval, then pgvector if evals justify it (ADR); eval set for answers |
| M5 | **Tenancy hardening and audit** | RLS reviewed on every table and Storage; audit log; two-tenant isolation test across all pages and files; unauthenticated requests receive 401; deleting a document removes file, fields and chunks (ADR 0008) |
| M6 | **Deploy** | Production on Vercel + Supabase EU; environment variables documented; sub-processor page and AI provider terms recorded (ADR 0008); Playwright smoke test against preview deployments |
| M7 | **Hardening** | User corrections of extracted fields; CSV export; cost and token logging; prompt caching; usage limits |

## After MVP

- Roles within a company (admin, viewer).
- Generative UI in chat (answers rendered as tables or timelines).
- MCP server exposing company documents to other AI tools.
- Integrations (email inbox ingestion, cloud drives).
