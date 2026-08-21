/**
 * Deterministic cover art for catalogue / library topic imagery.
 *
 * Greyscale only: imagery is never rendered in colour (BRAND.md §6.3).
 * Patterns follow docs/references/geometric-patterns.html — ruled lines,
 * grids, hatching, blueprint. Never dotted grids as primary backgrounds.
 * Fields use warm ink tones from the brand palette — never cold
 * `hsl(0 0% n%)` or pure `#000` / `#FFF` (WEBSITE-DESIGN-RULES §1.1).
 * Glyphs prefer BRAND §6.2 symbols when topic keywords match.
 */

/** Brand library pattern names (primary cover set). */
export type TopicPattern =
  | "ledger"
  | "columns"
  | "hatch"
  | "cross"
  | "blueprint"
  | "band"
  | "corners"
  | "vitrine"
  /** @deprecated Prefer `ledger` — kept for style switch aliases. */
  | "rules"
  /** @deprecated Prefer `columns`. */
  | "grid"
  /** @deprecated Prefer `band` / component reveal line. */
  | "reveal"
  /** @deprecated Prefer `corners`. */
  | "crop"
  /**
   * Optional subtle layer on dark glyph cards only — never a primary cover
   * pattern (library: no dotted grids as backgrounds).
   */
  | "halftone"
  /** @deprecated Mapped to hatch. */
  | "grain";

export type TopicAlign = "br" | "bl" | "center" | "tr" | "tl";

export type TopicArt = {
  /** CSS background value (solid hex or two-stop linear-gradient). */
  field: string;
  /** Present when `field` is a two-stop gradient. */
  fieldStops?: [string, string];
  glyph: string;
  glyphColor: string;
  pattern: TopicPattern;
  align: TopicAlign;
};

/** Warm dark fields — Ink / Ink 2 / Ink 3 and nearby warm greys. */
const FIELDS = [
  "#0A0908",
  "#1C1A18",
  "#2E2C28",
  "#141210",
  "#242220",
  "#181614",
  "#10100E",
  "#22201C",
] as const;

/** Primary cover patterns from the geometric library (no halftone). */
const PATTERNS: TopicPattern[] = [
  "ledger",
  "columns",
  "hatch",
  "cross",
  "blueprint",
  "band",
  "corners",
  "vitrine",
];

const ALIGNS: TopicAlign[] = ["br", "bl", "center", "tr", "tl"];

const MATH_GLYPHS = ["∮", "∞", "ℵ", "⊕"] as const;
const HISTORY_LANG_GLYPHS = ["Æ", "¶", "†"] as const;
const LOGIC_GLYPHS = ["∴", "∵"] as const;

const GLYPH_COLOR = "#FAF9F5";

