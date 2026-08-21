# User flows — v1

Visual chrome may follow [`prototypes/web/`](../prototypes/web/) and [`prototypes/mobile/`](../prototypes/mobile/); **logic here overrides** prototypes where they differ.

**Guest** — no session. **Member** — signed in.

---

## Clarify

Runs whenever a user starts a path: landing, custom topic, or catalogue/book.

```
Topic
  → POST /api/clarify
  → 1–3 Perplexity topic questions (tap options, one screen each)
  → Depth screen (fixed UI, always last)
  → Generating
```

### Topic questions (Perplexity)

- Count: **1–3**, chosen by model for the topic.  
- Purpose: clarify **what** the user wants to understand (use case, focus, prior knowledge).  
- Not learning-style trivia from the prototype.

### Depth screen (app UI)

User picks how far the path goes. Perplexity later chooses exact lesson count **within the band**.

| Slug | Label | Subcopy | Lessons |
|---|---|---|---|
| `essentials` | Essentials | Core ideas · about a week | 5–9 |
| `fluent` | Fluent | Enough for real decisions · about two weeks | 10–18 |
| `thorough` | Thorough | Full picture · about a month | 19–35 |

### Generating

```
POST /api/courses (topic + depth + clarifications)
  → cache lookup (path_outline fingerprint)
  → HIT: copy outline from content_cache
  → MISS: Perplexity → store cache → outline
  → stream titles on screen
  → CTA: Read lesson 1
```

### Failure handling

- Clarify API fails → retry once → fallback single topic question + depth screen.  
- Guest refreshes mid-clarify → restore topic and answers if TTL valid.  
- User changes topic after clarify → restart from question 1.

---

## F1 — First visit (guest)

```
Landing
  → enter topic or tap suggestion
Clarify
Generating
Lesson 1
Quiz
  → MCQ (Perplexity, cached by clarify fingerprint)
  → after each MCQ: right/wrong + why + source
  → Lesson feel (required): Too easy | Just right | Too hard | Confusing
Auth (email → code → name if new)
Today
```

| Step | Rules |
|---|---|
| Lesson 1 | No account required |
| Quiz | MCQ then lesson feel; both required to complete; feel tunes next lesson |
| Auth | Pending path attached; progress = 1; streak = 1 |
| After auth | Path marked done today; next lesson tomorrow |

Pending path: 24h TTL on anonymous session. Back from auth after quiz returns to lesson, not landing.

---

## F2 — Daily return (member)

```
Today (chronological lesson feed)
  ├─ Tomorrow     → next lesson preview, locked until local midnight after today’s complete
  ├─ Today        → available (still to read) + completed (re-read)
  ├─ Past         → completed lessons + overdue catch-up if a day was missed
  └─ Streak       → Progress screen
```

**Unlock rule:** one lesson per path per local calendar day. Completing today’s lesson (quiz + feel) moves the path to done for today; the next lesson index unlocks tomorrow. Re-read of completed lessons is always allowed. Reading the next unfinished lesson early returns locked.

**Complete sheet**

| State | CTA |
|---|---|
| Other paths still due | Back to Today |
| All paths done today | Done — next lessons unlock tomorrow |

**Empty Today** → Explore.

### Quiz (all flows)

```
MCQ questions (1 at a time or all visible — pick one in build)
  → feedback per answer
Lesson feel (always last, required)
  Too easy | Just right | Too hard | Confusing
→ Complete sheet → Today
```

Feel on lesson N adjusts cache modifier for lesson N+1. See [CONTENT-CACHE.md](./CONTENT-CACHE.md).

---

## F3 — Explore and new paths

```
Explore (Paths | Books)
  → preview sheet
  → Start
      if free plan && active paths ≥ 2 → Upgrade
      else Clarify → Generating → Lesson 1

Custom path
  → enter topic → Clarify → Generating → Lesson 1
```

Guests starting from Explore follow the same path; auth still gates after first quiz on that path.

Completing the final lesson moves the path to **Mastered** (Library).

Paths and books each carry a `category` (see [DATA.md](./DATA.md#browse-taxonomy)). Explore shows category filter chips (**All** + one per category) alongside search; selecting a category narrows the Paths/Books list without leaving the tab. Search still overrides tab/category grouping.

---

## F4 — Library

| Tab | Action |
|---|---|
| Exploring | Open path map; continue due lesson |
| Mastered | View completion (no certificate PDF in v1) |
| Shelved | View-only path map; restore deferred to v1.1 |

Path map nodes: **read** · **today** (current) · **locked**.

---

## F5 — Auth (other entry)

- Profile → Sign out → Landing (guest).  
- Sign in without pending path → Today (empty or existing paths). Landing **Sign in** / **Sign up** (header) is this entry — guest Start stays the primary CTA.

---

## F6 — Upgrade

Triggered by 3rd active path (free) or Profile → Plan.

Academy · $10/month → Stripe Checkout when billing ships → Today.

Until Stripe: enforce limit in API; plan toggle via seed/admin on staging only.

---

## F7 — Progress and profile

**Progress:** streak count, 26-week heatmap, active and mastered paths.

**Profile:** name, email, theme (system), plan, sign out. Learning and email preferences persist in `user_preferences`. Daily lesson email sends via hourly cron when `email_enabled`, respecting delivery time, weekends, and format.

---

## Navigation

| User | Primary nav |
|---|---|
| Member | Tabs: **Today · Library · Explore**; stack screens for lesson, quiz, clarify, path, progress, profile, upgrade |
| Guest | No tabs until after auth |

---

## Edge cases

| Case | Behaviour |
|---|---|
| Two paths due; finish one | Today shows updated due/done counts |
| Shelve active path | Removes from active count (free limit) |
| Midnight boundary | “Today” uses user timezone, not UTC |
| Repeat quiz on same lesson | No progress or streak change |
| Same clarify answers as earlier user | Cache hit — no Perplexity for outline/body/quiz |
| Lesson 1 feel: Too hard | Lesson 2 fetched with `easier` modifier key |
| Skip feel question | Not allowed — required to complete lesson |
| Last lesson completed | Path → Mastered; removed from Today active list |

---

## Prototype vs product

| Prototype (ignore) | Product |
|---|---|
| Fixed Why / Angle / Style / Depth steps | 1–3 dynamic questions + Essentials / Fluent / Thorough |
| Intro / Standard / Deep dive | Essentials / Fluent / Thorough |
| Browse skips onboarding | Catalogue start runs clarify |
| Single-path Today hero | All active paths on Today |
| Fixed 7 / 14 / 30 lessons | N within depth band |
