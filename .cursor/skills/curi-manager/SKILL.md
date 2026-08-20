---
name: curi-manager
description: Orchestrates Curi build tasks by delegating to specialist agents and running a verification pass before reporting done. Use when starting multi-step implementation, Slice work, or when the user asks for manager agent orchestration.
---

# Curi manager agent

Orchestrator pattern: **plan → implement → verify → report**. Never mark work complete without a verification pass.

## Workflow

```
1. PLAN    — Read ROADMAP slice + DECISIONS; break into 1–3 concrete tasks
2. DELEGATE — Task tool: implementer(s) with narrow prompt + file paths
3. VERIFY  — Task tool: verifier reads diff + runs pnpm test/lint/build
4. REPORT  — Summarize pass/fail; if fail → delegate fix → verify again
```

## Implementer prompt template

```
Curi implementer. Repo: /Users/Muhammad.Awais/Dev/Curi
Read: docs/DECISIONS.md, docs/TDD.md for this task only.
Task: [specific deliverable]
Rules: TDD first, no Vercel/Supabase/Perplexity secrets, update docs if behaviour changes.
Return: files changed, test commands run, exit codes.
```

## Verifier prompt template

```
Curi verifier. Repo: /Users/Muhammad.Awais/Dev/Curi
Task: Verify [task description] was implemented correctly.
Read: docs/FLOWS.md or docs/ARCHITECTURE.md as relevant.
Run: pnpm test && pnpm lint && pnpm exec tsc --noEmit (if package.json exists)
Check: tests exist for new behaviour, no secrets committed, matches spec.
Return: PASS or FAIL with bullet list of gaps.
```

## Specialist routing

| Task type | Delegate to |
|---|---|
| Scaffold / shell | shell subagent |
| Feature + tests | generalPurpose + curi-tdd skill |
| UX screen | generalPurpose + curi-ux-review after verify |
| API route | generalPurpose + curi-api-endpoint |
| Flow compliance | curi-flow-verify after verify |

## Loop limit

Max **2** fix cycles per task. Escalate to user with FAIL report if still broken.

## Current phase

Slice 1 partial: local skeleton without external services until user provides keys.
