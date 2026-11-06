# Roadmap

Each milestone ends with merged pull requests, green CI and its exit criteria met. Implementation plans live in [`plans/`](plans/).

| # | Milestone | Exit criteria |
|---|---|---|
| M1 | **Project scaffold** | Next.js + TypeScript strict app runs locally; lint, type-check and Vitest configured; CI on pull requests; `.env.example`; README setup section |
| M2 | **Documents and storage** | Supabase project with migrations; upload to private Storage; document list survives reload; RLS on `documents` |
| M3 | **Structured extraction** | FatturaPA parser with 100% accuracy on fixtures; LLM extraction for PDF/TXT validated by Zod; data table with source badge; first eval set (≥ 20 documents) |
| M4 | **Questions with sources** | Chat with cited sources and explicit "not found"; full-text retrieval, then pgvector if evals justify it (ADR); eval set for answers |
| M5 | **Authentication and tenancy** | Email login; companies and profiles; RLS on every table and Storage; audit log; two-tenant isolation test |
| M6 | **Deploy** | Production on Vercel + Supabase EU; environment variables documented; Playwright smoke test against preview deployments |
| M7 | **Hardening** | User corrections of extracted fields; CSV export; cost and token logging; prompt caching; usage limits |

## After MVP

- Roles within a company (admin, viewer).
- Generative UI in chat (answers rendered as tables or timelines).
- MCP server exposing company documents to other AI tools.
- Integrations (email inbox ingestion, cloud drives).
