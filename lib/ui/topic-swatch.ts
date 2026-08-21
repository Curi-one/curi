/**
 * Deterministic cover art for catalogue / library topic imagery.
 *
 * Greyscale only: imagery is never rendered in colour (BRAND.md §6.3).
 * Fields use warm ink tones from the brand palette — never cold
 * `hsl(0 0% n%)` or pure `#000` / `#FFF` (WEBSITE-DESIGN-RULES §1.1).
 * Glyphs prefer BRAND §6.2 symbols when topic keywords match.
 */

export type TopicPattern =
  | "hatch"
  | "grid"
  | "halftone"
  | "rules"
  | "grain"
  | "band"
  | "corners";

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

const PATTERNS: TopicPattern[] = [
  "hatch",
  "grid",
  "halftone",
  "rules",
  "grain",
  "band",
  "corners",
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

/** CSS overlay styles for a topic pattern (warm paper ink at low opacity). */
export function topicPatternStyle(
  pattern: TopicPattern,
): Record<string, string> {
  const ink = "250,249,245";
  switch (pattern) {
    case "hatch":
      return {
        backgroundImage: `repeating-linear-gradient(138deg, transparent, transparent 5px, rgba(${ink},0.045) 5px, rgba(${ink},0.045) 6px)`,
      };
    case "grid":
      return {
        backgroundImage: `linear-gradient(rgba(${ink},0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(${ink},0.06) 1px, transparent 1px)`,
        backgroundSize: "14px 14px",
      };
    case "halftone":
      return {
        backgroundImage: `radial-gradient(circle, rgba(${ink},0.09) 1px, transparent 1.2px)`,
        backgroundSize: "7px 7px",
      };
    case "rules":
      return {
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 11px, rgba(${ink},0.05) 11px, rgba(${ink},0.05) 12px)`,
      };
    case "grain":
      return {
        backgroundImage: [
          `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(${ink},0.03) 2px, rgba(${ink},0.03) 3px)`,
          `repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(${ink},0.025) 3px, rgba(${ink},0.025) 4px)`,
        ].join(", "),
      };
    case "band":
      return {
        backgroundImage: `linear-gradient(125deg, transparent 38%, rgba(${ink},0.035) 44%, rgba(${ink},0.035) 56%, transparent 62%)`,
      };
    case "corners":
      return {
        backgroundImage: [
          `linear-gradient(rgba(${ink},0.14), rgba(${ink},0.14))`,
          `linear-gradient(rgba(${ink},0.14), rgba(${ink},0.14))`,
          `linear-gradient(rgba(${ink},0.14), rgba(${ink},0.14))`,
          `linear-gradient(rgba(${ink},0.14), rgba(${ink},0.14))`,
          `linear-gradient(rgba(${ink},0.14), rgba(${ink},0.14))`,
          `linear-gradient(rgba(${ink},0.14), rgba(${ink},0.14))`,
          `linear-gradient(rgba(${ink},0.14), rgba(${ink},0.14))`,
          `linear-gradient(rgba(${ink},0.14), rgba(${ink},0.14))`,
        ].join(", "),
        backgroundSize:
          "22px 1px, 1px 22px, 22px 1px, 1px 22px, 22px 1px, 1px 22px, 22px 1px, 1px 22px",
        backgroundPosition:
          "12px 12px, 12px 12px, calc(100% - 12px) 12px, calc(100% - 12px) 12px, 12px calc(100% - 12px), 12px calc(100% - 12px), calc(100% - 12px) calc(100% - 12px), calc(100% - 12px) calc(100% - 12px)",
        backgroundRepeat: "no-repeat",
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
