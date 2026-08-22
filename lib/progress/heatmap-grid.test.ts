import { describe, expect, it } from "vitest";
import {
  activityByDayToDates,
  activityLevel,
  buildHeatmapGrid,
  datesToActivityByDay,
  localDateKey,
} from "@/lib/progress/heatmap-grid";

describe("heatmap-grid", () => {
  it("maps lesson counts to intensity levels", () => {
    expect(activityLevel(0)).toBe(0);
    expect(activityLevel(1)).toBe(1);
    expect(activityLevel(3)).toBe(3);
    expect(activityLevel(9)).toBe(4);
  });

  it("places activity on the correct calendar day", () => {
    const today = new Date(2026, 7, 22);
    const key = localDateKey(today);
    const { columns } = buildHeatmapGrid({ [key]: 2 }, today);
    const flat = columns.flat();
    const todayCell = flat.find((cell) => cell.isToday);
    expect(todayCell?.count).toBe(2);
    expect(todayCell?.level).toBe(2);
  });

  it("converts between date lists and activity maps", () => {
    const map = datesToActivityByDay([
      "2026-08-20",
      "2026-08-20",
      "2026-08-21",
    ]);
    expect(map).toEqual({ "2026-08-20": 2, "2026-08-21": 1 });
    expect(activityByDayToDates(map)).toEqual(["2026-08-20", "2026-08-21"]);
  });
});
