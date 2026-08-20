import { describe, expect, it, vi } from "vitest";
import { getFeed } from "@/lib/feed/get-feed";

const USER_ID = "user-111";
const TODAY = "2026-08-20";

function mockAdmin(options: {
  timezone?: string;
  courses?: {
    id: string;
    topic: string;
    depth: string;
    progress: number;
    total: number;
    created_at?: string;
  }[];
  activity?: {
    course_id: string;
    activity_date: string;
    lesson_index?: number;
  }[];
  lessons?: { course_id: string; index: number; title: string }[];
}) {
  const from = vi.fn((table: string) => {
    if (table === "users") {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: { timezone: options.timezone ?? "Australia/Sydney" },
              error: null,
            }),
          }),
        }),
      };
    }
    if (table === "courses") {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockImplementation(function (this: unknown, col: string) {
            if (col === "user_id") {
              return {
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockResolvedValue({
                    data: (options.courses ?? []).map((c) => ({
                      created_at: `${TODAY}T00:00:00Z`,
                      ...c,
                    })),
                    error: null,
                  }),
                }),
              };
            }
            return this;
          }),
        }),
      };
    }
    if (table === "lesson_activity") {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: options.activity ?? [],
            error: null,
          }),
        }),
      };
    }
    if (table === "course_lessons") {
      return {
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: options.lessons ?? [],
              error: null,
            }),
          }),
        }),
      };
    }
    throw new Error(`unexpected table ${table}`);
  });

  return { from };
}

describe("getFeed", () => {
  it("returns unauthorized for guests", async () => {
    const result = await getFeed({
      getUserId: async () => null,
    });
    expect(result).toEqual({
      ok: false,
      code: "unauthorized",
      message: "Sign in required for Today feed",
    });
  });

  it("returns 2 due and 1 done for seeded member shape", async () => {
    const admin = mockAdmin({
      courses: [
        {
          id: "c1",
          topic: "SAFE notes",
          depth: "essentials",
          progress: 0,
          total: 7,
        },
        {
          id: "c2",
          topic: "Cap tables",
          depth: "fluent",
          progress: 1,
          total: 12,
        },
        {
          id: "c3",
          topic: "Term sheets",
          depth: "essentials",
          progress: 2,
          total: 8,
        },
      ],
      activity: [{ course_id: "c3", activity_date: TODAY, lesson_index: 2 }],
      lessons: [
        { course_id: "c1", index: 0, title: "SAFE intro" },
        { course_id: "c2", index: 1, title: "Cap tables 2" },
        { course_id: "c3", index: 2, title: "Term sheets 3" },
      ],
    });

    const result = await getFeed({
      admin: admin as never,
      getUserId: async () => USER_ID,
      loadTimezone: async () => "Australia/Sydney",
      now: () => new Date(`${TODAY}T10:00:00Z`),
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.due.map((p) => p.id)).toEqual(["c1", "c2"]);
      expect(result.data.done.map((p) => p.id)).toEqual(["c3"]);

      const todayGroup = result.data.groups.find((g) => g.daysAgo === 0);
      expect(
        todayGroup?.items.some(
          (i) => i.courseId === "c1" && i.status === "available",
        ),
      ).toBe(true);

      const completedGroup = result.data.groups.find((g) => g.daysAgo === 0);
      expect(
        completedGroup?.items.some(
          (i) => i.courseId === "c3" && i.status === "completed",
        ),
      ).toBe(true);
    }
  });
});
