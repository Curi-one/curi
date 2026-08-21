"use client";

import { useMemo, useState } from "react";

type Props = {
  dates: string[];
  streak: number;
  atRisk?: boolean;
};

type Cell = {
  key: string;
  level: 0 | 1 | 2 | 3 | 4;
  date?: string;
};

function intensityFor(
  date: string | undefined,
  active: Set<string>,
): 0 | 1 | 2 | 3 | 4 {
  if (!date || !active.has(date)) return 0;
  let neighbours = 0;
  const base = Date.parse(`${date}T12:00:00Z`);
  for (const offset of [-2, -1, 1, 2]) {
    const d = new Date(base + offset * 86400000).toISOString().slice(0, 10);
    if (active.has(d)) neighbours++;
  }
  if (neighbours >= 3) return 4;
  if (neighbours === 2) return 3;
  if (neighbours === 1) return 2;
  return 1;
}

/** 26-week activity grid — intensity from local density; peak days use accent. */
export function Heatmap({ dates, streak, atRisk }: Props) {
  const weeks = 26;
  const days = 7;
  const [hover, setHover] = useState<string | null>(null);

  const { grid, activeDays } = useMemo(() => {
    const active = new Set(dates);
    const sorted = [...dates].sort();
    const cells: Cell[][] = Array.from({ length: weeks }, (_, wi) =>
      Array.from({ length: days }, (_, di) => ({
        key: `${wi}-${di}`,
        level: 0 as const,
      })),
    );

    for (let i = 0; i < Math.min(sorted.length, weeks * days); i++) {
      const date = sorted[sorted.length - 1 - i];
      const wi = weeks - 1 - Math.floor(i / days);
      const di = days - 1 - (i % days);
      if (wi < 0) continue;
      cells[wi][di] = {
        key: `${wi}-${di}`,
        date,
        level: intensityFor(date, active),
      };
    }

    return { grid: cells, activeDays: dates.length };
  }, [dates]);

  return (
    <div>
      <div className="flex items-baseline gap-2">
        <span
          className={`font-display text-3xl transition-colors duration-300 ${
            atRisk ? "text-streak" : "text-ink"
          }`}
        >
          {streak}
        </span>
        <span className="font-ui text-sm text-ink-muted">day streak</span>
        {atRisk && (
          <span className="ml-auto font-meta text-streak">At risk</span>
        )}
      </div>
      <p className="mt-1 font-ui text-sm text-ink-muted">
        <span className="font-display text-lg tabular-nums text-ink">
          {activeDays}
        </span>
        <span className="ml-1.5">active days</span>
      </p>
      <div className="mt-4 overflow-x-auto">
        <div className="inline-flex gap-1" role="img" aria-label="Activity heatmap">
          {grid.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((cell) => (
                <button
                  key={cell.key}
                  type="button"
                  className={`heatmap-cell heatmap-cell-${cell.level} focus-ring`}
                  aria-label={
                    cell.date
                      ? `${cell.date}, intensity ${cell.level}`
                      : "No activity"
                  }
                  onMouseEnter={() => setHover(cell.date ?? null)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(cell.date ?? null)}
                  onBlur={() => setHover(null)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <span className="font-meta normal-case tracking-normal text-[9px]">
            Less
          </span>
          {[0, 1, 2, 3, 4].map((level) => (
            <span
              key={level}
              className={`heatmap-cell heatmap-cell-${level}`}
              aria-hidden
            />
          ))}
          <span className="font-meta normal-case tracking-normal text-[9px]">
            More
          </span>
        </div>
        <p className="font-meta min-h-[1rem] normal-case tracking-normal text-[10px] text-ink-muted">
          {hover ?? "Hover a day"}
        </p>
      </div>
    </div>
  );
}
