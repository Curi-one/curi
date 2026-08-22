import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(
  path.resolve(__dirname, "../../app/globals.css"),
  "utf8",
);
const tailwind = readFileSync(
  path.resolve(__dirname, "../../tailwind.config.ts"),
  "utf8",
);

function darkBlock(): string {
  const start = css.indexOf("html.dark {");
  expect(start).toBeGreaterThan(-1);
  return css.slice(start, css.indexOf("}", start));
}

/**
 * Guards the two halves of the dark-mode contract. Every dark-mode bug found
 * so far was one of these two rules being broken:
 *
 *   1. A token used for TEXT must be remapped by html.dark, or it renders
 *      Ink-on-Ink. `text-ink` was bound to the raw tone and every heading in
 *      the product disappeared in dark mode.
 *   2. A token used on a surface that does NOT flip (track marks are a dark
 *      Ink field in both themes) must itself not flip, or the foreground
 *      inverts while the background stays put.
 */
describe("theme token contract", () => {
  it("binds the `ink` text utility to the semantic role, not the raw tone", () => {
    expect(tailwind).toMatch(/ink:\s*"var\(--color-text-primary\)"/);
    expect(tailwind).not.toMatch(/^\s*ink:\s*"var\(--color-ink\)"/m);
  });

  it("remaps every foreground role for dark mode", () => {
    const block = darkBlock();
    for (const token of [
      "--color-text-primary",
      "--color-text-secondary",
      "--color-text-tertiary",
      "--color-bg-primary",
      "--color-border-subtle",
    ]) {
      expect(block).toContain(token);
    }
  });

  it("never remaps the track-mark tones", () => {
    // A track mark is a dark Ink field in BOTH themes. If html.dark touched
    // these, card labels would invert to Ink-on-Ink and vanish.
    expect(darkBlock()).not.toMatch(/--mark-/);
  });

  it("defines the mark tones from raw tones only", () => {
    const markField = css.match(/--mark-field:\s*([^;]+);/)?.[1] ?? "";
    const markFg = css.match(/--mark-fg:\s*([^;]+);/)?.[1] ?? "";
    const markMeta = css.match(/--mark-meta:\s*([^;]+);/)?.[1] ?? "";

    expect(markField).toBeTruthy();
    for (const value of [markField, markFg, markMeta]) {
      // Raw tones are safe; anything semantic would flip underneath the mark.
      expect(value).not.toMatch(/--color-(bg|text|border)-/);
    }
  });

  it("uses a vermilion intensity ramp with accent on today", () => {
    const start = css.indexOf(".heatmap-cell-0");
    const end = css.indexOf(".ds-panel-dark .heatmap-cell-0");
    const ramp = css.slice(start, end);
    expect(ramp).toMatch(/--color-accent/);
    expect(css).toMatch(
      /\.heatmap-cell-today\s*\{[^}]*var\(--color-accent\)/,
    );
  });
});
