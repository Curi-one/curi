type Props = {
  dates: string[];
  streak: number;
  atRisk?: boolean;
};

/** Renders a 26-week × 7-day grid from ISO date strings. */
export function Heatmap({ dates, streak, atRisk }: Props) {
  const weeks = 26;
  const days = 7;
  const active = new Set(dates);
  const activeDays = dates.length;
  const grid: boolean[][] = Array.from({ length: weeks }, () =>
    Array.from({ length: days }, () => false),
  );
  const sorted = [...dates].sort();
  for (let i = 0; i < Math.min(sorted.length, weeks * days); i++) {
    const wi = weeks - 1 - Math.floor(i / days);
    const di = days - 1 - (i % days);
    if (wi >= 0 && active.has(sorted[sorted.length - 1 - i])) {
      grid[wi][di] = true;
    }
  }

  return (
    <div>
      <div className="flex items-baseline gap-2">
        <span
          className={`font-display text-3xl ${atRisk ? "text-streak" : "text-ink"}`}
        >
          {streak}
        </span>
        <span className="text-sm text-ink-muted">day streak</span>
        {atRisk && (
          <span className="ml-auto text-xs font-medium text-streak">At risk</span>
        )}
      </div>
      <p className="mt-1 text-sm text-ink-muted">
        <span className="font-display text-lg tabular-nums text-ink">
          {activeDays}
        </span>
        <span className="ml-1.5">active days</span>
      </p>
      <div className="mt-4 overflow-x-auto">
        <div className="inline-flex gap-1">
          {grid.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((cell, di) => (
                <div
                  key={`${wi}-${di}`}
                  className={`h-3 w-3 rounded-sm ${
                    cell ? "bg-ink" : "bg-paper-tertiary"
                  }`}
                  aria-hidden
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
