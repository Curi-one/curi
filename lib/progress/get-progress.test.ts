import { describe, expect, it, vi } from "vitest";
import { getProgress } from "@/lib/progress/get-progress";

function mockAdmin(options: {
  activityDates: string[];
  activeCount: number;
  masteredCount: number;
}) {
  return {
    from: vi.fn((table: string) => {
      if (table === "lesson_activity") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: options.activityDates.map((activity_date) => ({
                activity_date,
              })),
              error: null,
            }),
          }),
        };
      }
      if (table === "courses") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockImplementation((_col, status: string) =>
                Promise.resolve({
                  count:
                    status === "active"
                      ? options.activeCount
                      : options.masteredCount,
                  error: null,
                }),
              ),
            }),
          }),
        };
      }
      throw new Error(`unexpected ${table}`);
    }),
  };
}

describe("getProgress", () => {
  it("returns zeros for guests", async () => {
    const result = await getProgress({ getUserId: async () => null });
    expect(result).toEqual({
      streak: 0,
      heatmap: [],
      activePaths: 0,
      masteredPaths: 0,
    });
  });

  it("computes streak and path counts for member", async () => {
    const admin = mockAdmin({
      activityDates: ["2026-08-18", "2026-08-19", "2026-08-20"],
      activeCount: 2,
      masteredCount: 1,
    });
    const result = await getProgress({
      admin: admin as never,
      getUserId: async () => "user-1",
    });
    expect(result.streak).toBe(3);
    expect(result.heatmap).toEqual(["2026-08-18", "2026-08-19", "2026-08-20"]);
    expect(result.activePaths).toBe(2);
    expect(result.masteredPaths).toBe(1);
  });
});
