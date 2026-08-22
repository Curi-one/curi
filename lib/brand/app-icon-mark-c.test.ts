import { describe, expect, it } from "vitest";
import {
  APP_ICON_ACCENT,
  APP_ICON_INK,
  APP_ICON_PAPER,
  markCMetrics,
} from "./app-icon-mark-c";

describe("markCMetrics", () => {
  it("uses brand colours from the icon exploration", () => {
    expect(APP_ICON_INK).toBe("#0a0908");
    expect(APP_ICON_PAPER).toBe("#faf9f5");
    expect(APP_ICON_ACCENT).toBe("#c1121f");
  });

  it("scales glyph and accent dot from the 256px reference", () => {
    expect(markCMetrics(256)).toEqual({
      glyphSize: 172,
      dotSize: 18,
      dotInset: 18,
    });
    expect(markCMetrics(32)).toEqual({
      glyphSize: 22,
      dotSize: 2,
      dotInset: 2,
    });
  });
});
