# Curi — Website Design Rules

### Quick reference · derived from Brand Guidelines & Design System v2.0

**Also:** [INTERACTIONS.md](./INTERACTIONS.md) · [TRACK-MARKS.md](./TRACK-MARKS.md)

---

## 1. Colour

### 1.1 The palette

Eight warm greyscale tones plus one accent. Never pure black (`#000000`) or pure white (`#FFFFFF`) — the warmth is intentional.

| Token | Hex | RGB | Use |
|---|---|---|---|
| `color.ink` | `#0A0908` | 10, 9, 8 | Primary text, dark backgrounds |
| `color.ink-2` | `#1C1A18` | 28, 26, 24 | Hover on dark surfaces |
| `color.ink-3` | `#2E2C28` | 46, 44, 40 | Secondary dark surfaces |
| `color.mid` | `#6B6760` | 107, 103, 96 | Secondary text, supporting copy |
| `color.silver` | `#9E9B94` | 158, 155, 148 | Labels, captions, metadata, disabled |
| `color.light` | `#D4D0C8` | 212, 208, 200 | Borders, rules, subtle backgrounds |
| `color.paper` | `#F5F4F0` | 245, 244, 240 | Secondary background, cards |
| `color.white` | `#FAF9F5` | 250, 249, 245 | Primary background |
| `color.accent` (Vermilion) | `#C1121F` | 193, 18, 31 | Single accent — once per screen |

### 1.2 The Vermilion rule

Vermilion appears **once per screen, per layout, per composition.** Not once per component — once per full page view.

**Permitted uses (pick one):**
1. The wordmark underline
2. A pull-quote left border rule
3. A CTA button's bottom border
4. An image-hover reveal line
5. Numbered list indicators in takeaways
6. A cursor tracking dot in interactive contexts
7. One accent card fill per page in a grid layout

**Never:** body text, decorative use, more than once per layout, combined with any other non-neutral colour, or used for success states (correct = an Ink fill, not green, not vermilion).

The test before every use: *is this the most important thing on this screen?* If not, solve the problem another way.

### 1.3 Approved pairings

| Foreground | Background | Context |
|---|---|---|
| Ink | White | Primary body text |
| Ink | Paper | Cards, secondary surfaces |
| White | Ink | Hero panels, footer |
| Silver | Ink | Metadata on dark |
| Ink | Light | Subtle differentiation |
| Vermilion | Ink | Accent on dark |
| Vermilion | White | Accent on light |

**Never pair:** Vermilion on Paper (fails contrast), Silver on White for body text, or any pairing failing WCAG AA (body text 4.5:1 minimum, large text 3:1, UI components 3:1).

### 1.4 Hierarchy without colour

Hierarchy is built through **scale and weight, never colour.** Body copy is always Ink or Mid. Never recolour text to Vermilion for emphasis — use italic or a size step instead.

---

## 2. Typography

### 2.1 The three-font system

| Family | Role | Never |
|---|---|---|
| **Fraunces** (variable serif) | Wordmark, headlines, stat numbers, pull quotes | Below 18px |
| **Plus Jakarta Sans** | Body copy, UI chrome, buttons, nav, forms | Above 18px (prefer Fraunces) |
| **JetBrains Mono** | Metadata: labels, timestamps, day counters, progress fractions | At display size — 8–11px only |

Fraunces and Plus Jakarta Sans never appear at the same size in one component. The serif always leads; the sans always supports.

### 2.2 Fraunces settings

Variable axes: `wght` 100–900, `SOFT` 0–100, `WONK` 0–1.

| Context | Weight | SOFT | WONK | Size |
|---|---|---|---|---|
| Hero headline | 300 | 80 | 1 | 72–192px |
| Section headline | 300 | 60 | 1 | 48–72px |
| Lesson / page title | 400 | 50 | 1 | 32–52px |
| Card title | 400 | 40 | 0 | 20–28px |
| Pull quote display | 300 italic | 80 | 1 | 28–36px |

Letter-spacing by size: `-0.04em` at 80px+, `-0.03em` at 48–80px, `-0.02em` at 32–48px, `-0.015em` at 20–32px.

### 2.3 Plus Jakarta Sans settings

Weights: Light (300) body/supporting, Regular (400) UI labels/nav/inputs, Medium (500) buttons/active states, SemiBold (600) strong emphasis, Light Italic for editorial subtext.

