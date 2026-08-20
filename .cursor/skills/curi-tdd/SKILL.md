---
name: curi-tdd
description: Red-green-refactor TDD for Curi features. Use when implementing features, fixing bugs, or when the user mentions tests, TDD, Vitest, or test-first development.
---

# Curi TDD

Read `docs/TDD.md`.

## Red

Write a test that fails because behaviour is missing — not because of typos.

```typescript
// lib/due-today.test.ts — example
it("marks path due when no activity today", () => {
  expect(isDueToday(course, activity, "2026-08-20")).toBe(true);
});
```

## Green

Smallest change to pass. No extra features.

## Refactor

Clean names and duplication; tests stay green.

## Mocks

- Perplexity: fixture JSON from `AI.md` schemas
- Supabase: mock client or test DB — never live keys in unit tests

## Done when

- [ ] Test existed before implementation
- [ ] Edge cases from FLOWS covered or deferred with comment
- [ ] `pnpm test` passes
