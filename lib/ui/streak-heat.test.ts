import { describe, expect, it } from "vitest";
import {
  STREAK_PEAK_DAYS,
  streakHeat,
  streakHeatClassName,
} from "@/lib/ui/streak-heat";

describe("streakHeat", () => {
  it("peaks after a couple of consecutive days", () => {
    expect(STREAK_PEAK_DAYS).toBe(3);
    expect(streakHeat(1)).toMatchObject({ phase: "ember", isPeak: false });
    expect(streakHeat(2)).toMatchObject({ phase: "warming", isPeak: false });
    expect(streakHeat(3)).toMatchObject({ phase: "burning", isPeak: true });
    expect(streakHeat(12)).toMatchObject({ phase: "burning", isPeak: true });
  });

  it("returns zero heat for no streak", () => {
    expect(streakHeat(0)).toEqual({
      level: 0,
      phase: "ember",
      isPeak: false,
    });
  });

  it("builds class names for burn and at-risk states", () => {
    expect(streakHeatClassName(streakHeat(3))).toContain("streak-heat-burning");
    expect(streakHeatClassName(streakHeat(3))).toContain("streak-heat-burn");
    expect(streakHeatClassName(streakHeat(2), { atRisk: true })).toContain(
      "streak-heat-at-risk",
    );
  });
});
