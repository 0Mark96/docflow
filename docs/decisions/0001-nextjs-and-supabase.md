# 0001. Next.js and Supabase as application platform

- Status: accepted; the authentication and tenancy parts are superseded by [0004](0004-no-user-login-in-mvp.md)
- Date: 2026-11-06

## Context

The product needs a React UI, a server layer for AI calls and secrets, a relational database, authentication, file storage and per-tenant isolation. The team is small and must deliver an MVP quickly to SMB customers.

## Decision

- **Next.js (App Router)** for UI and server layer in one codebase: Server Components for data loading, Route Handlers and Server Actions for mutations and AI calls.
- **Supabase** for Postgres, Auth, Storage and Row Level Security, with schema changes managed as SQL migrations.

## Consequences

- One repository and one deploy target (Vercel) for frontend and backend.
- Tenant isolation is enforced in Postgres (RLS), independent of application code.
- Most of the data layer is standard Postgres and SQL, so a move to self-hosted Supabase or managed Postgres stays feasible.
- Vendor dependency on Supabase Auth and Storage APIs; kept behind a thin module (`lib/supabase/`) to limit the surface.

## Alternatives considered

- **Separate Node API + React SPA:** more control, two deploys, slower to MVP.
- **Firebase:** fast to start, but a non-relational model fits invoices and contracts worse and has no SQL.
