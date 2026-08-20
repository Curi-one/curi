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

**Slice 1b ✓** — all v1 frontend flows + mock `/api/*`. Slice 2+ replaces mock backends. Pending deploy when keys added.
