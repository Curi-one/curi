# Data model

PostgreSQL via Supabase. RLS on user tables. **`content_cache` is shared** (service role only). See [CONTENT-CACHE.md](./CONTENT-CACHE.md).

---

## Overview

```
content_cache (shared — fingerprint → payload)

users
 ├── courses
 │    ├── course_lessons
 │    ├── lesson_content (copy or pointer from cache)
 │    ├── quiz_questions
 │    └── lesson_activity (+ lesson_feel)
 ├── user_preferences
 └── pending_courses
```

---

## Shared cache

### `content_cache`

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| cache_key | text | UNIQUE fingerprint |
| cache_type | text | `path_outline` \| `lesson_body` \| `quiz` |
| topic_normalized | text | |
| depth | text | |
| lesson_index | int | nullable |
| difficulty_modifier | text | `baseline` \| `easier` \| `deeper` \| `clearer`; body only |
| payload | jsonb | |
| sources | jsonb | |
| hit_count | int | |
| prompt_version | int | default 1; bump to invalidate |
| created_at | timestamptz | |

No RLS. Read/write via service role in Route Handlers.

---

## User tables

### `users`

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK, FK → auth.users |
| email | text | |
| name | text | |
| plan | text | `free` \| `academy` (legacy `paid` migrated → `academy`) |
| stripe_customer_id | text | nullable; Stripe Customer id |
| timezone | text | IANA |

### `courses`

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → users |
| topic | text | |
| depth | text | `essentials` \| `fluent` \| `thorough` |
| clarifications | jsonb | `[{ question, answer }]` |
| clarifications_fingerprint | text | denormalized for cache lookup |
| status | text | `active` \| `shelved` \| `completed` |
| progress | int | |
| total | int | |
| source | text | `landing` \| `custom` \| `browse` \| `book` |
| created_at | timestamptz | |

### `lesson_activity`

| Column | Type | Notes |
|---|---|---|
| user_id | uuid | |
| course_id | uuid | |
| lesson_index | int | |
| activity_date | date | user local date |
| lesson_feel | text | `too_easy` \| `just_right` \| `too_hard` \| `confusing` |
| created_at | timestamptz | |

Unique: `(user_id, course_id, lesson_index)`.

`lesson_feel` required when marking complete (set at end of quiz).

### `pending_courses`

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| anonymous_id | text | |
| topic | text | |
| depth | text | |
| clarifications | jsonb | |
| clarify_step | int | |
| outline | jsonb | |
| expires_at | timestamptz | |

### `course_lessons` · `lesson_content` · `quiz_questions`

Per-user copies from cache (or cache_key reference). See prior fields in ARCHITECTURE; `lesson_content.sources`, `quiz_questions.explanation` + `source_refs` unchanged.

---

## Derived state

| Concept | Logic |
|---|---|
| **Streak** | Consecutive local dates with ≥1 activity |
| **Due today** | active, no activity today, progress < total |
| **Next lesson modifier** | Map prior row’s `lesson_feel` → CONTENT-CACHE modifier |

---

## Deferred

Stripe columns, flashcards, referrals, semantic similarity matching (v2 — fuzzy cache beyond exact fingerprint).
