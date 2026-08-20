# AI — Perplexity

Server-side **[Perplexity API](https://docs.perplexity.ai)** only. Citations via `search_results`.

**Cost control:** always check [CONTENT-CACHE.md](./CONTENT-CACHE.md) before any paid call. Cache hit = no API request.

---

## Tasks

| Task | Cache? | Citations |
|---|---|---|
| Clarify (1–3 topic Q) | No — cheap | No |
| Path outline | **Yes** — fingerprint | Optional |
| Lesson body | **Yes** — fingerprint + modifier | Required |
| Quiz | **Yes** — fingerprint | Required on explanations |

Never expose `PERPLEXITY_API_KEY` to the browser.

---

## API

Sonar chat completions (`POST https://api.perplexity.ai/chat/completions`).

Parse `choices[0].message.content` + `search_results[]`. Wrap in `lib/ai/client.ts` (Sonar → Agent API migration before Sep 2026).

---

## Generation pipeline

```
1. Build fingerprint (topic, depth, clarifications, lesson_index, modifier)
2. SELECT content_cache → HIT: return
3. MISS: Perplexity → validate Zod → INSERT content_cache → return
```

Lazy: generate lesson body + quiz on first access, not at path creation.

---

## Clarify

Input: `{ topic, catalogue_slug? }`

Output: 1–3 questions `{ id, text, options[] }`. Depth screen is app UI, not LLM.

---

## Path outline

Input: `{ topic, depth, clarifications[] }`

Output: `{ total, lessons: [{ index, title }] }` within depth band (essentials 5–9, fluent 10–18, thorough 19–35).

Cache type: `path_outline`.

---

## Lesson body

Input: outline context + `lesson_index` + **`difficulty_modifier`** from prior lesson feel (baseline on L1).

Output: markdown body + sources. Cache type: `lesson_body`.

Modifier mapping: see CONTENT-CACHE.md.

---

## Quiz

Two parts in the **UI flow** (see FLOWS.md):

1. **MCQ** — Perplexity-generated; cache type `quiz`; per-answer feedback + sources.  
2. **Lesson feel** — app UI only; no LLM; stored on `lesson_activity`.

Quiz generation input: lesson title, topic, body summary. Cache key: fingerprint without difficulty modifier.

---

## Lesson feel → next lesson

| Feel | Next modifier |
|---|---|
| `too_easy` | `deeper` |
| `just_right` | `baseline` |
| `too_hard` | `easier` |
| `confusing` | `clearer` |

Read previous lesson’s `lesson_feel` when fetching/generating lesson N+1.

---

## Models

| Task | Staging / local | Production |
|---|---|---|
| Clarify | `sonar` | `sonar` |
| Outline | `sonar` | `sonar` |
| Quiz | `sonar` | `sonar` |
| Lesson body | `sonar` | `sonar-pro` |

Env: `PERPLEXITY_API_KEY`, `PERPLEXITY_MODEL_*` — server only.

---

## UI

Sources on lesson reader and factual quiz explanations. Feel question: calm, one screen, four tap options — not a survey.

---

## Limits

Rate-limit Perplexity per user on cache miss. Monitor hit rate and spend.
