#!/usr/bin/env node
/**
 * Brand compliance check — docs/BRAND.md
 *
 * Catches the mechanical violations only. Judgement calls (is this the most
 * important thing on the screen? is the hierarchy right?) stay with
 * `curi-ux-review`.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const files = ["app", "components", "lib"].flatMap((dir) =>
  readdirSync(dir, { recursive: true, encoding: "utf8" })
    .filter(
      (f) =>
        /\.(tsx|ts|css)$/.test(f) &&
        !f.includes(".test.") &&
        !f.endsWith(".d.ts"),
    )
    .map((f) => join(dir, f)),
);

/**
 * Files permitted to hold raw hex, because they *are* the palette.
 * Hexes there must still be allowlisted warm tones (or accents) — never
 * pure black / white.
 */
const PALETTE_FILES = new Set([
  join("app", "globals.css"), // the token definitions themselves (§8)
  join("lib", "lessons", "reader-settings.ts"), // reader display themes
  join("lib", "ui", "topic-swatch.ts"), // cover art fields (§6.2)
]);

/** Warm greyscale + tertiary + Vermilion (§4.2). Case-insensitive. */
const ALLOWED_HEX = new Set([
  "0a0908", // ink
  "1c1a18", // ink-2
  "2e2c28", // ink-3
  "6b6760", // mid
  "9e9b94", // silver
  "d4d0c8", // light
  "f5f4f0", // paper
  "faf9f5", // white
  "eeede9", // tertiary
  "c1121f", // accent
  "a30f1b", // accent-dark
]);

/** Pure black / white are never brand colours — banned even in palette files. */
const BANNED_HEX = new Set(["000", "000000", "fff", "ffffff"]);

/** Radius is permitted only as none/sm/md, or full on a true circle (§8.4). */
const BAD_RADIUS =
  /\brounded-(?:[tblrse]{1,2}-)?(?:lg|xl|2xl|3xl|\[[^\]]+\])\b/g;
/** Curi uses no box shadows (§8.5, §16.3). */
const SHADOW = /\bshadow(?:-(?:sm|md|lg|xl|2xl|inner|\[[^\]]+\]))?\b(?!-none)/g;
/** Tokens before components — a hardcoded hex is a bug (§17.04). */
const HEX = /#[0-9a-fA-F]{3,8}\b/g;
/** Correct is Ink, errors are Silver. Never green, never red (§9.6, §16.1). */
const FOREIGN_COLOR =
  /\b(?:bg|text|border|ring|from|to|via|decoration)-(?:green|emerald|lime|teal|red|rose|orange|amber|yellow|blue|indigo|violet|purple|pink|sky|cyan)-\d{2,3}\b/g;
