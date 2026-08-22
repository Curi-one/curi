/**
 * Deterministic track marks for catalogue / library topic imagery.
 *
 * Binding rules: docs/TRACK-MARKS.md
 * HTML refs: docs/references/track-marks.html, track-avatars-small.html
 *
 * Greyscale only: imagery is never rendered in colour (BRAND.md §6.3).
 * Fields use neutral Ink — never warm hsl casts (WEBSITE-DESIGN-RULES §1.1).
 */

export type DomainKey =
  | "PHIL"
  | "MATH"
  | "HIST"
  | "SCI"
  | "LANG"
  | "ECON"
  | "LAW"
  | "GEN";

export type TopicPattern =
  | "vitrine"
  | "blueprint"
  | "cross"
  | "ledger"
  | "columns"
  | "radiate";

export type TopicAlign = "br" | "bl" | "center" | "tr" | "tl";

export type TrackMarkTier = "large" | "medium" | "small" | "micro";

export type TrackMark = {
  domainKey: DomainKey;
  domainName: string;
  glyph: string;
  pattern: TopicPattern;
  /** Cataloguing-style fingerprint, e.g. `LAW · 855.9`. */
  call: string;
};

export type TopicArt = {
  /** Solid warm Ink field. */
  field: string;
  fieldStops?: [string, string];
  glyph: string;
  glyphColor: string;
  pattern: TopicPattern;
  align: TopicAlign;
};

type DomainDef = {
  name: string;
  glyphs: readonly string[];
  pattern: TopicPattern;
  kw: readonly string[];
};

/** Domain order matches the HTML classifier (first keyword hit wins). */
const DOMAINS: Record<DomainKey, DomainDef> = {
  PHIL: {
    name: "Philosophy",
    glyphs: ["∞", "∴"],
    pattern: "vitrine",
    kw: [
      "philosophy",
      "ethic",
      "stoic",
      "moral",
      "existential",
      "meaning",
      "virtue",
      "logic",
    ],
  },
  MATH: {
    name: "Mathematics",
    glyphs: ["ℵ", "∮"],
    pattern: "blueprint",
    kw: [
      "math",
      "algebra",
      "geometry",
      "calculus",
      "set theory",
      "number",
      "equation",
      "quantum",
      "physics",
    ],
  },
  HIST: {
    name: "History",
    glyphs: ["Æ", "I"],
    pattern: "vitrine",
    kw: [
      "history",
      "war",
      "empire",
      "roman",
      "ancient",
      "revolution",
      "medieval",
      "dynasty",
      "conquest",
    ],
  },
  SCI: {
    name: "Science",
    glyphs: ["⊕", "∮"],
    pattern: "cross",
    kw: [
      "science",
      "biology",
      "chemistry",
      "physics",
      "astronomy",
      "genetics",
      "neuro",
      "ecology",
    ],
  },
  LANG: {
    name: "Language & Writing",
    glyphs: ["¶", "Æ"],
    pattern: "ledger",
    kw: [
      "language",
      "writing",
      "grammar",
      "linguistic",
      "poetry",
      "literature",
      "rhetoric",
    ],
  },
  ECON: {
    name: "Economics & Business",
    glyphs: ["§", "¶"],
    pattern: "columns",
    kw: [
      "econom",
      "finance",
      "business",
      "market",
      "trade",
      "money",
      "pricing",
      "negotiat",
      "startup",
      "invest",
    ],
  },
  LAW: {
    name: "Law & Policy",
    glyphs: ["§", "†"],
    pattern: "ledger",
    kw: [
      "law",
      "legal",
      "policy",
      "constitution",
      "regulation",
      "government",
      "court",
    ],
  },
  GEN: {
    name: "General Knowledge",
    glyphs: ["†", "∴"],
    pattern: "radiate",
    kw: [],
  },
};

const DOMAIN_ORDER: DomainKey[] = [
  "PHIL",
  "MATH",
  "HIST",
  "SCI",
  "LANG",
  "ECON",
  "LAW",
];

/* Theme-independent by design — a track mark is a dark Ink field in either
   theme (see --mark-* in globals.css). Literal hex fallbacks keep the mark
   correct if the stylesheet has not loaded yet. */
const FIELD_INK = "var(--mark-field, #0A0A0A)";
const GLYPH_COLOR = "var(--mark-fg, #FAFAFA)";

