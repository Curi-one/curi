import { describe, expect, it } from "vitest";
import { isPathDueToday } from "@/lib/due-today";

describe("isPathDueToday", () => {
  it("returns true when there is no activity today", () => {
    expect(
      isPathDueToday({
        progress: 2,
        totalLessons: 10,
        hasActivityToday: false,
      }),
    ).toBe(true);
  });
});
