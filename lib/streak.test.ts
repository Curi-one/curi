import { describe, expect, it } from "vitest";
import { computeStreak } from "@/lib/streak";

describe("computeStreak", () => {
  it("returns 0 when there is no activity", () => {
    expect(computeStreak([])).toBe(0);
  });
});
