# 0004. No user login in the MVP

- Status: accepted
- Date: 2026-11-09
- Supersedes: the authentication and tenancy parts of [0001](0001-nextjs-and-supabase.md)

## Context

The original design planned email login, companies and per-company Row Level Security (roadmap M5). The product owner decided that the MVP has no login: the app opens directly on a home page that explains it, and every visitor works on the same set of documents. Login and tenancy added screens, tables and tests before the core value (extraction and questions with sources) was proven.

## Decision

- No Supabase Auth, no login page, no `companies` or `profiles` tables in the MVP. One installation holds one workspace of documents.
- All data access runs on the server (Server Components, Server Actions, Route Handlers) through `src/lib/supabase/` with a server-only key. The browser never queries Supabase.
- Every table enables RLS with no policies for the `anon` and `authenticated` roles, and the Storage bucket is private. A leaked public key reads nothing; files are served through short-lived signed URLs.
- The deployed app is protected at the hosting level (Vercel Deployment Protection or an equivalent password gate) and is not shared publicly while it holds real documents.

## Consequences

- M2–M4 stay small: no auth flows, no per-company filters, no two-tenant tests.
- Anyone who can open the deployed app sees every document, so access control moves to the hosting layer and the audit log records actions without a user.
- Adding login later means new tables (`companies`, `profiles`), a `company_id` column on existing tables with a data migration, and RLS policies per company. That work is listed after the MVP in the roadmap and needs a new ADR.

## Alternatives considered

- **Email login from M2:** isolates data per company from the start, but adds work before the product is validated; rejected by the product owner.
- **Login in M5 as originally planned:** RLS policies written in M2–M4 would have had no user to check and would be rewritten in M5.
