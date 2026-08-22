import { afterEach, describe, expect, it } from "vitest";
import { BRAND_PALETTE } from "@/lib/brand/palette";
import {
  applyReaderThemeToDocument,
  clearReaderThemeFromDocument,
  themeToCssVars,
} from "@/lib/lessons/reader-settings";

describe("themeToCssVars", () => {
  it("maps a reader theme to CSS custom properties", () => {
    const vars = themeToCssVars("dark");
    expect(vars["--color-ink"]).toBe(BRAND_PALETTE.white);
    expect(vars["--color-paper"]).toBe(BRAND_PALETTE.ink);
    expect(vars["--color-bg-primary"]).toBe(BRAND_PALETTE.ink);
    expect(vars["--color-text-primary"]).toBe(BRAND_PALETTE.white);
    expect(vars["--color-border"]).toBe(BRAND_PALETTE.ink3);
  });

  it("maps light theme backgrounds to paper tokens", () => {
    const vars = themeToCssVars("light");
    expect(vars["--color-bg-primary"]).toBe(BRAND_PALETTE.white);
    expect(vars["--color-ink"]).toBe(BRAND_PALETTE.ink);
  });
});

describe("applyReaderThemeToDocument / clearReaderThemeFromDocument", () => {
  afterEach(() => {
    clearReaderThemeFromDocument();
    document.documentElement.removeAttribute("style");
    document.body.removeAttribute("style");
  });

  it("applies theme vars to documentElement and restores on clear", () => {
    applyReaderThemeToDocument("dark");
    expect(
      document.documentElement.style.getPropertyValue("--color-ink").trim(),
    ).toBe(BRAND_PALETTE.white);
    expect(document.documentElement.style.backgroundColor).toBe("rgb(10, 10, 10)");

    clearReaderThemeFromDocument();
    expect(
      document.documentElement.style.getPropertyValue("--color-ink"),
    ).toBe("");
  });
});
