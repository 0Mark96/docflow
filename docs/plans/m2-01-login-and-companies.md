# Plan m2-01: Login and companies

- Milestone: M2
- Depends on: m1-01
- Status: in progress
- Branch: `claude/project-thread-r7khs2` from `main`

## Goal

A visitor opens `/`, reads what DocFlow does and logs in with a link sent by email. Each user belongs to a company, and the database only shows a user the rows of their own company. The other M2 plans (documents and storage, "File caricati" page) build on the helpers defined here.

## Tasks

1. Supabase local project (`supabase/config.toml`), CLI as a dev dependency, `.env.example` with the two public variables.
2. Migration `companies_and_profiles`: tables `companies` and `profiles`, SQL helper `current_company_id()`, RLS policies, sign-up trigger that creates a company and a profile for every new user.
3. Seed with two synthetic users in two companies; pgTAP tests for tenant isolation, run in CI by a separate `Database` workflow.
4. Supabase clients for server and browser, session refresh and redirects in `src/proxy.ts`.
5. Magic-link login: Server Action that sends the link, email template, `/auth/confirm` route that turns the link into a session, sign-out action.
6. Login page at `/` with the presentation from the mockup (headline, example of an extracted contract, three steps, why trust it) and the login form visible without scrolling.

## Interface for the other plans

| What | Where | Use |
|---|---|---|
| `createSupabaseServerClient()` | `src/lib/supabase/server.ts` | Server Components, Server Actions, Route Handlers. Acts as the logged-in user: RLS applies. |
| `createSupabaseBrowserClient()` | `src/lib/supabase/client.ts` | Client Components. Same rules. |
| `getCurrentUser()` | `src/lib/auth/current-user.ts` | Returns `{ userId, email, companyId, companyName }` or `null`. In Route Handlers answer 401 on `null`. |
| `requireUser()` | `src/lib/auth/current-user.ts` | Same data, redirects to `/` when logged out. Pages, layouts, Server Actions. |
| `signOut` | `src/lib/auth/actions.ts` | Server Action for the "Esci" button. |
| `public.current_company_id()` | migration `20261116000100` | Company of the requesting user, for RLS policies and column defaults. |
| Redirects | `src/proxy.ts` | Logged-out visit to a private page goes to `/`; logged-in visit to `/` goes to `/documents`. `/api/*` is never redirected. |

`getCurrentUser()` and `requireUser()` read cookies: with Cache Components a page or layout must call them inside a `<Suspense>` boundary.

## Verification

- `npx supabase start`, copy `API_URL` and `PUBLISHABLE_KEY` into `.env.local`, `npm run dev`.
- On `http://localhost:3000` the login form is visible without scrolling on desktop and on a phone.
- An invalid email shows "Controlla l'indirizzo email: manca qualcosa."
- A valid email shows "Link inviato a …"; the email arrives in Mailpit (`http://127.0.0.1:54324`); its link opens `/documents`.
- Opening the same link again goes back to `/` with "Il link non è più valido".
- Logged out, `/documents` redirects to `/`. Logged in, `/` redirects to `/documents`.
- `npx supabase test db`: 11 tests pass (each user sees only their company and profile, cannot create or move them, logged-out visitors read nothing).
- `npm run lint`, `npm run type-check`, `npm test`, `npm run build` pass.

## Out of scope

- Choosing or renaming the company during sign-up: a new user gets the placeholder "Azienda di <email>".
- Inviting colleagues into an existing company, roles (after MVP).
- Production email delivery: Supabase's built-in email sender only reaches members of the Supabase project, so before inviting external users configure a custom SMTP provider and set the same email template in the hosted project.
- The interactive "Prova a chiedere" section of the mockup: it needs the questions feature (M4).

## Outcome

To be filled when the task is merged.
