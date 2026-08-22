import { Flame } from "lucide-react";
import { streakHeat, streakHeatClassName } from "@/lib/ui/streak-heat";

type Props = {
  streak: number;
  atRisk?: boolean;
  /** Show numeric count beside / below the flame. */
  showCount?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  countClassName?: string;
};

const FLAME_SIZE = { sm: 16, md: 18, lg: 22 } as const;

/**
 * Streak flame — heats from ink toward vermilion over STREAK_PEAK_DAYS,
 * then burns at peak. No badge chrome (BRAND §11.3).
 */
export function StreakIndicator({
  streak,
  atRisk = false,
  showCount = true,
  size = "md",
  className = "",
  countClassName = "",
}: Props) {
  if (streak <= 0) return null;

  const heat = streakHeat(streak);
  const heatClass = streakHeatClassName(heat, { atRisk });

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${heatClass} ${className}`}
      title={
        atRisk
          ? `${streak}-day streak — keep it alive today`
          : `${streak}-day streak`
      }
    >
      <Flame
        size={FLAME_SIZE[size]}
        strokeWidth={heat.isPeak || atRisk ? 2.2 : 1.8}
        className="streak-heat-flame shrink-0"
        aria-hidden
      />
      {showCount ? (
        <span
          className={`streak-heat-count font-meta tabular-nums leading-none ${countClassName}`}
        >
          {streak}
        </span>
      ) : null}
    </span>
  );
}

/** Inline “N-day streak” label with heated flame. */
export function StreakLabel({
  streak,
  atRisk = false,
  className = "",
}: {
  streak: number;
  atRisk?: boolean;
  className?: string;
}) {
  if (streak <= 0) return null;

  const heat = streakHeat(streak);
  const heatClass = streakHeatClassName(heat, { atRisk });

  return (
    <span className={`inline-flex items-center gap-2 ${heatClass} ${className}`}>
      <Flame
        size={15}
        strokeWidth={heat.isPeak || atRisk ? 2.2 : 1.8}
        className="streak-heat-flame shrink-0"
        aria-hidden
      />
      <span className="streak-heat-count">{streak}-day streak</span>
    </span>
  );
}
