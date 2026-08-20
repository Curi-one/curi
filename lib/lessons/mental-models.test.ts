import { describe, expect, it } from "vitest";
import { getMentalModel } from "@/lib/lessons/mental-models";

describe("getMentalModel", () => {
  it("returns a curated Surface/Incentive/Trade-off model for a known topic", () => {
    const model = getMentalModel("Venture Capital");
    expect(model.surface.length).toBeGreaterThan(0);
    expect(model.incentive.length).toBeGreaterThan(0);
    expect(model.tradeoff.length).toBeGreaterThan(0);
  });

  it("has curated models for major founder topics", () => {
    for (const topic of [
      "Venture Capital",
      "Term Sheets",
      "SAFE Notes",
      "Cap Tables",
      "Unit Economics",
    ]) {
      const generic = getMentalModel("Some Unknown Topic Xyz");
      const model = getMentalModel(topic);
      expect(model).not.toEqual(generic);
    }
  });

  it("fuzzy matches case and punctuation differences", () => {
    const exact = getMentalModel("Cap Tables");
    expect(getMentalModel("cap tables")).toEqual(exact);
    expect(getMentalModel("CAP-TABLES!!")).toEqual(exact);
  });

  it("falls back to a topic-aware generic model for unknown topics", () => {
    const model = getMentalModel("Underwater Basket Weaving");
    expect(model.incentive.toLowerCase()).toContain(
      "underwater basket weaving",
    );
  });
});