/** Stable non-cryptographic hash for topic strings. */
function hashTopic(topic: string): number {
  let h = 2166136261;
  for (let i = 0; i < topic.length; i++) {
    h ^= topic.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(items: readonly T[], n: number): T {
  return items[n % items.length]!;
}

function matchGlyph(topic: string, hash: number): string {
  const t = topic.toLowerCase();

  if (
    /\b(law|legal|statute|constitution|court|justice|legislation|rights)\b/.test(
      t,
    )
  ) {
    return "§";
  }

  if (
    /\b(math|mathematics|algebra|calculus|geometry|arithmetic|number|physics|science|quantum|statistics|topology)\b/.test(
      t,
    )
  ) {
    return pick(MATH_GLYPHS, hash);
  }

  if (
    /\b(history|historical|language|literature|writing|linguistics|english|latin|poetry|roman|classic)\b/.test(
      t,
    )
  ) {
    return pick(HISTORY_LANG_GLYPHS, hash);
  }

  if (
    /\b(logic|reasoning|philosophy|deduction|argument|epistemology)\b/.test(t)
  ) {
    return pick(LOGIC_GLYPHS, hash);
  }

  const initial = topic.trim().charAt(0);
  return initial ? initial.toUpperCase() : "?";
}

/**
 * Rich deterministic topic cover art (field, glyph, pattern, alignment).
 */
export function topicArt(topic: string): TopicArt {
  const key = topic.trim() || "?";
  const hash = hashTopic(key.toLowerCase());

  const fieldA = pick(FIELDS, hash);
  const fieldB = pick(FIELDS, hash >>> 8);
  const useGradient = (hash >>> 16) % 3 === 0;

  const fieldStops: [string, string] | undefined = useGradient
    ? [fieldA, fieldB === fieldA ? pick(FIELDS, hash + 1) : fieldB]
    : undefined;

  const field = fieldStops
    ? `linear-gradient(160deg, ${fieldStops[0]} 0%, ${fieldStops[1]} 100%)`
    : fieldA;

  return {
    field,
    ...(fieldStops ? { fieldStops } : {}),
    glyph: matchGlyph(key, hash >>> 4),
    glyphColor: GLYPH_COLOR,
    pattern: pick(PATTERNS, hash >>> 12),
    align: pick(ALIGNS, hash >>> 20),
  };
}

/**
 * Legacy pair for LibraryPathCard: `[field, glyphColor]`.
 * Prefer `topicArt` for new cover / thumbnail rendering.
 */
export function topicSwatch(topic: string): [field: string, glyphColor: string] {
  const art = topicArt(topic);
  return [art.field, art.glyphColor];
}

/**
 * CSS overlay styles for a topic pattern on dark cover fields.
 * Uses warm white-tone ink at low opacity (library greyscale rule).
 */
export function topicPatternStyle(
  pattern: TopicPattern,
): Record<string, string> {
  const ink = "250,249,245"; // --color-white-tone on dark fields
  const mid = "107,103,96"; // --color-mid for subtle hatch on dark
  switch (pattern) {
    case "hatch":
    case "grain":
      // Library: 115deg fine diagonal hatch at low opacity
      return {
        backgroundImage: `repeating-linear-gradient(115deg, rgba(${ink},0.14) 0 1px, transparent 1px 9px)`,
        opacity: "0.85",
      };
    case "columns":
    case "grid":
      return {
        backgroundImage: `repeating-linear-gradient(to right, rgba(${ink},0.08) 0 1px, transparent 1px 12px)`,
      };
    case "ledger":
    case "rules":
      return {
        backgroundImage: `repeating-linear-gradient(to bottom, rgba(${ink},0.08) 0 1px, transparent 1px 14px)`,
      };
    case "cross":
      return {
        backgroundImage: [
          `repeating-linear-gradient(45deg, rgba(${ink},0.12) 0 1px, transparent 1px 12px)`,
          `repeating-linear-gradient(-45deg, rgba(${ink},0.12) 0 1px, transparent 1px 12px)`,
        ].join(", "),
      };
    case "blueprint":
      return {
        backgroundImage: [
          `repeating-linear-gradient(to bottom, rgba(${ink},0.07) 0 1px, transparent 1px 16px)`,
          `repeating-linear-gradient(to right, rgba(${ink},0.07) 0 1px, transparent 1px 16px)`,
          `linear-gradient(45deg, transparent 49.5%, rgba(${ink},0.18) 49.5%, rgba(${ink},0.18) 50.5%, transparent 50.5%)`,
          `linear-gradient(-45deg, transparent 49.5%, rgba(${ink},0.18) 49.5%, rgba(${ink},0.18) 50.5%, transparent 50.5%)`,
        ].join(", "),
      };
    case "band":
    case "reveal":
      return {
        backgroundImage: `linear-gradient(125deg, transparent 38%, rgba(${ink},0.06) 44%, rgba(${ink},0.06) 56%, transparent 62%)`,
      };
    case "corners":
    case "crop":
      return {
        backgroundImage: [
          `linear-gradient(rgba(${ink},0.18), rgba(${ink},0.18))`,
          `linear-gradient(rgba(${ink},0.18), rgba(${ink},0.18))`,
          `linear-gradient(rgba(${ink},0.18), rgba(${ink},0.18))`,
          `linear-gradient(rgba(${ink},0.18), rgba(${ink},0.18))`,
          `linear-gradient(rgba(${ink},0.18), rgba(${ink},0.18))`,
          `linear-gradient(rgba(${ink},0.18), rgba(${ink},0.18))`,
          `linear-gradient(rgba(${ink},0.18), rgba(${ink},0.18))`,
          `linear-gradient(rgba(${ink},0.18), rgba(${ink},0.18))`,
        ].join(", "),
        backgroundSize:
          "18px 1px, 1px 18px, 18px 1px, 1px 18px, 18px 1px, 1px 18px, 18px 1px, 1px 18px",
        backgroundPosition:
          "10px 10px, 10px 10px, calc(100% - 10px) 10px, calc(100% - 10px) 10px, 10px calc(100% - 10px), 10px calc(100% - 10px), calc(100% - 10px) calc(100% - 10px), calc(100% - 10px) calc(100% - 10px)",
        backgroundRepeat: "no-repeat",
      };
    case "vitrine":
      return {
        backgroundImage: [
          `linear-gradient(rgba(${ink},0.12), rgba(${ink},0.12))`,
          `linear-gradient(rgba(${ink},0.12), rgba(${ink},0.12))`,
          `linear-gradient(rgba(${ink},0.12), rgba(${ink},0.12))`,
          `linear-gradient(rgba(${ink},0.12), rgba(${ink},0.12))`,
        ].join(", "),
        backgroundSize: "100% 1px, 100% 1px, 1px 100%, 1px 100%",
        backgroundPosition: "0 18%, 0 82%, 18% 0, 82% 0",
        backgroundRepeat: "no-repeat",
      };
    case "halftone":
      // Demoted: optional subtle layer only — not selected for new covers
      return {
        backgroundImage: `radial-gradient(circle, rgba(${mid},0.07) 0.8px, transparent 1px)`,
        backgroundSize: "8px 8px",
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
