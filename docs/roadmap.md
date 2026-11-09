# Roadmap

Each milestone ends with merged pull requests, green CI and its exit criteria met. Implementation plans live in [`plans/`](plans/).

| # | Milestone | Exit criteria |
|---|---|---|
| M1 | **Project scaffold** | Next.js + TypeScript strict app runs locally; lint, type-check and Vitest configured; CI on pull requests; `.env.example`; README setup section |
| M2 | **Home, documents and storage** | Home page explaining the product; Supabase project with migrations; upload to private Storage; "File caricati" list survives reload; document detail page; RLS enabled on `documents` with no public access |
| M3 | **Structured extraction** | FatturaPA parser with 100% accuracy on fixtures; LLM extraction for PDF/TXT validated by Zod; "Tabella dati" page with source badge, filters kept in the URL; first eval set (≥ 20 documents) |
| M4 | **Questions with sources** | Chat with cited sources and explicit "not found"; full-text retrieval, then pgvector if evals justify it (ADR); eval set for answers |
| M5 | **Data protection and audit** | Audit log; test that the public key reads no table and no file; signed URLs for downloads; deployment protection documented (no login, ADR 0004) |
| M6 | **Deploy** | Production on Vercel + Supabase EU; environment variables documented; Playwright smoke test against preview deployments |
| M7 | **Hardening** | User corrections of extracted fields; CSV export; cost and token logging; prompt caching; usage limits |

## After MVP

- User login, multiple companies with RLS per company, roles (admin, viewer).
- Generative UI in chat (answers rendered as tables or timelines).
- MCP server exposing the documents to other AI tools.
- Integrations (email inbox ingestion, cloud drives).
