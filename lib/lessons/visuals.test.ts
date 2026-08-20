import { describe, expect, it } from "vitest";
import { getLessonVisual, hasLessonVisual } from "@/lib/lessons/visuals";

describe("hasLessonVisual", () => {
  it("is true for known topics", () => {
    expect(hasLessonVisual("Unit Economics")).toBe(true);
    expect(hasLessonVisual("Venture Capital")).toBe(true);
    expect(hasLessonVisual("Term Sheets")).toBe(true);
    expect(hasLessonVisual("SAFE Notes")).toBe(true);
    expect(hasLessonVisual("Cap Tables")).toBe(true);
  });

  it("fuzzy matches case and punctuation differences", () => {
    expect(hasLessonVisual("unit economics")).toBe(true);
    expect(hasLessonVisual("UNIT-ECONOMICS!")).toBe(true);
  });

  it("is false for unknown topics (no default fallback)", () => {
    expect(hasLessonVisual("Some Unknown Topic")).toBe(false);
    expect(hasLessonVisual("")).toBe(false);
  });
});

describe("getLessonVisual", () => {
  it("returns an equation and formula note for topics with formulas", () => {
    const unitEconomics = getLessonVisual("Unit Economics");
    expect(unitEconomics.equation).toBeTruthy();
    expect(unitEconomics.formulaNote).toBeTruthy();
  });

  it("returns a fallback visual for unknown topics", () => {
    const fallback = getLessonVisual("Some Unknown Topic");
    expect(fallback.imageTitle).toBeTruthy();
    expect(fallback.imageCaption).toBeTruthy();
  });
});
