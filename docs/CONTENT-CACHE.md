# Content cache

Shared Postgres cache so **similar paths reuse generated content** without calling Perplexity again. Primary lever for controlling LLM cost at scale.

See also [AI.md](./AI.md) for generation; this doc defines **lookup, keys, and copy-on-hit**.

---

## Principle

**Generate once, serve many.** Two users with the same topic, depth, and equivalent clarify answers should hit the same cached outline, lesson bodies, and quizzes.

Per-user **difficulty tuning** (from lesson feel) uses a separate modifier on the cache key — see [Difficulty adjustment](#difficulty-adjustment).

---

## Cache types

| Type | Stored payload | When lookup runs |
|---|---|---|
| `path_outline` | `{ total, lessons: [{ index, title }] }` | `POST /api/courses` |
| `lesson_body` | `{ body, sources }` | `GET .../lessons/:index` |
| `quiz` | `{ questions: [...] }` | `GET .../lessons/:index/quiz` |

Clarify topic questions stay **uncached** (cheap, short, topic-varying).

---

## Fingerprint (cache key input)

Deterministic hash from:

```typescript
{
  topic_normalized: string;   // lowercase, trim, collapse whitespace
  depth: "essentials" | "fluent" | "thorough";
  clarifications: { question: string; answer: string }[];  // sorted by question text
  lesson_index?: number;      // body + quiz only
  difficulty_modifier?: "baseline" | "easier" | "deeper" | "clearer";  // lesson body only
  cache_type: "path_outline" | "lesson_body" | "quiz";
}
```

**`clarifications_fingerprint`** = SHA-256 of canonical JSON above (excluding modifier for outline/quiz unless specified).

Users who pick the same tap options on clarify → **same fingerprint** → cache hit.

### Normalization rules

- Topic: `" Term Sheets "` → `"term sheets"`  
- Answers: store exact option label chosen (not free text in v1)  
- Sort clarifications by `question` ascending before hash  

### Catalogue topics

Optional `catalogue_slug` in fingerprint when topic comes from Explore — stabilizes spelling (`term-sheets` vs user typo).

---

## Table: `content_cache`

Shared table — **no RLS** (not user-specific). Service role writes; app reads.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| cache_key | text | UNIQUE — hex fingerprint |
| cache_type | text | `path_outline` \| `lesson_body` \| `quiz` |
| topic_normalized | text | for admin/debug |
| depth | text | |
| lesson_index | int | nullable |
| difficulty_modifier | text | default `baseline`; body only |
| payload | jsonb | generated content |
| sources | jsonb | `search_results` snapshot |
| hit_count | int | increment on serve |
| created_at | timestamptz | |

Index: `(cache_type, topic_normalized, depth)`.

---

## Lookup flow

```
Request needs content
  → build fingerprint
  → SELECT content_cache WHERE cache_key = ?
  → HIT:  return payload + sources; hit_count++
  → MISS: call Perplexity → INSERT content_cache → return
```

On path create **hit**: copy outline into `course_lessons` for the user’s `courses` row — user tables stay normalised.

On lesson/quiz **hit**: copy into `lesson_content` / `quiz_questions` for that `course_id` **or** serve directly from cache via join (implementation choice; user row copy simplifies RLS).

---

## Cost expectations

| Scenario | API calls |
|---|---|
| New unique fingerprint, 14-lesson path | 1 outline + up to 14 bodies + 14 quizzes (lazy: only lessons users open) |
| Second user, same fingerprint | 0 if all requested content cached |
| User with `easier` modifier on lesson 5 | Miss on `baseline` key; hit if `easier` variant already generated |

**Lazy generation:** generate lesson body + quiz on **first read**, not at path creation — pay only for lessons actually opened.

---

## Difficulty adjustment

After MCQ quiz, user answers **one feel question** (required to complete):

| UI label | Slug | Next lesson modifier |
|---|---|---|
| Too easy | `too_easy` | `deeper` |
| Just right | `just_right` | `baseline` |
| Too hard | `too_hard` | `easier` |
| Confusing | `confusing` | `clearer` |

Stored on `lesson_activity.lesson_feel`.

When generating or fetching **lesson N+1**:

1. Read `lesson_feel` from lesson N activity.  
2. Map to `difficulty_modifier` for cache lookup.  
3. Cache miss with modifier → Perplexity prompt includes adjustment instructions → store under modifier key.  
4. `just_right` → prefer `baseline` cache (maximum reuse).

Lesson 1 always uses `baseline` (no prior feel).

Quiz cache keys **do not** include difficulty modifier (quiz tests lesson content as read).

---

## Prompt hints (modifier → instruction)

| Modifier | Perplexity instruction (summary) |
|---|---|
| `baseline` | Standard editorial depth for band |
| `easier` | Shorter sentences, define terms, lighter assumed knowledge |
| `deeper` | More nuance, edge cases, less repetition |
| `clearer` | More concrete examples, explicit structure, recap opening |

---

## Invalidation

- v1: **no auto-invalidation** — cache immutable until manual admin purge.  
- Prompt version bump: include `prompt_version` in fingerprint when we change generation logic globally.  
- Do not regenerate on every user feel — only N+1 uses modifier; prior lessons unchanged.

---

## Metrics

Track: cache hit rate, Perplexity spend per new path, `hit_count` by topic. PostHog or simple DB aggregates.

---

## TDD

- Same fingerprint → no Perplexity mock call  
- Different answer → different fingerprint → miss  
- `too_hard` on L1 → L2 lookup uses `easier` modifier key  

See [TDD.md](./TDD.md).
