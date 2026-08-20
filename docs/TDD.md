# Test-driven development

**Mandatory** for all Curi implementation. No production code for a behaviour until a test fails for the right reason.

---

## Cycle

```
Red    → Write a failing test that describes desired behaviour
Green  → Minimal code to pass
Refactor → Clean up; tests stay green
```

Repeat per **behaviour**, not per file. One commit can contain multiple cycles; one PR should map to a slice or coherent feature.

---

## Test stack

| Layer | Tool | What to test |
|---|---|---|
| Domain | Vitest | Streak, due/done today, plan limits, depth bands, idempotent completion |
| API | Vitest + `fetch` / handler tests | Status codes, Zod validation, auth, RLS-sensitive paths |
| Components | Vitest + Testing Library | Clarify steps, Today grouping, quiz feedback UI |
| AI parsing | Vitest + fixtures | Mock Perplexity JSON; never call live API in unit tests |
| E2E | Playwright (from Slice 4+) | F1, F2, F3 happy paths on staging |

Install when Slice 1 starts: `vitest`, `@testing-library/react`, `@playwright/test` (e2e optional until Slice 4).

---

## What to test first (by domain)

### Streak (`lesson_activity`)

- First quiz today → streak increments  
- Second path completed same day → streak does **not** increment again  
- Activity yesterday + today → consecutive streak  
- Miss a day → streak breaks  

### Due today

- Active path, no activity today → due  
- Activity today → done, not due  
- `progress >= total` → not on Today active list  

### Plan limits

- Free user, 2 active → 3rd `POST /api/courses` rejected  
- Shelved path → does not count  
- Paid → unlimited  

### Clarify + depth

- Depth screen always last  
- `essentials` → outline N in 5–9 (mock Perplexity)  
- Answers persisted on course / pending  

### Quiz

- Complete quiz → activity row + progress +1 + **`lesson_feel` stored**  
- `too_hard` on L1 → L2 request uses `easier` cache modifier  

### Content cache

- Identical fingerprint → Perplexity mock not called  
- Different clarify answer → cache miss  
- Modifier variants cached separately  

---

## File layout (Slice 1+)

```
lib/
  streak.ts
  streak.test.ts
  due-today.ts
  due-today.test.ts
app/api/
  courses/route.ts
  courses/route.test.ts
components/
  today/
    TodayFeed.tsx
    TodayFeed.test.tsx
e2e/
  f1-guest.spec.ts
```

Colocate `*.test.ts` next to source or mirror under `__tests__/` — pick one convention in Slice 1 and keep it.

---

## Rules

1. **No `skip` or `todo` tests** merged to `main` unless linked to a follow-up issue.  
2. **Mock external services** — Supabase and Perplexity in unit tests; integration tests optional on staging.  
3. **Test behaviour, not implementation** — assert outputs and user-visible state, not private functions.  
4. **Regression** — every bugfix adds a test that would have caught it.  
5. **CI** — PR fails if `pnpm test` or `pnpm typecheck` fails.

---

## Agent checklist

Before marking work done:

- [ ] New behaviour has failing test written first (cite test file in PR)  
- [ ] All tests pass locally  
- [ ] Edge cases from `FLOWS.md` covered or explicitly deferred  
- [ ] No live API keys in tests  

Skill: `.cursor/skills/curi-tdd/`