/**
 * djb2-style hash matching track-marks.html `hashStr`
 * (`h = ((h<<5)+h)+charCode`, start 5381).
 */
export function hashTopicString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) + h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/** Keyword classifier — first domain with a matching substring wins. */
export function classifyTopicDomain(topic: string): DomainKey {
  const t = topic.toLowerCase();
  for (const key of DOMAIN_ORDER) {
    const d = DOMAINS[key];
    for (const kw of d.kw) {
      if (t.includes(kw)) return key;
    }
  }
  return "GEN";
}

/**
 * Full track-mark identity from a topic string.
 * Same topic → same domain, glyph, pattern, and call at every UI tier.
 */
export function buildTrackMark(topic: string): TrackMark {
  const key = topic.trim() || "Untitled";
  const domainKey = classifyTopicDomain(key);
  const domain = DOMAINS[domainKey];
  const h = hashTopicString(key);
  const glyph = domain.glyphs[h % domain.glyphs.length]!;
  const callNum = (h % 900) + 100;
  const callDec = (h % 9) + 1;
  const call = `${domainKey} · ${callNum}.${callDec}`;
  return {
    domainKey,
    domainName: domain.name,
    glyph,
    pattern: domain.pattern,
    call,
  };
}

/**
 * Size → tier. Thresholds from TRACK-MARKS.md / track-avatars-small.html.
 * Never invent a fifth tier.
 */
export function trackMarkTier(size: number): TrackMarkTier {
  if (size >= 80) return "large";
  if (size >= 48) return "medium";
  if (size >= 28) return "small";
  return "micro";
}

/**
 * Rich topic cover art — thin wrapper over `buildTrackMark` for existing callers.
 * Field is always warm Ink; glyph alignment matches the HTML mark (bottom-right).
 */
export function topicArt(topic: string): TopicArt {
  const mark = buildTrackMark(topic);
  return {
    field: FIELD_INK,
    glyph: mark.glyph,
    glyphColor: GLYPH_COLOR,
    pattern: mark.pattern,
    align: "br",
  };
}

/**
 * Legacy pair for LibraryPathCard: `[field, glyphColor]`.
 * Prefer `buildTrackMark` / `topicArt` for new rendering.
 */
export function topicSwatch(topic: string): [field: string, glyphColor: string] {
  const art = topicArt(topic);
  return [art.field, art.glyphColor];
}

/**
 * Glyph sizing for a track mark, matching `track-marks.html`
 * (`font-size: 38cqw`) while staying sane on non-square fields.
 *
 * The reference marks are square, so 38% of the container width is also 38%
 * of its height. A wide cover (e.g. 600x100) would render a 228px glyph in a
 * 100px box, so the height term caps it. Requires `container-type: size` on
 * the field element.
 */
export const MARK_GLYPH_FONT_SIZE = "min(38cqw, 56cqh)";

/** Pattern on an Ink field with no readable UI copy on the field (~16%, HTML `.field`). */
export const MARK_PATTERN_OPACITY = 0.16;

/** Pattern when readable text shares the Ink field — texture recedes so copy wins. */
export const MARK_PATTERN_OPACITY_WITH_TEXT = 0.07;

/** Decorative geometry on paper/light surfaces behind copy. */
export const MARK_SURFACE_PATTERN_OPACITY = 0.04;

/** Glyph on an Ink field alone — BRAND.md §6.2 (40–60%). */
export const MARK_GLYPH_OPACITY = 0.5;

/** Glyph when readable text shares the Ink field. */
export const MARK_GLYPH_OPACITY_WITH_TEXT = 0.24;

export type MarkImageryMode = "field" | "withText";

export function markPatternOpacity(mode: MarkImageryMode): number {
  return mode === "withText"
    ? MARK_PATTERN_OPACITY_WITH_TEXT
    : MARK_PATTERN_OPACITY;
}

export function markGlyphOpacity(mode: MarkImageryMode): number {
  return mode === "withText" ? MARK_GLYPH_OPACITY_WITH_TEXT : MARK_GLYPH_OPACITY;
}

