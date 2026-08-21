# Curi — Interactions

Binding motion rules for product UI. Visual reference:

- [`docs/references/interactions-guide.html`](./references/interactions-guide.html)
- [`prototypes/brand/interactions-guide.html`](../prototypes/brand/interactions-guide.html)

Also see [BRAND.md §7](./BRAND.md#7-motion--animation) and [WEBSITE-DESIGN-RULES.md §5](./WEBSITE-DESIGN-RULES.md#5-motion).

---

## Duration tokens (exact)

Nothing in the product may use a duration outside this set.

| Token | Value | Typical use |
|---|---|---|
| `micro` | **100ms** | Hover fills, focus, button hover |
| `small` | **200ms** | Colour / opacity; quiz option hover |
| `medium` | **350ms** | Entrances, modals, backdrop |
| `large` | **750ms** | Page-level motion scale |
| `xl` | **1100ms** | Wordmark / hero draw-in |

CSS: `--duration-micro` … `--duration-xl` in `app/globals.css`.

---

## Curves (exact)

| Token | Value | Use |
|---|---|---|
| `ease-out` | `cubic-bezier(.16,1,.3,1)` | Settling in — default for entrances |
| `ease-in` | `cubic-bezier(.4,0,1,1)` | Leaving — exits only |
| `ease-standard` | `cubic-bezier(.4,0,.2,1)` | Colour and hover states |

There is no fourth curve. No spring, bounce, or elastic.

---

## Hover — one property

Every interactive surface changes **exactly one** of: background, border colour, or text colour — never more than one at once — at `small` (200ms) or `micro` (100ms).

**Exception — quiz option:** background **and** border together at **200ms** (reads as one “selectable” signal).

### Cards

Paper → Pale, **background only**, **300ms**. No lift, no shadow, no scale.

### Buttons

- Press: `translateY(1px)` with **no duration** (instant).
- Hover: background only, ~120ms (use `micro` / 100ms token).

---

## Reveals & feedback

| Moment | Spec |
|---|---|
| **List stagger** | `translateY(16px)` + opacity → rest; **700ms** ease-out; **130ms** between items |
| **Curriculum gen** | `translateX(-8px)` + opacity; **420ms**; **260ms** stagger |
| **Progress fill** | `width` only, **600ms** ease-out; animate **only on change**, never on page load |
| **Streak count-up** | Digits 0 → target over **700ms** ease-out; no confetti, no colour burst |
| **Toast** | Enter **300ms** ease-out from 8px below; hold **3.2s**; exit **200ms** ease-in; bottom-right |
| **Modal** | Backdrop **350ms** ease-out; box `translateY(16px)` + opacity **350ms**; exit **200ms** ease-in |
| **Skeleton** | Pale blocks; **1600ms** opacity pulse **15% ↔ 55%**; **never** a shimmer / gradient sweep |

Utility: `.stagger-item` (and related) in `app/globals.css`. Skeleton pulse: `.skeleton-pulse`.

---

## NEVER

- Confetti, bursts, or particle effects (streaks, correct answers, track completion)
- Shake or red flash on error / wrong answer
- Spring or bounce easing anywhere
- Parallax scrolling
- Gradient loading sweep (use opacity pulse)
- Simultaneous non-staggered entrances of multiple elements

---

## Reduced motion

`prefers-reduced-motion: reduce` collapses **all** animations and transitions globally (once in `app/globals.css`). Not optional per component.
