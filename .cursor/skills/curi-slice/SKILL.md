---
name: curi-slice
description: Implements a Curi roadmap slice with TDD and flow verification. Use when starting Slice 1–7 from docs/ROADMAP.md or when the user asks to implement a vertical slice.
---

# Curi slice implementer

## Before coding

1. Read `docs/ROADMAP.md` — current slice only (deliver + exit criteria).
2. Read `DECISIONS.md`, `FLOWS.md`, `TDD.md`.

## Workflow

```
- [ ] Confirm slice number and exit criteria with user if ambiguous
- [ ] List behaviours to test (from FLOWS + slice deliverables)
- [ ] Write failing tests (curi-tdd skill)
- [ ] Implement minimum code
- [ ] UX pass (curi-ux-review skill)
- [ ] Flow verify affected F* flows
- [ ] Update docs if behaviour changed
- [ ] All tests green
```

## Scope guard

Do not start the next slice. Do not add v1-out features (flashcards, email, SEO, etc.).

## Exit

State each exit criterion from ROADMAP as pass/fail with evidence (test names or staging URL).
