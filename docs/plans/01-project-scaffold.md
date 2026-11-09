# Plan 01: Project scaffold (M1)

Branch: `feature/project-scaffold` from `main`.

## Goal

A Next.js + TypeScript strict application that runs locally, with linting, type-checking, unit tests and CI on pull requests, so every following milestone starts from a verified baseline.

## Tasks

1. Create the Next.js app (App Router, TypeScript, ESLint, Tailwind CSS, `src/` directory, import alias `@/*`). `create-next-app` refuses a non-empty folder: generate it in a temporary directory and move the files into the repository root, keeping the existing `docs/`, `README.md`, `CLAUDE.md`, `.github/`, `.gitignore` and `.editorconfig` (merge `.gitignore` entries if needed).
2. Enable `strict` in `tsconfig.json` (and `noUncheckedIndexedAccess`).
3. Add Prettier with an ESLint-compatible config and `prettier-plugin-tailwindcss` (sorts class names); scripts `lint`, `format`, `type-check`.
4. Add Vitest with one sample test for a utility in `src/lib/`; script `test`.
5. Add `.env.example` (empty for now, with a header comment explaining the convention).
6. Add `.github/workflows/ci.yml`: on pull request, install with `npm ci`, run `lint`, `type-check`, `test`.
7. Replace the default home page with a minimal DocFlow placeholder (product name, one-line description). The real home page comes in M2.
8. Update `README.md` (Getting started) and the Commands section of `CLAUDE.md`.

## Verification

- `npm run dev` shows the landing page at `http://localhost:3000`.
- `npm run lint`, `npm run type-check`, `npm test` pass locally.
- The pull request shows the CI check green.

## Out of scope

Supabase, authentication, any AI integration.

## Outcome

_To be filled when the task is merged: what was done, deviations from this plan and why._
