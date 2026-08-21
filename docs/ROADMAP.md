# Roadmap

Vertical slices only. **Do not start slice N+1 until slice N passes exit criteria on staging.**

---

## Slice 0 — Documentation ✓

PRD, flows, decisions, architecture, data, AI, environments locked.

**Exit:** This folder is internally consistent and approved.

---

## Slice 1 — App skeleton ✓

**Done:**

- Next.js 15 at repo root; TypeScript, ESLint, Vitest, GitHub CI  
- Domain stubs: `fingerprint`, `due-today`, `streak`  
- Vercel project **`curi`** linked to GitHub; **stage.curi.one** on `staging`  
- Prod domains detached until launch  

---

## Slice 1b — Frontend flows + mock APIs ✓

**Done (local + staging mock):**

- All F1–F7 screens wired to `/api/*` mock Route Handlers  
- Zod schemas; in-memory store; Dev persona toggle  
- Deployed on [stage.curi.one](https://stage.curi.one)  

**Tracking:** Linear project [Curi v1](https://linear.app/curi-one/project/curi-v1-05a9e167751d) — see [TRACKING.md](./TRACKING.md).

**Next:** Slice 2 — replace mock handlers with Supabase + Perplexity.

---

## Slice 2 — Clarify, path, guest loop (in progress on staging)

**Done on staging (`USE_MOCK_API=false` Preview):**

- CUR-6 Supabase schema + RLS  
- CUR-7 Perplexity client  
- CUR-8 Real `POST /api/clarify`  
- CUR-9 Cache-first `POST /api/courses` + `pending_courses`  
- CUR-10 Cache-first lesson body `GET .../lessons/:index`  

**Remaining for Slice 2 exit:** smoke F1 through lesson 1 on stage.curi.one (quiz/auth still mock until Slice 3).

**Exit (roadmap):** F1 through lesson 1 on staging without account.

---

## Slice 3 — Quiz, feel, and auth

**Deliver**

- MCQ + cache; per-answer feedback  
- **Lesson feel** screen; stored on `lesson_activity`  
- Modifier passed when loading lesson N+1  
- Auth after quiz; F1 complete on staging  

**Exit**

- Full F1 on staging; test proves `too_hard` on L1 → `easier` modifier on L2 lookup.

## Slice 4 — Multi-path Today, library, explore

**Deliver**

- F2 Today with due/done grouping  
- F3 explore + clarify for catalogue; free cap of 2  
- F4 library + path map  
- Staging seed: three paths, two due  

**Exit**

- F2 and F3 on staging; plan limit blocks 3rd path.

---

## Slice 5 — Progress, profile, upgrade UI

**Deliver**

- F7 progress (streak, heatmap, path list)  
- F6 upgrade screen; server-side plan enforcement  
- Profile + sign out  

**Exit**

- F6–F7 on staging; upgrade shown at limit (Stripe not required yet).

---

## Slice 6 — Stripe

**Deliver**

- Checkout, Customer Portal, webhooks  
- `users.plan` updated from Stripe events  

**Exit**

- Test purchase on staging upgrades plan; 3rd path unlocks.

---

## Slice 7 — Operations

**Deliver**

- Sentry error tracking  
- PostHog events aligned to north star  
- Runbook: deploy, rollback, rotate secrets  

**Exit**

- Errors and key funnel events visible; runbook reviewed.

---

## After v1

Semantic cache matching (similar not identical answers), `/learn` SEO, daily email, flashcards, certificates, PWA.

Not scheduled until v1 exit criteria above are met.
