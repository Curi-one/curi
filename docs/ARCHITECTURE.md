# Architecture

Single deployable: **Next.js on Vercel** with Route Handlers, **Supabase** for auth and Postgres, **Perplexity** for AI (server-side only, **cache miss only**).

```
┌─────────┐     ┌──────────────────────────────┐     ┌─────────────┐
│ Browser │────▶│ Next.js (Vercel)             │────▶│ Supabase    │
└─────────┘     │  · RSC / client UI           │     │  · Auth     │
                │  · app/api/*                 │     │  · Postgres │
                │  · content_cache lookup      │     │  · cache    │
                └──────────────┬───────────────┘     └─────────────┘
                               │ cache miss
                               ▼
                ┌──────────────────────────────┐
                │ Perplexity API (Sonar)       │
                └──────────────────────────────┘
```

Cron jobs (email, later) call `/api/cron/*` on the same app.

---

## Logical modules

| Module | Responsibility |
|---|---|
| `auth` | Supabase session, magic link, guest → member migration |
| `clarify` | Topic questions via Perplexity; depth from UI |
| `cache` | Fingerprint → `content_cache` lookup / store |
| `courses` | Create path, plan limits, outline persistence |
| `lessons` | Reader; difficulty modifier from prior `lesson_feel` |
| `quiz` | MCQ + lesson feel submission |
| `activity` | `lesson_activity`, streak calculation |
| `plans` | Free vs Academy enforcement |
| `billing` | Stripe webhooks (later) |
| `catalog` | Static launch topics (v1) |
| `ai` | Perplexity client — invoked only on cache miss |

---

## Content pipeline

| Stage | Source |
|---|---|
| Clarify | Perplexity (not cached) |
| Path outline | `content_cache` → miss → Perplexity → store |
| Lesson body | Cache (+ modifier from prior feel) → miss → Perplexity |
| Quiz MCQ | Cache → miss → Perplexity |
| Lesson feel | App UI → `lesson_activity.lesson_feel` |

See [CONTENT-CACHE.md](./CONTENT-CACHE.md) and [AI.md](./AI.md).

---

## API surface (v1)

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/clarify` | 1–3 topic questions |
| POST | `/api/courses` | Create path; cache-first outline |
| GET | `/api/feed` | Today due/done |
| GET | `/api/courses/:id/lessons/:index` | Lesson body; cache-first |
| GET | `/api/courses/:id/lessons/:index/quiz` | MCQ; cache-first |
| POST | `/api/courses/:id/lessons/:index/quiz` | MCQ answers + **lesson_feel**; complete |
| GET | `/api/library` | Exploring / mastered / shelved |
| POST | `/api/billing/checkout` | Stripe (later) |

Auth: Supabase httpOnly cookies. Guest: `pending_courses`, 24h TTL.

---

## Security

- RLS on user tables; `content_cache` service-role only.  
- Plan limits in Route Handlers.  
- Lesson completion idempotent on `(user_id, course_id, lesson_index)`.  
- Secrets server-only. Rate limits on auth and cache misses.

---

## Scale

Thousands of DAU: horizontal scaling, pooled Postgres, **high cache hit rate** = low LLM spend. No Redis in v1.

Stack: [DECISIONS.md](./DECISIONS.md).
