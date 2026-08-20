import React from "react";
import {
  startOfLocalDay,
  addLocalDays,
  localDateKey,
  lessonContributionLevel,
  CONTRIBUTION_WEEKS,
  CONTRIBUTION_ROWS
} from "@/lib/date-utils";

export function LessonContributionGraph({ activityByDay }) {
  const end = startOfLocalDay(new Date());
  const start = addLocalDays(end, -(CONTRIBUTION_WEEKS * CONTRIBUTION_ROWS - 1));
  const startDow = start.getDay();
  const todayKey = localDateKey(new Date());

  const cells = [];
  for (let i = 0; i < CONTRIBUTION_WEEKS * CONTRIBUTION_ROWS; i++) {
    const date = addLocalDays(start, i);
    const key = localDateKey(date);
    const count = activityByDay[key] || 0;
    cells.push({ key, date, count, isToday: key === todayKey });
  }

  const columns = [];
  for (let c = 0; c < CONTRIBUTION_WEEKS; c++) {
    columns.push(cells.slice(c * CONTRIBUTION_ROWS, c * CONTRIBUTION_ROWS + CONTRIBUTION_ROWS));
  }

  const totalLessons = cells.reduce((s, c) => s + c.count, 0);
  const activeDays = cells.filter((c) => c.count > 0).length;

  // Amber heat scale — cool grey → warm amber → deep gold
  const HEAT = ["#E4E4E4", "#FEF3C7", "#FDE68A", "#FBBF24", "#D97706"];

  const rowLabel = (row) => {
    const dow = (startDow + row) % 7;
    if (row !== 1 && row !== 3 && row !== 5) return null;
    return ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][dow];
  };

  const CELL = 13;

  return (
    <div>
      {/* Header row */}
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Lesson rhythm</p>
          <p className="mt-0.5 text-xs text-muted-foreground">26 weeks · each cell is one day</p>
        </div>
        <div className="flex items-baseline gap-4 text-right">
          <div>
            <span className="font-serif text-2xl tabular-nums text-foreground">{activeDays}</span>
            <span className="ml-1.5 text-[11px] text-muted-foreground">active days</span>
          </div>
          <div>
            <span className="font-serif text-2xl tabular-nums text-foreground">{totalLessons}</span>
            <span className="ml-1.5 text-[11px] text-muted-foreground">lessons</span>
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="overflow-x-auto pb-1">
        <div className="flex gap-[3px]">
          {/* Row labels */}
          <div className="flex shrink-0 flex-col gap-[3px]">
            <div style={{ height: 16 }} aria-hidden />
            {Array.from({ length: CONTRIBUTION_ROWS }, (_, row) => (
              <div
                key={`rw-${row}`}
                style={{ height: CELL, fontSize: 10 }}
                className="flex items-center justify-end pr-1.5 text-muted-foreground/70"
              >
                {rowLabel(row)}
              </div>
            ))}
          </div>

          {/* Week columns */}
          {columns.map((week, wi) => {
            const first = week[0];
            const prevFirst = wi > 0 ? columns[wi - 1][0] : null;
            const showMonth = first && (!prevFirst || first.date.getMonth() !== prevFirst.date.getMonth());
            return (
              <div key={`w-${wi}`} className="flex flex-col gap-[3px]">
                {/* Month label */}
                <div style={{ height: 16, fontSize: 10 }} className="flex items-center font-medium text-muted-foreground">
                  {showMonth ? first.date.toLocaleString(undefined, { month: "short" }) : null}
                </div>
                {/* Day cells */}
                <div className="grid grid-rows-7 gap-[3px]">
                  {week.map((cell) => {
                    const lv = lessonContributionLevel(cell.count);
                    const label = cell.count === 0
                      ? `${cell.key}: no lesson`
                      : `${cell.key}: ${cell.count} lesson${cell.count === 1 ? "" : "s"}`;
                    return (
                      <div
                        key={cell.key}
                        title={label}
                        aria-label={label}
                        style={{
                          width: CELL,
                          height: CELL,
                          background: HEAT[lv],
                          outline: cell.isToday ? "2px solid #0D0D0D" : "none",
                          outlineOffset: "1px",
                          transition: "background 200ms",
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend + today marker */}
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span
            style={{ display: "inline-block", width: 11, height: 11, outline: "2px solid #0D0D0D", outlineOffset: 1, background: HEAT[0] }}
          />
          <span>Today</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">Less</span>
          <div className="flex gap-[3px]">
            {HEAT.map((color, i) => (
              <div key={i} style={{ width: 11, height: 11, background: color }} />
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground">More</span>
        </div>
      </div>
    </div>
  );
}

export default LessonContributionGraph;
