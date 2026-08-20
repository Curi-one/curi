import { describe, expect, it } from "vitest";
import { getShareableFact } from "@/lib/lessons/shareable-facts";

describe("getShareableFact", () => {
  it("returns the exact-match fact for a known topic", () => {
    const result = getShareableFact("Venture Capital");
    expect(result.fact).toMatch(/power-law|outlier/i);
  });

  it("returns facts for other prototype topics", () => {
    expect(getShareableFact("Term Sheets").fact).toMatch(/option pool/i);
    expect(getShareableFact("SAFE Notes").fact).toMatch(/SAFE/i);
    expect(getShareableFact("Cap Tables").fact).toMatch(/cap table/i);
    expect(getShareableFact("Unit Economics").fact).toMatch(
      /customer costs too much/i,
    );
  });

  it("fuzzy matches on case and punctuation differences", () => {
    const exact = getShareableFact("Venture Capital");
    expect(getShareableFact("venture capital")).toEqual(exact);
    expect(getShareableFact("VENTURE-CAPITAL!")).toEqual(exact);
    expect(getShareableFact("  venture   capital  ")).toEqual(exact);
  });

  it("fuzzy matches when the topic contains a known key as a substring", () => {
    const exact = getShareableFact("Term Sheets");
    expect(getShareableFact("Startup Term Sheets 101")).toEqual(exact);
  });

  it("falls back to default for unknown topics", () => {
    const fallback = getShareableFact("default");
    expect(getShareableFact("Quantum Basket Weaving")).toEqual(fallback);
    expect(getShareableFact("")).toEqual(fallback);
  });
});
