export const CONTRIBUTION_WEEKS = 26;
export const CONTRIBUTION_ROWS = 7;

export type HeatmapLevel = 0 | 1 | 2 | 3 | 4;

export type HeatmapCell = {
  key: string;
  date: Date;
  count: number;
  level: HeatmapLevel;
  isToday: boolean;
};

export function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function addLocalDays(d: Date, days: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + days);
  return out;
}

/** Map lesson count to heatmap intensity (0–4). */
export function activityLevel(count: number): HeatmapLevel {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count === 3) return 3;
  return 4;
}

export function datesToActivityByDay(dates: string[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const date of dates) {
    out[date] = (out[date] ?? 0) + 1;
  }
  return out;
}

export function activityByDayToDates(activityByDay: Record<string, number>): string[] {
  return Object.keys(activityByDay).sort();
}

/** 26-week calendar grid ending today — each cell is one local day. */
export function buildHeatmapGrid(
  activityByDay: Record<string, number>,
  today: Date = new Date(),
): {
  columns: HeatmapCell[][];
  activeDays: number;
  totalLessons: number;
  startDayOfWeek: number;
} {
  const end = startOfLocalDay(today);
  const start = addLocalDays(
    end,
    -(CONTRIBUTION_WEEKS * CONTRIBUTION_ROWS - 1),
  );
  const todayKey = localDateKey(end);
  const startDayOfWeek = start.getDay();

  const cells: HeatmapCell[] = [];
  for (let i = 0; i < CONTRIBUTION_WEEKS * CONTRIBUTION_ROWS; i++) {
    const date = addLocalDays(start, i);
    const key = localDateKey(date);
    const count = activityByDay[key] ?? 0;
    cells.push({
      key,
      date,
      count,
      level: activityLevel(count),
      isToday: key === todayKey,
    });
  }

  const columns: HeatmapCell[][] = [];
  for (let c = 0; c < CONTRIBUTION_WEEKS; c++) {
    columns.push(
      cells.slice(
        c * CONTRIBUTION_ROWS,
        c * CONTRIBUTION_ROWS + CONTRIBUTION_ROWS,
      ),
    );
  }

  return {
    columns,
    activeDays: cells.filter((cell) => cell.count > 0).length,
    totalLessons: cells.reduce((sum, cell) => sum + cell.count, 0),
    startDayOfWeek,
  };
}
