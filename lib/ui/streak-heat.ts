/** Consecutive days of activity needed to reach full “burn” intensity. */
export const STREAK_PEAK_DAYS = 3;

export type StreakHeatPhase = "ember" | "warming" | "burning";

export type StreakHeat = {
  /** 0 = cool ember, 1 = peak burn */
  level: number;
  phase: StreakHeatPhase;
  isPeak: boolean;
};

/**
 * Maps streak length to visual heat — ink at day 1, warming through day 2,
 * vermilion “burn” from day 3 onward.
 */
export function streakHeat(streak: number): StreakHeat {
  if (streak <= 0) {
    return { level: 0, phase: "ember", isPeak: false };
  }

  const level =
    STREAK_PEAK_DAYS <= 1
      ? 1
      : Math.min(1, (streak - 1) / (STREAK_PEAK_DAYS - 1));

  let phase: StreakHeatPhase = "ember";
  if (level >= 1) {
    phase = "burning";
  } else if (level >= 0.5) {
    phase = "warming";
  }

  return { level, phase, isPeak: level >= 1 };
}

export function streakHeatClassName(
  heat: StreakHeat,
  { atRisk = false }: { atRisk?: boolean } = {},
): string {
  const parts = ["streak-heat", `streak-heat-${heat.phase}`];
  if (heat.isPeak) {
    parts.push("streak-heat-burn");
  }
  if (atRisk && heat.level > 0) {
    parts.push("streak-heat-at-risk");
  }
  return parts.join(" ");
}
