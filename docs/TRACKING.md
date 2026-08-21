# Tracking (Linear)

Delivery tracking lives in Linear — not in ad-hoc GitHub issues.

| | |
|---|---|
| Workspace | [linear.app/curi-one](https://linear.app/curi-one) |
| Team | **Curi** (`CUR`) |
| Project | [**Curi v1**](https://linear.app/curi-one/project/curi-v1-05a9e167751d) |
| Concept doc | [Flows & prototype deltas](https://linear.app/curi-one/document/flows-and-prototype-deltas-bcdd1c648ffe) |

**Spec wins:** `docs/FLOWS.md` / `docs/DECISIONS.md` override `prototypes/` wherever they differ.

## Milestones ↔ roadmap

| Milestone | Roadmap | Status |
|---|---|---|
| Slice 2 — Clarify & guest loop | Slice 2 | Done |
| Slice 3 — Quiz, feel, auth | Slice 3 | Done (API); UI polish backlog |
| Slice 4 — Today, library, explore | Slice 4 | Backlog |
| Slice 5 — Progress & profile | Slice 5 | Backlog |
| Slice 6 — Stripe | Slice 6 | In progress — code done (checkout/portal/webhooks/UI); ops/env (Dashboard + Vercel keys) remaining — [`docs/STRIPE.md`](./STRIPE.md) |
| Slice 7 — Ops & launch | Slice 7 | Backlog |

## API vs UI issues

Slice **1b (CUR-5)** shipped functional mock UI for all v1 screens. Remaining work splits:

| Type | Label | Examples |
|---|---|---|
| Backend / Supabase wiring | `Feature` | CUR-13–16 |
| Prototype-aligned UI polish | `UI` + `Improvement` | CUR-19–31 |
| Explicitly not v1 | `Out of v1` (Canceled) | CUR-32–35 |

## Flow → issue map

| Flow | API | UI |
|---|---|---|
| F1 Landing | — | CUR-19 |
| Clarify + generating | CUR-8–9 ✓ | CUR-20 |
| Lesson + quiz | CUR-10–11 ✓ | CUR-28, CUR-29 |
| Auth | CUR-12 ✓ | CUR-30 |
| F2 Today | CUR-13, CUR-36 | CUR-21, CUR-31 |
| F3 Explore | CUR-14 | CUR-27 |
| F4 Library + path map | CUR-15, CUR-37 | CUR-25, CUR-26, CUR-38 |
| F6 Upgrade | CUR-16, CUR-17 | CUR-24 |
| F7 Progress + profile | CUR-16 | CUR-22, CUR-23 |

## Full issue map

### Done (API + skeleton UI)

| Issue | Topic |
|---|---|
| CUR-5 | Slice 0–1b mock frontend |
| CUR-6 | Supabase schema + RLS |
| CUR-7 | Perplexity client |
| CUR-8 | Clarify API |
| CUR-9 | Path create + guest |
| CUR-10 | Lesson 1 API |
| CUR-11 | Quiz + lesson feel API |
| CUR-12 | Auth after quiz |

### Backlog — API

| Issue | Topic |
|---|---|
| CUR-13 | F2 Today feed (Supabase) |
| CUR-14 | F3 Explore + plan cap |
| CUR-15 | F4 Library + path map API |
| CUR-16 | F6/F7 progress + profile API |
| CUR-17 | Stripe |
| CUR-18 | Ops + prod domains |

### Backlog — UI (prototype chrome)

| Issue | Screen / components |
|---|---|
| CUR-19 | Landing (founder headline, suggestions) |
| CUR-20 | Clarify, DepthPicker, Generating |
| CUR-21 | Today — PathRow, CompleteSheet, empty state |
| CUR-22 | Progress — streak, Heatmap, path list |
| CUR-23 | Profile — account, theme, plan, sign out |
| CUR-24 | Upgrade — Academy pitch |
| CUR-25 | Library — tabs, path cards |
| CUR-26 | Path map — read / today / locked |
| CUR-27 | Explore — Paths/Books, PreviewSheet |
| CUR-28 | Lesson reader — typography, sources |
| CUR-29 | Quiz — QuizFlow, LessonFeel, CompleteSheet |
| CUR-30 | Auth — magic link UI |
| CUR-31 | App shell — TabBar, guest vs member |
| CUR-36 | Staging seed — 3 paths, 2 due |
| CUR-37 | Shelve path (free slot) |
| CUR-38 | Path mastered completion UI |
| CUR-39 | Brand tokens & typography |

### Canceled — prototype only (Out of v1)

| Issue | Prototype |
|---|---|
| CUR-32 | Flashcards |
| CUR-33 | Admin dashboard |
| CUR-34 | Daily email delivery |
| CUR-35 | Audio, tutor, certificates, sequences |

## Labels

- **F1–F7** (group Flow) — one primary flow per issue
- **UI** — prototype-aligned polish
- **Out of v1** — do not build

Agents: link PRs/commits to `CUR-n`. Spec: `docs/FLOWS.md` / `docs/ROADMAP.md`.