/**
 * CSS for track-mark pattern families.
 *
 * `color` defaults to the mark foreground because these families are
 * specified for **dark Ink fields only** (TRACK-MARKS.md). Painting the
 * default onto a light surface draws near-white lines on near-white paper —
 * invisible in light mode, and visible only once dark mode inverts the
 * surface underneath. Pass an explicit colour for any other field, or use no
 * pattern at all.
 *
 * Apply on a layer at ~16% opacity (HTML `.field { opacity: .16 }`).
 */
export function topicPatternStyle(
  pattern: TopicPattern,
  color = "var(--mark-fg, #FAFAFA)",
): Record<string, string> {
  const white = color;
  switch (pattern) {
    case "blueprint":
      return {
        backgroundImage: [
          `repeating-linear-gradient(to bottom, ${white} 0 1px, transparent 1px 14px)`,
          `repeating-linear-gradient(to right, ${white} 0 1px, transparent 1px 14px)`,
        ].join(", "),
      };
    case "ledger":
      return {
        backgroundImage: `repeating-linear-gradient(to bottom, ${white} 0 1px, transparent 1px 22px)`,
      };
    case "columns":
      return {
        backgroundImage: `repeating-linear-gradient(to right, ${white} 0 1px, transparent 1px calc(100% / 9))`,
      };
    case "cross":
      return {
        backgroundImage: [
          `repeating-linear-gradient(45deg, ${white} 0 1px, transparent 1px 13px)`,
          `repeating-linear-gradient(-45deg, ${white} 0 1px, transparent 1px 13px)`,
        ].join(", "),
      };
    case "radiate":
      return {
        background: [
          "conic-gradient(from 0deg,",
          `transparent 0 28deg, ${white} 28deg 29deg, transparent 29deg 58deg,`,
          `${white} 58deg 59deg, transparent 59deg 88deg, ${white} 88deg 89deg, transparent 89deg 118deg,`,
          `${white} 118deg 119deg, transparent 119deg 148deg, ${white} 148deg 149deg, transparent 149deg 178deg,`,
          `${white} 178deg 179deg, transparent 179deg 208deg, ${white} 208deg 209deg, transparent 209deg 238deg,`,
          `${white} 238deg 239deg, transparent 239deg 268deg, ${white} 268deg 269deg, transparent 269deg 298deg,`,
          `${white} 298deg 299deg, transparent 299deg 328deg, ${white} 328deg 329deg, transparent 329deg 360deg)`,
        ].join(" "),
      };
    case "vitrine":
      return {
        backgroundImage: [
          `repeating-linear-gradient(0deg, transparent, transparent 15%, ${white} 15%, ${white} calc(15% + 1px))`,
          `repeating-linear-gradient(90deg, transparent, transparent 15%, ${white} 15%, ${white} calc(15% + 1px))`,
        ].join(", "),
      };
  }
}

/** Flex alignment classes for the oversized glyph. */
export function topicAlignClass(align: TopicAlign): string {
  switch (align) {
    case "br":
      return "items-end justify-end";
    case "bl":
      return "items-end justify-start";
    case "center":
      return "items-center justify-center";
    case "tr":
      return "items-start justify-end";
    case "tl":
      return "items-start justify-start";
  }
}

/** Progress % with a slight endowment so early progress feels visible. */
export function endowedPct(progress: number, total: number): number {
  if (total <= 0) return 0;
  const p = Math.min(progress, total);
  if (p >= total) return 100;
  return Math.round(((p + 1) / (total + 1)) * 100);
}

export type ChapterSlice = { label: string | null; start: number; end: number };

/** Split a lesson list into named chapter bands (prototype CoursePathScreen). */
export function buildChapters(n: number): ChapterSlice[] {
  if (n <= 7) return [{ label: null, start: 0, end: n }];
  if (n <= 14) {
    const mid = Math.ceil(n / 2);
    return [
      { label: "Opening", start: 0, end: mid },
      { label: "Depths", start: mid, end: n },
    ];
  }
  if (n <= 21) {
    const t = Math.ceil(n / 3);
    return [
      { label: "Foundations", start: 0, end: t },
      { label: "Structure", start: t, end: t * 2 },
      { label: "Mastery", start: t * 2, end: n },
    ];
  }
  const q = Math.ceil(n / 4);
  return [
    { label: "Part I", start: 0, end: q },
    { label: "Part II", start: q, end: q * 2 },
    { label: "Part III", start: q * 2, end: q * 3 },
    { label: "Part IV", start: q * 3, end: n },
  ];
}
