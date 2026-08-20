# Decisions (locked)

**Status:** Locked — August 2026  
Change only by explicit product decision; update this file and cross-references together.

---

## Repository layout

| Path | Role |
|---|---|
| `app/` · `lib/` · `components/` | Production Next.js app (deploy this) |
| `docs/` | Product and engineering spec (this folder) |
| `prototypes/web/` · `prototypes/mobile/` | UX reference only — never imported or deployed |

If a prototype conflicts with `docs/`, **`docs/` wins**.

---

## Product

### Core loop

Topic → clarify → path → one lesson/day/path → quiz → streak.

The aha moment is **reading lesson 1** before an account exists.

### Auth

- Magic link (email + one-time code). No passwords.  
- Gate appears **after the first quiz**, not before lesson 1.  
- Guest pending path TTL: 24 hours; migrated to account on signup.

### Today and daily limits

- **Today** shows every active path, grouped **Still to read** / **Already today**.  
- **One lesson per path per calendar day** (user timezone). Finishing path A does not unlock path A’s next lesson until tomorrow; path B may still be due today.  
- Re-reading today’s lesson is allowed; re-taking the quiz does not advance progress.

### Clarify (replaces prototype onboarding)

Not the prototype’s fixed Why / Angle / Style / Depth wizard.

1. **1–3 topic questions** — Perplexity generates tap-option questions scoped to what the user wants to understand.  
2. **Depth (always last screen)** — user picks one of:

| Slug | Label | Subcopy | Lesson band |
|---|---|---|---|
| `essentials` | Essentials | Core ideas · about a week | 5–9 |
| `fluent` | Fluent | Enough for real decisions · about two weeks | 10–18 |
| `thorough` | Thorough | Full picture · about a month | 19–35 |

Perplexity picks exact lesson count **inside the band** and builds the outline from topic + all answers.

Same clarify flow for: landing, custom path, catalogue/book start (browse does not skip clarify).

### Quiz

- Perplexity MCQ (cached by fingerprint); variable count.  
- After MCQs: **lesson feel** — Too easy / Just right / Too hard / Confusing (required).  
- Wrong MCQ answers still complete lesson; feel adjusts **next** lesson difficulty via cache modifier.  
- Finishing both parts completes the lesson.

### Plans

| Plan | Price | Active paths |
|---|---|---|
| Free | $0 | 2 max |
| Academy | $10/month | Unlimited |

- Custom paths and catalogue/book paths both count toward the free limit.  
- Shelved paths do not count. Starting a 3rd active path → Upgrade.  
- No annual SKU in v1. Lesson quality identical on free and paid.

### Content and AI

- **Provider:** Perplexity API only.  
- **Shared cache:** [CONTENT-CACHE.md](./CONTENT-CACHE.md) — same topic + depth + clarify answers → serve from DB, no API call.  
- **Lazy gen:** lesson body + quiz on first read only.  
- **Difficulty:** lesson feel after quiz tunes next lesson (`easier` / `deeper` / `clearer` / `baseline`).

### v1 out of scope

Flashcards, audio, certificates, Rabbit Hole, learning sequences, daily email, public SEO `/learn` pages, native apps, microservices.

### Defaults

| Topic | Choice |
|---|---|
| Domains | `curi.one` · `staging.curi.one` |
| “Today” timezone | User preference; browser-detected at signup; `Australia/Sydney` for founding account |
| Wrong quiz answers | Lesson still completes |

---

## Engineering

### Repository

- **Name:** `Curi` (this repo).  
- **Shape:** one Next.js deployable (UI + Route Handlers). No separate backend service.  
- **Docs location:** `docs/` at repo root.
- No monorepo workspaces until a second deployable exists.

### Stack

| Layer | Choice |
|---|---|
| App | Next.js (App Router), TypeScript strict |
| UI | Tailwind, brand tokens from prototype |
| Auth & DB | Supabase (Auth + Postgres + RLS) |
| Hosting | Vercel (local · staging · production) |
| AI | Perplexity Sonar online — see [AI.md](./AI.md) |
| Payments | Stripe Checkout + Portal (after core loop) |
| Email | Resend (after v1 core) |
| Errors | Sentry |
| Analytics | PostHog (after core loop) |

### Scale (thousands)

Stateless app on Vercel, pooled Postgres, indexes on hot paths, rate limits on auth and AI calls, aggressive caching of Perplexity responses. No Redis, queues, or replicas in v1.

### Streak

Computed from `lesson_activity`. At most **one streak day per user per local calendar date**.
