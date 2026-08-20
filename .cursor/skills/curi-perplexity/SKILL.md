---
name: curi-perplexity
description: Integrates Perplexity with content_cache lookup before any API call. Use for AI generation, citations, lesson feel difficulty modifiers, or lib/ai and lib/cache work.
---

# Curi Perplexity + cache

Read `docs/AI.md` and `docs/CONTENT-CACHE.md`.

## Mandatory order

```
1. Build fingerprint (topic, depth, clarifications, lesson_index, modifier)
2. Lookup content_cache
3. HIT → return payload (no Perplexity)
4. MISS → Perplexity → validate → INSERT cache
```

## Lesson feel → next lesson

| Feel | Modifier |
|---|---|
| too_easy | deeper |
| just_right | baseline |
| too_hard | easier |
| confusing | clearer |

Read prior `lesson_activity.lesson_feel` when serving lesson N+1.

## TDD

- Mock Perplexity only on cache miss tests
- Assert hit_count increment on cache hit
- Assert modifier in fingerprint for L2 after `too_hard` on L1

Server-only. Persist `search_results`.
