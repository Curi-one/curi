# Product requirements — v1

**Status:** Locked  
**Audience:** First-time technical founders learning fundraising and deal literacy  
**North star:** Lessons completed per active user per week

---

## Problem

Self-directed learning fails because it demands time blocks people do not have and delivers content without structure. First-time founders face this acutely: term sheets, SAFEs, and cap tables carry real financial cost, yet courses and books go unfinished.

## Solution

Curi is a **daily micro-learning system** — not a course marketplace, chatbot, or newsletter:

**Topic → clarify → path → one lesson per path per day → quiz → streak.**

Users experience substantive lesson 1 **before** creating an account. The habit forms through a single daily return, not binge sessions.

---

## Scope

### In v1

| Capability | Summary |
|---|---|
| Guest loop | Landing → clarify → generating → lesson 1 → quiz → auth → Today |
| Member loop | Today (all paths) → lesson → quiz → complete → Today |
| Clarify | 1–3 Perplexity topic questions + Essentials / Fluent / Thorough depth |
| Paths | Perplexity outline; N lessons within chosen depth band |
| Lessons | Cache-first; Perplexity on miss; modifier from prior lesson feel |
| Quiz | MCQ (cached) + required **lesson feel**; tunes next lesson |
| Explore | Catalogue paths and books → preview → clarify → start |
| Library | Exploring · Mastered · Shelved; path map |
| Progress | Streak, heatmap, path list |
| Profile | Name, email, plan, sign out |
| Billing | Free (2 paths) · Academy $10/mo; Stripe after core loop ships |

### Out of v1

Flashcards, audio, certificates, Rabbit Hole, sequences, daily email, `/learn` SEO site, live regeneration without cache, native apps, microservices.

Detail: [DECISIONS.md](./DECISIONS.md).

---

## Business rules

### Authentication

No account required to read lesson 1. Account required to save progress — prompted after the first quiz. Magic link only.

### Multiple paths

Members may run several paths in parallel. **Today** lists each active path with due/done state. Free users capped at **2 active** paths; shelved paths free a slot.

### Streak

- Increments once per **user** per **local calendar day** when any path’s quiz is completed.  
- Second path completed same day does not add another streak day.  
- **Streak at risk:** streak > 0 and no activity today.

### Quiz

Two steps — both required to complete the lesson:

1. **MCQ** — Perplexity; cached; wrong answers explained, not blocking.  
2. **Lesson feel** — Too easy · Just right · Too hard · Confusing.

Feel on lesson N adjusts difficulty for lesson N+1 via [CONTENT-CACHE.md](./CONTENT-CACHE.md) modifiers.

### Content cache

Same topic + depth + clarify answers → serve outline, lessons, and quizzes from `content_cache` (no API cost). Lazy-generate on first read.

### Citations

AI-generated lessons and factual quiz explanations must link to stored sources. Hand-curated content carries an equivalent static source list. See [AI.md](./AI.md).

---

## Clarify and depth

Full flow: [FLOWS.md](./FLOWS.md#clarify).

After the user names a topic, Perplexity asks **1–3 scoping questions** (what they want to understand). The final screen is always **depth**:

| Slug | Label | Subcopy |
|---|---|---|
| `essentials` | Essentials | Core ideas · about a week |
| `fluent` | Fluent | Enough for real decisions · about two weeks |
| `thorough` | Thorough | Full picture · about a month |

Perplexity sets exact lesson count inside the band and produces lesson titles for the generating screen.

---

## Launch success

1. Guest completes lesson 1 + quiz without an account.  
2. After signup, progress persists; streak = 1.  
3. Next-day return shows correct due/done state.  
4. Member with two paths sees both on Today with accurate status.

---

## Brand

White / ink / vermilion `#C1121F`. Fraunces wordmark, Plus Jakarta Sans body, JetBrains Mono metadata. Calm and editorial — no gamified clutter.

Full spec: [`docs/BRAND.md`](./BRAND.md).
