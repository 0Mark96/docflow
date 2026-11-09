# 0004. Authentication and tenancy from M2, with a login page that presents the product

- Status: accepted
- Date: 2026-11-09

## Context

The roadmap placed email login, companies and profiles in M5, after extraction (M3) and questions (M4). But M2 already requires RLS on `documents`, and every table added in M3 and M4 must ship with its RLS policies (CLAUDE.md). Without users and companies those policies have nothing to check and would be rewritten in M5. The product owner also wants each demo user's documents kept apart in the database, and a first page that explains what the app does.

## Decision

- Email login (Supabase Auth), `companies`, `profiles` and a SQL helper `current_company_id()` are built in M2, together with the `documents` table. Every later table uses the same helper in its RLS policies.
- The public page at `/` is the login page. It presents the product in plain words with a concrete example, and the login form stays the main action: visible without scrolling on desktop and mobile, never pushed below the presentation.
- Private pages redirect logged-out visitors to `/`. M5 keeps the audit log and the two-tenant isolation test across all tables and Storage.

## Consequences

- From M2 on, every query runs as a real user of a real company, so RLS is tested from the first table.
- M2 is larger (auth, two extra tables, redirects); M5 becomes hardening and audit.
- Tests and fixtures need at least two synthetic companies and users.

## Alternatives considered

- **Login in M5 as originally planned:** RLS policies in M2–M4 would have no user to check.
- **No login in the MVP:** briefly chosen, then dropped because demo users' documents must be kept apart in the database.
- **Separate marketing home and login page:** one more page to build and maintain; the product owner preferred a single first page with the login in front.
