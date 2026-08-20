# Roadmap

Vertical slices only. **Do not start slice N+1 until slice N passes exit criteria on staging.**

---

## Slice 0 — Documentation ✓

PRD, flows, decisions, architecture, data, AI, environments locked.

**Exit:** This folder is internally consistent and approved.

---

## Slice 1 — App skeleton (partial ✓)

**Done (local, no external services):**

- Next.js 15 at repo root; `docs/` at repo root  
- TypeScript strict, ESLint, Vitest, GitHub CI  
- `app/page`, `app/(app)/today`, `app/api/health`  
- Domain stubs: `fingerprint`, `due-today`, `streak` + tests  
- `.env.example` (empty placeholders)

**Remaining (when you add keys):**

- Vercel projects · Supabase auth · deploy staging · sign in/out

---

## Slice 1b — Frontend flows + mock APIs ✓

**Done (local, mock store only):**

- All F1–F7 screens wired to `/api/*` mock Route Handlers  
- Zod schemas in `lib/api/schemas.ts`; in-memory store in `lib/mock/store.ts`  
- Guest F1: landing → clarify → generating → lesson → quiz → feel → auth → Today  
- Member: Today (due/done), Explore, Library, Progress, Profile, Upgrade  
- Dev persona toggle (Guest / Member)  
- Tests: store, API route, DepthPicker, TodayView  

**Exit:** Walk every flow in `pnpm dev` without external services.

**Next:** Replace mock handler bodies slice-by-slice (Slice 2+); UI stays stable.

---

## Slice 2 — Clarify, path, guest loop

**Deliver**

- `POST /api/clarify` — 1–3 topic questions  
- Depth screen (Essentials / Fluent / Thorough)  
- `POST /api/courses` — **cache-first** outline; Perplexity on miss  
- `content_cache` table + fingerprint helper  
- Lesson 1 read — cache-first (baseline modifier)  
- `pending_courses` + guest cookie  

**Exit**

- F1 through lesson 1 on staging without account.

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
