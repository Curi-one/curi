# Curi — Track Marks & Avatars

Deterministic subject identity without photography or illustration. Visual references:

- Full marks: [`docs/references/track-marks.html`](./references/track-marks.html) · [`prototypes/brand/track-marks.html`](../prototypes/brand/track-marks.html)
- Small tiers: [`docs/references/track-avatars-small.html`](./references/track-avatars-small.html) · [`prototypes/brand/track-avatars-small.html`](../prototypes/brand/track-avatars-small.html)

Implementation: `lib/ui/topic-swatch.ts` → `buildTrackMark(topic)`.

---

## Identity (deterministic)

Every topic string resolves to the same identity at every size:

1. **Domain** — keyword classifier → `PHIL` | `MATH` | `HIST` | `SCI` | `LANG` | `ECON` | `LAW` | `GEN`
2. **Glyph** — domain’s approved set; hash picks which
3. **Call number** — `DOMAIN · NNN.D` (e.g. `LAW · 855.9`)
4. **Pattern field** — domain’s geometry family at ~16% white on Ink

### Hash (djb2-style, match the HTML)

```
h = 5381
for each char: h = ((h << 5) + h) + charCode; h |= 0
return Math.abs(h)
```

Call number: `callNum = (h % 900) + 100`, `callDec = (h % 9) + 1` → `` `${domainKey} · ${callNum}.${callDec}` ``.

---

## Domains

| Key | Name | Glyphs | Pattern | Keywords (substring match, first wins) |
|---|---|---|---|---|
| `PHIL` | Philosophy | ∞ ∴ | vitrine | philosophy, ethic, stoic, moral, existential, meaning, virtue, logic |
| `MATH` | Mathematics | ℵ ∮ | blueprint | math, algebra, geometry, calculus, set theory, number, equation, quantum, physics |
| `HIST` | History | Æ I | vitrine | history, war, empire, roman, ancient, revolution, medieval, dynasty, conquest |
| `SCI` | Science | ⊕ ∮ | cross | science, biology, chemistry, physics, astronomy, genetics, neuro, ecology |
| `LANG` | Language & Writing | ¶ Æ | ledger | language, writing, grammar, linguistic, poetry, literature, rhetoric |
| `ECON` | Economics & Business | § ¶ | columns | econom, finance, business, market, trade, money, pricing, negotiat, startup, invest |
| `LAW` | Law & Policy | § † | ledger | law, legal, policy, constitution, regulation, government, court |
| `GEN` | General Knowledge | † ∴ | radiate | _(fallback)_ |

Classifier walks domains in the order above (excluding `GEN`); first keyword hit wins. Order matters when keywords overlap (e.g. `physics` → `MATH` before `SCI`).

Patterns (CSS families on dark ink fields, white lines ~16% opacity): **vitrine**, **blueprint**, **cross**, **ledger**, **columns**, **radiate**.

---

## Vermilion

- **Full marks:** Vermilion only on the **domain label**. Glyph, call number, and field stay Paper / Silver on Ink.
- **Lists:** Only the **selected / active** row may use Vermilion on the glyph. Sibling rows stay Silver on Ink.

---

## Size tiers

Never invent a fifth tier. Never scale the full card down — render the tier’s own reduced spec.

| Tier | Size | Renders |
|---|---|---|
| **Large** | 80–120px | Glyph + pattern + domain label + call number (covers may focus glyph + pattern) |
| **Medium** | 48–64px | Glyph + pattern (no call / domain chrome) |
| **Small** | 28–40px | Glyph only, flat Ink (no pattern) |
| **Micro** | 16–20px | Flat Ink square, **no glyph** |

---

## Shape rule

| Shape | Meaning |
|---|---|
| **Square** (zero radius) | Subject / track mark — every tier |
| **Circle** (full radius) | Person — **user avatar only** (Fraunces italic initials) |

Track marks never borrow the circle. User avatars never borrow the square.

---

## Checklist

1. Pick the tier by pixel size — don’t invent a fifth.
2. Never scale down the full card to small sizes.
3. Square stays square at every tier.
4. Same topic → same glyph and pattern at every tier.
5. Micro has no glyph — a flat square beside a text label is correct.
