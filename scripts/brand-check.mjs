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
 * Everything in them still has to be neutral — the tint rule applies globally.
 */
const PALETTE_FILES = new Set([
  join("app", "globals.css"), // the token definitions themselves (§8)
  join("lib", "lessons", "reader-settings.ts"), // reader display themes
  join("lib", "ui", "topic-swatch.ts"), // cover art fields (§6.2)
]);

/** Vermilion is the only chromatic value in the system (§4.2). */
const ACCENT_HEX = new Set(["c1121f", "a30f1b"]);

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
/** Fraunces is never used below 20px (product rule: sans/mono under 20px). */
const SMALL_DISPLAY =
  /font-display[^"`]*?\b(?:text-(?:xs|sm|base)|text-\[1[0-9]px\])\b/g;
/**
 * Product surface may only name the brand trio (§5.1). System role fallbacks
 * (Georgia, system-ui, Courier New) are allowed beside them.
 */
const FOREIGN_FONT =
  /(?:font-family\s*:\s*|fontFamily\s*:\s*['"`]|family\s*:\s*['"`])[^;}"'`]*\b(?:Inter|Roboto|Arial|Helvetica|Cormorant|Instrument|Geist|ui-sans-serif|ui-serif|ui-monospace|SFMono-Regular|Menlo|Monaco|Consolas)\b/gi;

const RULES = [
  ["§8.4 · rounded container (use rounded-none)", BAD_RADIUS, "tsx"],
  ["§8.5 · box shadow (depth comes from surface + rule)", SHADOW, "tsx"],
  ["§17.04 · hardcoded hex (use a token)", HEX, "palette"],
  [
    "§9.6 · non-brand colour (correct = Ink, error = Silver)",
    FOREIGN_COLOR,
    "all",
  ],
  ["§5.2 · Fraunces below 20px", SMALL_DISPLAY, "tsx"],
  ["§5.1 · non-brand typeface (use Fraunces / Plus Jakarta / JetBrains)", FOREIGN_FONT, "all"],
];

/**
 * Every greyscale value must have equal R, G, and B channels (§4.2, §16.1).
 * Catches cream, sepia, and any warm or cool cast — including in the palette
 * files, which is exactly where a tint would otherwise hide.
 */
function tintedGreys(line) {
  const out = [];
  for (const m of line.matchAll(/#([0-9a-fA-F]{6})\b/g)) {
    const hex = m[1].toLowerCase();
    if (ACCENT_HEX.has(hex)) continue;
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
    if (Math.max(r, g, b) - Math.min(r, g, b) > 2) out.push(`#${hex}`);
  }
  for (const m of line.matchAll(/hsl\(\s*[\d.]+\s+([\d.]+)%/g)) {
    if (parseFloat(m[1]) > 0) out.push(m[0]);
  }
  return out;
}

let failures = 0;
const report = (file, i, label, hits) => {
  failures += hits.length;
  console.log(`${file}:${i + 1}  ${label}\n    ${hits.join(", ")}`);
};

for (const file of files) {
  const isTsx = file.endsWith(".tsx");
  const isPalette = PALETTE_FILES.has(file);
  const lines = readFileSync(join(process.cwd(), file), "utf8").split("\n");

  lines.forEach((line, i) => {
    for (const [label, re, scope] of RULES) {
      if (scope === "tsx" && !isTsx) continue;
      if (scope === "palette" && isPalette) continue;
      re.lastIndex = 0;
      const hits = line.match(re);
      if (hits) report(file, i, label, hits);
    }
    const tints = tintedGreys(line);
    if (tints.length) {
      report(file, i, "§4.2 · tinted grey (greyscale must be neutral)", tints);
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