Size range: 10px (labels) to 18px (featured body). Line height 1.6–1.75 for body, 1.3–1.4 for small labels. Letter-spacing: `0` standard, `0.12–0.2em` uppercase labels, `0.06–0.1em` buttons.

### 2.4 JetBrains Mono settings

Weights: Light (300), Regular (400). Size range 8–11px. Letter-spacing `0.15–0.25em` for uppercase labels, `0` for standalone numerals.

### 2.5 Full type scale

```
DISPLAY (Fraunces)
192px / 300 / SOFT 100 / WONK 1   — wordmark at hero scale
120px / 300 / SOFT 80  / WONK 1   — ghost decorative numbers
88px  / 300 / SOFT 70  / WONK 1   — primary homepage headlines
72px  / 300 / SOFT 60  / WONK 1   — stat display numbers
52px  / 400 / SOFT 50  / WONK 1   — lesson titles
38px  / 400 / SOFT 40  / WONK 1   — card feature headlines, modal titles
28px  / 300 / SOFT 30  / WONK 0   — card secondary headlines, pull quotes
22px  / 400 / SOFT 20  / WONK 0   — minimum display use

UI & BODY (Plus Jakarta Sans)
18px / 300   — featured body, lead paragraphs
16px / 300   — standard body copy
15px / 300   — card body, supporting text
14px / 300   — secondary body, captions
13px / 400   — input text, form fields
12px / 400–500 — buttons, navigation labels
11px / 400–500 — small UI labels, tags
10px / 400   — minimum body label size

METADATA (JetBrains Mono)
11px / 400   — system labels, navigation metadata
10px / 300   — progress fractions, day counters
9px  / 300   — metadata, hex values, timestamps
8px  / 300   — absolute minimum, fine print
```

### 2.6 Typographic rules

- Smart quotes always. Never straight quotes.
- No widow words: never a single word alone on a headline's last line — rewrite the line.
- No hyphenation in headlines — rewrite the line instead.
- No type effects: no shadows, outlines, gradients, glows, faux bold, or faux italic.

---

## 3. Spacing

Base-4 scale. Primary rhythm is multiples of 8.

```css
--space-1:    4px;   /* Micro — inline gaps */
--space-2:    8px;   /* XSmall — tight component padding */
--space-3:   12px;   /* Small-tight */
--space-4:   16px;   /* Small — component internal padding */
--space-5:   20px;   /* Small-medium */
--space-6:   24px;   /* Medium — between related elements */
--space-8:   32px;   /* Large — between components */
--space-10:  40px;   /* XLarge — section padding */
--space-12:  48px;   /* 2XL — section internal */
--space-16:  64px;   /* 3XL — section breaks */
--space-20:  80px;   /* 4XL — page rhythm */
--space-24:  96px;   /* 5XL — major breaks */
--space-32: 128px;   /* 6XL — hero spacing */
```

**Applied guidance:**
- Component internal padding: 16–24px
- Gap between related elements: 24–32px
- Gap between distinct sections: 64–96px
- Hero section spacing: up to 128px
- Page margins: 20px mobile / 32px tablet / 52px desktop
- Content reading column max-width: 680px
- Narrow contexts (modals, auth): 480px max-width
- Grid: 1 column mobile, 6 tablet, 12 desktop. Gutter 16px mobile, 24px tablet/desktop. Max grid width: 1440px.

**Density principle:** empty space is the default. Fill it only when the content has enough weight to deserve it.

---

## 4. Shape, borders, depth

### 4.1 Border radius

```css
--radius-none:   0px;     /* Default — all containers, cards, buttons */
--radius-sm:     2px;     /* Badge pills only, very short content */
--radius-md:     4px;     /* Internal chip elements only */
--radius-full: 9999px;    /* Circular elements only, e.g. avatar initials */
```

**Rule:** if you're tempted to add border-radius to a container, card, or button, the default answer is no. Sharp corners are the brand. Any exception must be explicitly justified.

### 4.2 Shadows

No box shadows anywhere on cards or containers. Depth is built from background colour differentiation (White → Paper → Light) and border rules only.

```css
--shadow-none: none;    /* Default — all containers */
```

The one permitted visual-depth trick: a 2px Vermilion bottom border on the active primary CTA button. That's a border, not a shadow.

### 4.3 Borders

