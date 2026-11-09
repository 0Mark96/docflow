# Plans

One plan per task. A milestone can be split into several small plans when each part can be tested on its own and lands in its own pull request.

## Naming

`m<milestone>-<NN>-<short-name>.md`, for example `m2-01-login-and-companies.md`. The milestone comes first, so the plans of one milestone sit together in the file list; `NN` is the order inside the milestone.

Every plan starts with:

```
- Milestone: M2
- Depends on: m2-01 (or "none")
- Status: to do | in progress | done
- Branch: feature/<short-name> from main
```

The status lives in the plan, not in this index, so parallel tasks never edit the same file.

## Index

Planned tasks (files are written by the task itself, before the code):

| Plan | Milestone | Depends on |
|---|---|---|
| [`m1-01-project-scaffold`](m1-01-project-scaffold.md) | M1 | none |
| `m2-01-login-documents-and-storage` | M2 | m1-01 |
| `m2-02-login-page` | M2 | m2-01 |
| `m3-01-extraction-contract` | M3 | m2-01 |
| `m3-02-fatturapa-parser` | M3 | m3-01 |
| `m3-03-llm-extraction` | M3 | m3-01 |
| `m3-04-data-table` | M3 | m3-01 |
| `m3-05-extraction-pipeline` | M3 | m3-02, m3-03, m3-04 |
| `m4-01-questions-with-sources` | M4 | m3-05 |
| `m4-02-answer-evals` | M4 | m3-05 |
| `m5-01-tenancy-hardening-and-audit` | M5 | m4-01 |
| `m6-01-preview-deploys` | M6 | m3-01 |
| `m7-01-ai-cost-and-limits` | M7 | m4-01 |
| `m7-02-export-and-corrections` | M7 | m5-01 |

`m6-01` runs early, in parallel with M3, so every pull request gets a preview link; production goes live at the end of M6.

## Waves: what can run in parallel

A wave starts when the pull requests of the previous wave are merged. Plans in the same wave touch different files and can be worked on at the same time. Until M3, work one plan at a time.

| Wave | Plans | Mode |
|---|---|---|
| 1 | m1-01 | alone |
| 2 | m2-01 | alone |
| 3 | m2-02 (login page), m3-01 (extraction contract) | parallel |
| 4 | m3-02, m3-03, m3-04, m6-01 | parallel |
| 5 | m3-05 (extraction pipeline) | alone: it joins m3-02, m3-03 and m3-04 |
| 6 | m4-01, m4-02 | parallel |
| 7 | m5-01, m7-01, then m7-02 | m7-02 after m5-01 (it writes to the audit log) |

### Files that two parallel plans can both touch

| File | Rule |
|---|---|
| `supabase/migrations/` | Only one plan per wave creates tables. In wave 7, m5-01 and m7-01 touch different tables; the one merged second rebases. |
| `src/lib/supabase/database.types.ts` | Regenerated only by the plan that adds a migration; after a rebase, regenerate it, never merge it by hand. |
| `package.json`, `package-lock.json` | M3 dependencies are installed all at once by m3-01. A plan that needs another one says so in its PR. |
| `src/lib/extraction/schema.ts` | Read-only in wave 4. If it must change, stop and ask. |
| `src/lib/ai/` | Written by m3-03 (wave 4) and m7-01 (wave 7), never at the same time. |
| `docs/architecture.md`, `docs/roadmap.md` | Each plan edits only the section of its own milestone. |

Merge the pull requests of a wave one at a time, and after each merge ask the open ones to rebase on `main` and rerun the tests.

## Finished plans

A plan with `Status: done` is history, not an instruction. When a whole milestone is done, check that what matters is in `docs/architecture.md` or in a decision (`docs/decisions/`), then move its plans to `docs/plans/archive/` with `git mv`. The git history keeps them anyway.

## Templates

**Small plan** (one page, one visible change):

```
# Plan m3-04: Data table

- Milestone: M3
- Depends on: m3-01
- Status: to do
- Branch: feature/data-table from main

## Goal
One or two sentences: what the user sees when it is done.

## Steps
1. …
2. …
3. …

## Verification
- What to open or run, and the expected result.

## Outcome
To be filled when the task is merged.
```

**Full plan** (database, security or several pages): the same header, then Goal, Tasks, Verification, Out of scope and Outcome, as in [`m1-01-project-scaffold`](m1-01-project-scaffold.md).
