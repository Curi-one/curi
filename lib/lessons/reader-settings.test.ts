import { afterEach, describe, expect, it } from "vitest";
import {
  applyReaderThemeToDocument,
  clearReaderThemeFromDocument,
  themeToCssVars,
} from "@/lib/lessons/reader-settings";

describe("themeToCssVars", () => {
  it("maps a reader theme to CSS custom properties", () => {
    const vars = themeToCssVars("dark");
    expect(vars["--color-ink"]).toBe("#FAF9F5");
    expect(vars["--color-paper"]).toBe("#0A0908");
    expect(vars["--color-bg-primary"]).toBe("#0A0908");
    expect(vars["--color-text-primary"]).toBe("#FAF9F5");
    expect(vars["--color-border"]).toBe("#2E2C28");
  });

  it("maps light theme backgrounds to paper tokens", () => {
    const vars = themeToCssVars("light");
    expect(vars["--color-bg-primary"]).toBe("#FAF9F5");
    expect(vars["--color-ink"]).toBe("#0A0908");
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
    ).toBe("#FAF9F5");
    expect(document.documentElement.style.backgroundColor).toBe(
      "rgb(10, 9, 8)",
    );

    clearReaderThemeFromDocument();
    expect(
      document.documentElement.style.getPropertyValue("--color-ink"),
    ).toBe("");
  });
});
