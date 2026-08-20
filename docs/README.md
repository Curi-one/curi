# Documentation

Canonical product and engineering spec for **Curi**. The production app lives at repo root; prototypes live in [`../prototypes/`](../prototypes/).

## Reading order

| # | Document | Purpose |
|---|---|---|
| 1 | [PRD.md](./PRD.md) | Scope, rules, launch success |
| 2 | [FLOWS.md](./FLOWS.md) | User behaviour (implementation spec) |
| 3 | [DECISIONS.md](./DECISIONS.md) | Locked choices |
| 4 | [ARCHITECTURE.md](./ARCHITECTURE.md) | System shape, API |
| 5 | [DATA.md](./DATA.md) | Database entities |
| 6 | [CONTENT-CACHE.md](./CONTENT-CACHE.md) | LLM cost control |
| 7 | [AI.md](./AI.md) | Perplexity integration |
| 8 | [ENVIRONMENTS.md](./ENVIRONMENTS.md) | local · staging · production |
| 9 | [ROADMAP.md](./ROADMAP.md) | Implementation slices |
| 10 | [TDD.md](./TDD.md) | Test-driven development |
| 11 | [BRAND.md](./BRAND.md) | Brand, design tokens, component specs |
| 12 | [UX-PRINCIPLES.md](./UX-PRINCIPLES.md) | Mental models, behavioural UX |
| 13 | [AGENT-ROSTER.md](./AGENT-ROSTER.md) | Cursor / Claude agents |
| 14 | [TRACKING.md](./TRACKING.md) | Linear project & issue map |

Agents: [`../AGENTS.md`](../AGENTS.md) · skills in [`.cursor/skills/`](../.cursor/skills/)

**Live staging:** [stage.curi.one](https://stage.curi.one) · **Linear:** [Curi v1](https://linear.app/curi-one/project/curi-v1-05a9e167751d)

## vs prototypes

| | `docs/` | `prototypes/` |
|---|---|---|
| **Role** | What to build | How it might look |
| **Wins on** | Behaviour, data, API | Visual polish only |
| **Deploy** | N/A (spec) | Never |

If a prototype conflicts with this folder, **`docs/` wins**.

## Brand assets

Visual system: [BRAND.md](./BRAND.md) — brand, tokens, and component specs. Binding on all UI.
