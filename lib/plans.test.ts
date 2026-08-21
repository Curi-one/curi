import { describe, expect, it } from "vitest";
import { isFreePlan, normalizePlan } from "@/lib/plans";

describe("normalizePlan", () => {
  it("maps paid and academy to academy", () => {
    expect(normalizePlan("paid")).toBe("academy");
    expect(normalizePlan("academy")).toBe("academy");
  });

  it("defaults unknown values to free", () => {
    expect(normalizePlan("free")).toBe("free");
    expect(normalizePlan(null)).toBe("free");
    expect(normalizePlan(undefined)).toBe("free");
    expect(normalizePlan("enterprise")).toBe("free");
  });
});

describe("isFreePlan", () => {
  it("treats only academy/paid as paid", () => {
    expect(isFreePlan("free")).toBe(true);
    expect(isFreePlan(null)).toBe(true);
    expect(isFreePlan("academy")).toBe(false);
    expect(isFreePlan("paid")).toBe(false);
  });
});