```css
--border-subtle:  1px solid #D4D0C8;   /* Light — standard card borders */
--border-default: 1px solid #9E9B94;   /* Silver — input borders/focus */
--border-strong:  1px solid #0A0908;   /* Ink — emphasis */
--border-bold:    2px solid #0A0908;   /* Ink bold — section breaks, masthead */
--border-accent:  2px solid #C1121F;   /* Vermilion — pull quote rule, CTA bottom */
```

---

## 5. Motion

Binding rules live in **[INTERACTIONS.md](./INTERACTIONS.md)** (exact tokens, hover one-property, reveals, never-list). HTML: [`references/interactions-guide.html`](./references/interactions-guide.html).

Three principles: **Gravity** (things settle into place, never fly in), **Patience** (300ms minimum for meaningful transitions), **Restraint** (one motion at a time).

No spring physics, no bounce, no elastic, no parallax scrolling.

```css
--ease-out:      cubic-bezier(0.16, 1, 0.3, 1);   /* settling in */
--ease-in:       cubic-bezier(0.4, 0, 1, 1);      /* leaving */
--ease-standard: cubic-bezier(0.4, 0, 0.2, 1);    /* both directions */
```

| Token | Value | Use |
|---|---|---|
| `duration.micro` | **100ms** | Hover fills, focus rings |
| `duration.small` | **200ms** | Colour/opacity transitions |
| `duration.medium` | **350ms** | Component entrances, modals |
| `duration.large` | **750ms** | Page transitions, staggered reveals |
| `duration.xl` | **1100ms** | Wordmark draw-in, hero entrances |

Always respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

**Track marks & avatars:** [TRACK-MARKS.md](./TRACK-MARKS.md).

## 6. Buttons — the only permitted types

### Primary
One per screen maximum. Carries the Vermilion underline — this is the accent budget for the screen.

```
font: Plus Jakarta Sans, 12px, weight 500, letter-spacing 0.06em, uppercase
color: White on Ink background
padding: 12px 24px
border-radius: 0
border-bottom: 2px solid Vermilion
hover: background → Ink 2
focus: 2px Silver outline, 2px offset
disabled: background → Light, border-bottom removed
active: translateY(1px)
```

### Secondary (Ghost)
Never carries the Vermilion underline.

```
color: Ink on transparent
border: 1px solid Light
hover: border → Ink, background → Pale
```

### Text Link
Inline/tertiary actions. Underlined, 13px, Ink, hovers to Mid.

### Danger / Destructive
Identical to Ghost but never uses Vermilion. Destruction is signalled through copy and typography, not colour.

### Sizes

| Variant | Padding | Font size | Use |
|---|---|---|---|
| Large | 14px 28px | 13px | Hero CTAs, onboarding |
| Default | 12px 24px | 12px | Standard actions |
| Small | 8px 16px | 11px | In-card actions, dense UI |
| Compact | 5px 12px | 10px | Badge-adjacent actions |

---

## 7. Imagery

- No photography of people, no stock imagery, no AI-generated illustration.
- Primary image format: large typographic forms — glyphs, letterforms, symbols — rendered at enormous scale in Fraunces italic on a dark field.
- Approved glyphs (must connect to the content's subject, never purely decorative): `§ ∮ Æ ∞ I ℵ ¶ † ∴ ∵ ⊕`
- Construction: glyph at 40–60% opacity, slightly off-centre; dark field two-stop gradient Ink → Ink 2; halftone overlay 3–5%; diagonal light band 2–3%; fine grain 2–4%.
- Secondary imagery: architectural vocabulary of museums/libraries — ruled lines, grids, diagonal hatching. Always greyscale, never colour.
- The one permitted colour in imagery: a 2–4px Vermilion reveal line on hover or as a static edge element. Never thicker than 4px.

---

## 8. The don'ts, in one place

**Colour:** no second accent colour. No Vermilion for success states. No pure black/white. No gradients on type. No Vermilion more than once per screen.

**Typography:** no system fonts in designed contexts. No all-caps display headlines. No mixing outside the three-font system. No faux bold/italic. No shadows, outlines, glows, strokes. No Fraunces below 18px.

**Layout:** no centre-aligned standard layouts (centre is for certificates/completion screens only). No drop shadows on cards or containers. No border-radius on containers or buttons. No dotted grids or pattern-fill backgrounds.

**Imagery:** no stock photography. No AI-generated illustration. No photographs of people. No colour photography. No illustration used to compensate for weak writing.

**Voice:** no exclamation marks. No em-dashes. Never motivate through anxiety — motivate through the pleasure of learning.

---

*Curi — curiosity, engineered.*
