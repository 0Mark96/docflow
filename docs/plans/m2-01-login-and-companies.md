# Plan m2-01: Login and companies

- Milestone: M2
- Depends on: m1-01
- Status: to do
- Branch: `feature/m2-login` from `main`

## Goal

A visitor opens `/`, reads what DocFlow does and logs in with a one-time link sent by email (no password). Each user belongs to a company, and the database shows a user only the rows of their own company. The next M2 plans (documents and storage, "File caricati" page) build on the helpers defined here.

## Tasks

1. **Local Supabase.** Supabase CLI as a dev dependency, `supabase/config.toml` (local stack in Docker: Postgres, Auth, Storage, Mailpit). `.env.example` lists `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` without values. A hosted Supabase project is not needed until M6.
2. **Migration `companies_and_profiles`.** Tables `companies` and `profiles`; SQL helper `current_company_id()`; RLS policies on both tables; a trigger on sign-up that creates a company (placeholder name "Azienda di <email>") and a profile for every new user.
3. **Seed and database tests.** `supabase/seed.sql` with two synthetic users in two companies. pgTAP tests in `supabase/tests/` for tenant isolation (each user sees only their company and profile, cannot create or move them; logged-out visitors read nothing). A separate CI workflow runs them when `supabase/` changes.
4. **Supabase clients and redirects.** Server and browser clients in `src/lib/supabase/`; session refresh and redirects in `src/proxy.ts` (Next.js 16 name for middleware: check `node_modules/next/dist/docs/`). Logged-out visit to a private page goes to `/`; logged-in visit to `/` goes to `/documents`; `/api/*` is never redirected.
5. **Magic-link login.** Server Action that validates the email with Zod and asks Supabase Auth to send the link; email template in Italian; route `/auth/confirm` that turns the link into a session; `signOut` Server Action.
6. **Login page at `/`.** Presentation from the mockup (headline, example of an extracted contract, three steps, why trust it) beside the login form. The form is the main action: visible without scrolling on desktop and mobile. Form controls from `src/components/ui/` (ADR 0005).
7. **Docs.** Login flow in `docs/architecture.md`, Supabase commands in `CLAUDE.md` and `README.md`.

## Interface for the next plans

| What | Where | Use |
|---|---|---|
| `createSupabaseServerClient()` | `src/lib/supabase/server.ts` | Server Components, Server Actions, Route Handlers. Acts as the logged-in user: RLS applies. |
| `createSupabaseBrowserClient()` | `src/lib/supabase/client.ts` | Client Components. Same rules. |
| `getCurrentUser()` | `src/lib/auth/current-user.ts` | Returns `{ userId, email, companyId, companyName }` or `null`. Route Handlers answer 401 on `null`. |
| `requireUser()` | `src/lib/auth/current-user.ts` | Same data; redirects to `/` when logged out. Pages, layouts, Server Actions. |
| `signOut` | `src/lib/auth/actions.ts` | Server Action for the "Esci" button. |
| `public.current_company_id()` | migration | Company of the requesting user, for RLS policies and column defaults. |

## Verification

- `npx supabase start`, copy `API_URL` and `PUBLISHABLE_KEY` from `npx supabase status` into `.env.local`, `npm run dev`.
- On `http://localhost:3000` the login form is visible without scrolling on desktop (1280×800) and on a phone (390×844).
- An invalid email shows an Italian error message next to the field.
- A valid email shows "Link inviato a …"; the email arrives in Mailpit (`http://127.0.0.1:54324`); its link logs in and opens `/documents` (a 404 until m2-03 is done: expected).
- Opening the same link again goes back to `/` with "Il link non è più valido".
- Logged out, `/documents` redirects to `/`. Logged in, `/` redirects to `/documents`.
- `npx supabase test db` passes; `npm run lint`, `npm run type-check`, `npm test`, `npm run build` pass.

## Out of scope

- Choosing or renaming the company during sign-up; inviting colleagues; roles (after MVP).
- Production email delivery: Supabase's built-in sender only reaches members of the Supabase project. A custom SMTP provider is configured before external users are invited (M6).
- The interactive "Prova a chiedere" section of the mockup: it needs the questions feature (M4).

## Outcome

To be filled when the task is merged.
