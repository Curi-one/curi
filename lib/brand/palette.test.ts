import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { BRAND_PALETTE } from "@/lib/brand/palette";

const css = readFileSync(
  path.resolve(__dirname, "../../app/globals.css"),
  "utf8",
);

/** Keeps TS consumers and globals.css :root in sync. */
describe("BRAND_PALETTE", () => {
  it("mirrors app/globals.css greyscale tokens", () => {
    for (const [token, hex] of [
      ["--color-ink", BRAND_PALETTE.ink],
      ["--color-ink-2", BRAND_PALETTE.ink2],
      ["--color-ink-3", BRAND_PALETTE.ink3],
      ["--color-mid", BRAND_PALETTE.mid],
      ["--color-silver", BRAND_PALETTE.silver],
      ["--color-light", BRAND_PALETTE.light],
      ["--color-paper-tone", BRAND_PALETTE.paper],
      ["--color-white-tone", BRAND_PALETTE.white],
      ["--color-pale", BRAND_PALETTE.pale],
      ["--color-accent", BRAND_PALETTE.accent],
    ] as const) {
      expect(css).toMatch(new RegExp(`${token}:\\s*${hex};`));
    }
  });
});
