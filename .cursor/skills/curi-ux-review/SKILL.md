---
name: curi-ux-review
description: Reviews Curi UI and flows against behavioural psychology and mental models. Use for new screens, UX changes, copy, navigation, or before merging UI work.
---

# Curi UX review

Read `docs/UX-PRINCIPLES.md`, `docs/FLOWS.md`, and `docs/BRAND.md`.

Run `pnpm brand:check` first — it catches the mechanical violations so the
review can focus on judgement.

## Checklist

- [ ] Mental model: user belief matches system (multi-path Today, one lesson/path/day)
- [ ] Cognitive load: one primary action; no competing CTAs
- [ ] Trust: sources on AI content; honest progress
- [ ] Commitment: auth timing; clarify one question per screen
- [ ] Streak: supportive, not punitive
- [ ] Brand: calm editorial; no gamification
- [ ] Mobile: 44px targets; docked primary CTA
- [ ] Empty/error: plain language + retry

## Brand checklist (`docs/BRAND.md`)

- [ ] **Vermilion once per screen** (§4.3) — and only for a sanctioned use:
      wordmark underline, primary-CTA bottom border, pull-quote rule,
      takeaway numbers, quiz correct-state option letter
- [ ] **Sharp corners** (§8.4, §16.3) — `rounded-none` on every container,
      card, and button; `rounded-full` only on true circles
- [ ] **No box shadows** (§8.5, §16.3) — depth comes from surface + rule
- [ ] **Tokens only** (§17.04) — no hardcoded hex, px, or duration in a component
- [ ] **Warm palette** (§16.1) — never pure `#000` / `#FFF`
- [ ] **Fraunces never below 18px** (§5.2, §16.2); mono for metadata (§5.4)
- [ ] **No colour semantics** (§9.6) — correct is Ink, errors are Silver;
      never green, never red
- [ ] **Streak is typographic** (§11.3) — never Vermilion, never in a badge shape
- [ ] **Motion settles** (§7.1) — no spring, bounce, or elastic;
      `prefers-reduced-motion` respected (§7.5)
- [ ] **Left-aligned** (§16.3) — centre is for completion screens only

## Output

```markdown
## UX review — [scope]

### Critical
- ...

### Suggestion
- ...

### Nice
- ...
```

Block merge on Critical items that violate FLOWS or UX-PRINCIPLES.
