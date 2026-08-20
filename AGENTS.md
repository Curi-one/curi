# Curi — agent orchestration

You are building **Curi**: a daily micro-learning monolith (Next.js + Supabase + Perplexity). Read this file first.

## Manager pattern (default for multi-step work)

Use **`.cursor/skills/curi-manager/`**:

1. **Plan** — slice or task from `docs/ROADMAP.md`  
2. **Delegate** — Task subagent (implementer)  
3. **Verify** — Task subagent (verifier): `pnpm test && pnpm lint && pnpm typecheck`  
4. **Report** — PASS/FAIL; loop fix once if needed  

Full roster: `docs/AGENT-ROSTER.md`.

## Source of truth

| Priority | Document |
|---|---|
| 1 | `docs/DECISIONS.md` |
| 2 | `docs/FLOWS.md` |
| 3 | `docs/PRD.md` |
| 4 | `docs/ARCHITECTURE.md` · `DATA.md` · `AI.md` · `CONTENT-CACHE.md` |
| 5 | `docs/ROADMAP.md` |

Prototypes are visual reference in `prototypes/` — not imported by the app.

## Methodology

**TDD:** `docs/TDD.md` — red → green → refactor.  
**UX:** `docs/UX-PRINCIPLES.md` on every screen change.

## Specialist routing

| Task | Skill |
|---|---|
| Orchestrate | `curi-manager` |
| Slice | `curi-slice` |
| Tests | `curi-tdd` |
| API | `curi-api-endpoint` |
| UX audit | `curi-ux-review` |
| AI / cache | `curi-perplexity` |
| Flow QA | `curi-flow-verify` |

## Invariants

Auth after first quiz · one lesson/path/day · multi-path Today · cache before Perplexity · lesson feel tunes next lesson · free 2 paths.

## Current status

**Slice 1b ✓** — frontend + mock APIs on [stage.curi.one](https://stage.curi.one). 
Track work in Linear **Curi v1** — [`docs/TRACKING.md`](./docs/TRACKING.md). Slice 2+ replaces mock backends.

## Cursor Cloud specific instructions

Single Next.js monolith at repo root. Standard commands live in `package.json` and `README.md` (`pnpm dev` · `pnpm build` · `pnpm test` · `pnpm lint` · `pnpm typecheck`); the update script already runs `pnpm install`. Uses pnpm (pinned via `packageManager`) through corepack; prefix commands with `corepack` (e.g. `corepack pnpm dev`).

- `USE_MOCK_API=true` runs everything against the in-memory mock store (`lib/mock/store.ts`) — no Supabase/Perplexity/Stripe keys are needed for local dev/test/build. `.env.local` (copy from `.env.example`) is optional; empty secret values are fine while mocks are on.
- Mock state is a process-memory singleton keyed by the `curi_session` cookie, seeded with a `member-default` session on construction. It is NOT shared across the dev server and the browser reliably on the *first* hit to a route: `next dev` re-evaluates shared modules the first time a given route is compiled, which resets the singleton. Symptom: a fresh guest "create path → read first lesson" can fail once with "Could not load lesson." right after a cold start because the `/courses/[courseId]/lessons/[index]` route compiles and drops the just-created pending course. Warm the routes first (hit them once, or reload) and the full flow works end-to-end. Prod/staging (a single warm Node/lambda instance) do not hit this because no recompilation occurs.
- `/api/dev/persona` and `/api/dev/seed` are development-only helpers; note `/api/dev/persona` does not set the `curi_session` cookie, so drive persona switching through the UI dev toggle rather than a raw request when you need the cookie to stick.