/** Fraunces is never used below 18px (product rule: sans/mono under 18px). */
const SMALL_DISPLAY =
  /font-display[^"`]*?(?:text-(?:xs|sm|base)\b|text-\[(?:1[0-7]|\d)(?:\.\d+)?px\]|text-\[(?:0?\.\d+|1\.0\d*)rem\])/g;
/**
 * Product surface may only name the brand trio (§5.1). System role fallbacks
 * (Georgia, system-ui, Courier New) are allowed beside them.
 */
const FOREIGN_FONT =
  /(?:font-family\s*:\s*|fontFamily\s*:\s*['"`]|family\s*:\s*['"`])[^;}"'`]*\b(?:Inter|Roboto|Arial|Helvetica|Cormorant|Instrument|Geist|ui-sans-serif|ui-serif|ui-monospace|SFMono-Regular|Menlo|Monaco|Consolas)\b/gi;

/**
 * Buttons come from `components/Button.tsx` (§9.1). Hand-rolling the classes
 * re-implements the design system and drifts from its size recipe.
 */
const RAW_BUTTON =
  /className=[^>]*?\bbtn-(?:primary|secondary|ghost|danger)\b/g;
/**
 * Type and tracking come off the scale in `tailwind.config.ts` (§5.5, §8.2).
 * An arbitrary value here is a token that does not exist.
 */
const OFF_SCALE_TYPE = /\b(?:text|tracking|leading)-\[[^\]]+\]/g;
/**
 * Fraunces weight and axes are set once in `.font-display` (§5.2). A component
 * that hand-sets them has left the system, and almost always turns SOFT/WONK
 * down in the process.
 */
const INLINE_AXES = /fontVariationSettings|font-variation-settings/g;
/** Display type is always Light (300) — never bolded to signal importance. */
const HEAVY_DISPLAY =
  /(?:font-display|type-display)[^"`]*?\bfont-(?:medium|semibold|bold|extrabold|black)\b/g;

const RULES = [
  ["§8.4 · rounded container (use rounded-none)", BAD_RADIUS, "tsx"],
  ["§8.5 · box shadow (depth comes from surface + rule)", SHADOW, "tsx"],
  [
    "§17.04 · hardcoded hex (use a token or allowlisted warm tone)",
    HEX,
    "palette",
  ],
  [
    "§9.6 · non-brand colour (correct = Ink, error = Silver)",
    FOREIGN_COLOR,
    "all",
  ],
  ["§5.2 · Fraunces below 18px", SMALL_DISPLAY, "tsx"],
  [
    "§5.1 · non-brand typeface (use Fraunces / Plus Jakarta / JetBrains)",
    FOREIGN_FONT,
    "all",
  ],
  ["§9.1 · hand-rolled button (use <Button>)", RAW_BUTTON, "button"],
  ["§5.5 · off-scale type value (use a token)", OFF_SCALE_TYPE, "type"],
  [
    "§5.2 · inline Fraunces axes (set in .font-display only)",
    INLINE_AXES,
    "axes",
  ],
  ["§5.2 · display type heavier than Light 300", HEAVY_DISPLAY, "tsx"],
];

/**
 * Exempt from the type-scale rule: the wordmark carries its own sizing rules
 * (§3.5), and the reader crops oversized letterforms optically (§6.2).
 * The showcase demonstrates fluid type deliberately.
 */
const TYPE_EXEMPT = new Set([
  join("components", "Wordmark.tsx"),
  join("components", "LessonReader.tsx"),
  join("components", "design-system", "DesignSystemShowcase.tsx"),
]);

function expandHex(hex) {
  const h = hex.toLowerCase();
  if (h.length === 3 || h.length === 4) {
    return h
      .slice(0, 3)
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (h.length === 8) return h.slice(0, 6);
  return h;
}

function isBanned(hex) {
  const lower = hex.toLowerCase();
  return BANNED_HEX.has(lower) || BANNED_HEX.has(expandHex(lower));
}

function isAllowed(hex) {
  return ALLOWED_HEX.has(expandHex(hex));
}

/**
 * Warm tinted greys are required. Fail on pure black/white everywhere, and on
 * any hex outside the allowlist (palette files may only use allowlisted tones).
 */
function hexViolations(line) {
  const banned = [];
  const other = [];
  for (const m of line.matchAll(/#([0-9a-fA-F]{3,8})\b/g)) {
    const hex = m[1];
    if (isBanned(hex)) {
      banned.push(`#${hex}`);
      continue;
    }
    if (!isAllowed(hex)) {
      other.push(`#${hex}`);
    }
  }
  return { banned, other };
}

let failures = 0;
const report = (file, i, label, hits) => {
  failures += hits.length;
  console.log(`${file}:${i + 1}  ${label}\n    ${hits.join(", ")}`);
};

for (const file of files) {
  const isTsx = file.endsWith(".tsx");
  const isPalette = PALETTE_FILES.has(file);
  const isButtonSource = file === join("components", "Button.tsx");
  const lines = readFileSync(join(process.cwd(), file), "utf8").split("\n");

  lines.forEach((line, i) => {
    for (const [label, re, scope] of RULES) {
      if (scope === "tsx" && !isTsx) continue;
      if (scope === "palette" && isPalette) continue;
      if (scope === "button" && (!isTsx || isButtonSource)) continue;
      if (scope === "type" && (!isTsx || TYPE_EXEMPT.has(file))) continue;
      if (scope === "axes" && file === join("app", "globals.css")) continue;
      re.lastIndex = 0;
      let hits = line.match(re);
      // §17.04 — allowlisted warm / accent hexes are permitted; banned reported separately
      if (hits && re === HEX) {
        hits = hits.filter((h) => {
          const hex = h.slice(1);
          if (isBanned(hex)) return false;
          return !isAllowed(hex);
        });
        if (!hits.length) continue;
      }
      if (hits) report(file, i, label, hits);
    }

    const { banned, other } = hexViolations(line);
    if (banned.length) {
      report(
        file,
        i,
        "§4.2 · pure black/white banned (use warm ink / white-tone)",
        banned,
      );
    }
    // Palette files: non-allowlisted hexes fail (warm greys must be the defined set)
    if (isPalette && other.length) {
      report(file, i, "§4.2 · hex outside warm palette allowlist", other);
    }
  });
}

/**
 * Vermilion appears once per screen (§4.3). Counted per file as a proxy;
 * a file with more than one accent reference needs a human to confirm only
 * one can render at a time.
 */
for (const file of files) {
  if (!file.endsWith(".tsx")) continue;
  // Living catalog — multiple accent demos are intentional.
  if (file.includes("design-system")) continue;
  const src = readFileSync(join(process.cwd(), file), "utf8");
  const uses = (
    src.match(/\b(?:bg|text|border|border-b|ring|decoration)-accent\b/g) ?? []
  ).length;
  if (uses > 1) {
    console.log(
      `${file}  §4.3 · ${uses} Vermilion references — confirm only one renders per screen`,
    );
    failures += 1;
  }
}

if (failures > 0) {
  console.log(`\n${failures} brand violation(s). See docs/BRAND.md.`);
  process.exit(1);
}
console.log("Brand check passed — docs/BRAND.md");
