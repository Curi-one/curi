# Curi — Component & pattern library

HTML references (visual source of truth for binding UI to brand):

| Reference | Path | Mirror |
|---|---|---|
| Component library | [`docs/references/component-library.html`](./references/component-library.html) | [`prototypes/brand/component-library.html`](../prototypes/brand/component-library.html) |
| Geometric patterns | [`docs/references/geometric-patterns.html`](./references/geometric-patterns.html) | [`prototypes/brand/geometric-patterns.html`](../prototypes/brand/geometric-patterns.html) |

Open the HTML files in a browser. They are catalogues, not production screens — Vermilion may appear many times there; the product still allows **one** accent use per screen ([BRAND.md](./BRAND.md) §4.3).

## Binding rules (app)

| Concern | Rule |
|---|---|
| **Radius** | Zero everywhere (`--radius-none`). |
| **Paper** | `#F4F1E8` — secondary surfaces / cards (`--color-paper-tone`). |
| **White** | `#FAF9F5` — page background. |
| **Pale** | `#E8E5DC` — tertiary / hover fill (`--color-bg-tertiary`). |
| **Primary button** | Ink fill, 2px Vermilion underline, uppercase UI sans. |
| **Ghost button** | Transparent, Light border → Ink border + Pale fill on hover. |
| **Danger button** | Ghost-like: Mid text, Light border, hover Ink — **no red / no Vermilion**. Destruction is signalled by words, not colour. |
| **Cards** | Paper fill, 1px Light border, hover → Pale. No soft shadow, no radius. |
| **Patterns** | Greyscale only (Ink / Mid / Silver / Light / Paper). Vermilion only as the **reveal line** at the edge. Never dotted grids as backgrounds. |
| **CSS utilities** | `.pattern-ledger`, `.pattern-columns`, `.pattern-hatch`, `.pattern-cross`, `.pattern-blueprint`, `.pattern-vitrine`, `.pattern-reveal` in `app/globals.css`. |

Tokens and button classes live in `app/globals.css`. Cover art patterns map through `lib/ui/topic-swatch.ts`.

See also: [BRAND.md](./BRAND.md), [WEBSITE-DESIGN-RULES.md](./WEBSITE-DESIGN-RULES.md).
