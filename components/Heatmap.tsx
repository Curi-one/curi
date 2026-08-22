"use client";

import { useMemo, useState } from "react";
import {
  CONTRIBUTION_ROWS,
  buildHeatmapGrid,
  datesToActivityByDay,
  type HeatmapCell,
} from "@/lib/progress/heatmap-grid";

type Props = {
  /** Lesson counts keyed by ISO date (YYYY-MM-DD). */
  activityByDay?: Record<string, number>;
  /** @deprecated Prefer activityByDay — unique activity dates (count = 1 each). */
  dates?: string[];
  streak: number;
  atRisk?: boolean;
};

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function rowLabel(row: number, startDayOfWeek: number): string | null {
  if (row !== 1 && row !== 3 && row !== 5) return null;
  const dow = (startDayOfWeek + row) % 7;
  return WEEKDAY_LABELS[dow];
}

function cellLabel(cell: HeatmapCell): string {
  if (cell.count === 0) return `${cell.key}: no lessons`;
  return `${cell.key}: ${cell.count} lesson${cell.count === 1 ? "" : "s"}`;
}

/** 26-week activity calendar — vermilion intensity from lesson count per day. */
export function Heatmap({ activityByDay, dates, streak, atRisk }: Props) {
  const [hover, setHover] = useState<string | null>(null);

  const normalized = useMemo(() => {
    if (activityByDay && Object.keys(activityByDay).length > 0) {
      return activityByDay;
    }
    if (dates?.length) {
      return datesToActivityByDay(dates);
    }
    return {};
  }, [activityByDay, dates]);

  const { columns, activeDays, totalLessons, startDayOfWeek } = useMemo(
    () => buildHeatmapGrid(normalized),
    [normalized],
  );

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="type-kicker-mark">Lesson rhythm</p>
          <p className="mt-1 font-ui text-sm text-ink-muted">
            26 weeks · each cell is one day
          </p>
        </div>
        <div className="flex items-baseline gap-5 text-right">
          <div>
            <span
              className={`font-display text-3xl tabular-nums transition-colors duration-300 ${
                atRisk ? "text-streak" : "text-ink"
              }`}
            >
              {streak}
            </span>
            <span className="ml-1.5 font-ui text-sm text-ink-muted">
              day streak
            </span>
          </div>
          <div>
            <span className="font-display text-2xl tabular-nums text-ink">
              {activeDays}
            </span>
            <span className="ml-1.5 font-ui text-sm text-ink-muted">
              active days
            </span>
          </div>
          <div>
            <span className="font-display text-2xl tabular-nums text-ink">
              {totalLessons}
            </span>
            <span className="ml-1.5 font-ui text-sm text-ink-muted">
              lessons
            </span>
          </div>
        </div>
      </div>

      {atRisk && (
        <p className="mt-3 font-meta text-streak">Streak at risk today</p>
      )}

      <div className="mt-5 overflow-x-auto pb-1">
        <div
          className="inline-flex gap-[3px]"
          role="img"
          aria-label="Activity heatmap"
        >
          <div className="flex shrink-0 flex-col gap-[3px]">
            <div className="h-4" aria-hidden />
            {Array.from({ length: CONTRIBUTION_ROWS }, (_, row) => (
              <div
                key={`row-${row}`}
                className="flex h-3 w-5 items-center justify-end pr-1 font-meta text-[10px] normal-case tracking-normal text-ink-faint"
              >
                {rowLabel(row, startDayOfWeek)}
              </div>
            ))}
          </div>

          {columns.map((week, weekIndex) => {
            const first = week[0];
            const prevFirst =
              weekIndex > 0 ? columns[weekIndex - 1][0] : undefined;
            const showMonth =
              first &&
              (!prevFirst ||
                first.date.getMonth() !== prevFirst.date.getMonth());

            return (
              <div key={`week-${weekIndex}`} className="flex flex-col gap-[3px]">
                <div className="flex h-4 items-center font-meta text-[10px] normal-case tracking-normal text-ink-muted">
                  {showMonth
                    ? first.date.toLocaleString(undefined, { month: "short" })
                    : null}
                </div>
                <div className="grid grid-rows-7 gap-[3px]">
                  {week.map((cell) => (
                    <button
                      key={cell.key}
                      type="button"
                      className={`heatmap-cell heatmap-cell-${cell.level} focus-ring ${
                        cell.isToday ? "heatmap-cell-today" : ""
                      }`}
                      aria-label={cellLabel(cell)}
                      onMouseEnter={() => setHover(cellLabel(cell))}
                      onMouseLeave={() => setHover(null)}
                      onFocus={() => setHover(cellLabel(cell))}
                      onBlur={() => setHover(null)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <span
            className="heatmap-cell heatmap-cell-0 heatmap-cell-today"
            aria-hidden
          />
          <span className="font-meta normal-case tracking-normal text-mono-xs text-ink-muted">
            Today
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-meta normal-case tracking-normal text-mono-xs text-ink-muted">
            Less
          </span>
          {[0, 1, 2, 3, 4].map((level) => (
            <span
              key={level}
              className={`heatmap-cell heatmap-cell-${level}`}
              aria-hidden
            />
          ))}
          <span className="font-meta normal-case tracking-normal text-mono-xs text-ink-muted">
            More
          </span>
        </div>
        <p className="font-meta min-h-[1rem] normal-case tracking-normal text-ui-4xs text-ink-muted">
          {hover ?? "Hover a day"}
        </p>
      </div>
    </div>
  );
}
