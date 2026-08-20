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
| Slice 2 — Clarify & guest loop | Slice 2 | Done (100%) |
| Slice 3 — Quiz, feel, auth | Slice 3 | In progress |
| Slice 4 — Today, library, explore | Slice 4 | Backlog |
| Slice 5 — Progress & profile | Slice 5 | Backlog |
| Slice 6 — Stripe | Slice 6 | Backlog |
| Slice 7 — Ops & launch | Slice 7 | Backlog |

## Flow → issue map

| Flow | Issues | Notes |
|---|---|---|
| Clarify + F1 guest | CUR-8–12 | Auth after quiz; no tabs until member |
| F2 Today | CUR-13 | Multi-path; quiz shared with CUR-11 |
| F3 Explore | CUR-14 | Catalogue **always** clarifies (not prototype skip) |
| F4 Library | CUR-15 | Path map: read · today · locked |
| F5 Auth | CUR-12 | Also completes F1 |
| F6 Upgrade | CUR-16 UI, CUR-17 Stripe | Free cap of 2 |
| F7 Progress | CUR-16 | Streak + heatmap; no flashcards/email in v1 |

## Issue map

| Issue | Topic | Status |
|---|---|---|
| CUR-5 | Done — Slice 0–1b mock frontend | Done |
| CUR-6 | Supabase schema + RLS | Done |
| CUR-7 | Perplexity server client | Done |
| CUR-8 | F1 Clarify API | Done |
| CUR-9 | F1 Path create + guest pending | Done |
| CUR-10 | F1 Lesson 1 | Done |
| CUR-11 | Quiz + lesson feel modifier | In Progress |
| CUR-12 | Auth after quiz | Todo |
| CUR-13 | F2 Today | Backlog |
| CUR-14 | F3 Explore + plan cap | Backlog |
| CUR-15 | F4 Library | Backlog |
| CUR-16 | F6/F7 Progress & profile | Backlog |
| CUR-17 | Stripe | Backlog |
| CUR-18 | Ops + prod domains | Backlog |

## Labels

Team labels **F1–F7** (group **Flow**) — one primary flow label per issue (Linear groups are exclusive). Use issue body for secondary flows.

## Prototype deltas (do not implement)

| Prototype | Product |
|---|---|
| Why / Angle / Style / Depth wizard | 1–3 dynamic questions + Essentials / Fluent / Thorough |
| Intro / Standard / Deep dive (7/14/30) | Lesson count **within** depth band |
| Browse skips onboarding | Catalogue start runs clarify |
| Single-path Today hero | All active paths on Today |
| Flashcards, daily email, certificates, Rabbit Hole | Out of v1 |

Agents: prefer linking PRs/commits to `CUR-n`. Spec remains `docs/FLOWS.md` / `docs/ROADMAP.md`.
