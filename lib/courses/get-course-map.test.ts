import { describe, expect, it, vi } from "vitest";
import { getCourseMap } from "@/lib/courses/get-course-map";

const USER_ID = "user-map";
const COURSE_ID = "course-abc";

function mockAdmin(options: {
  course: Record<string, unknown> | null;
  lessons: { index: number; title: string }[];
}) {
  return {
    from: vi.fn((table: string) => {
      if (table === "courses") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockImplementation(function (this: unknown, col: string) {
              if (col === "id") {
                return {
                  eq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({
                      data: options.course,
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
      if (table === "course_lessons") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: options.lessons,
                error: null,
              }),
            }),
          }),
        };
      }
      throw new Error(`unexpected ${table}`);
    }),
  };
}

describe("getCourseMap", () => {
  it("returns not_found for missing course", async () => {
    const admin = mockAdmin({ course: null, lessons: [] });
    const result = await getCourseMap(COURSE_ID, {
      admin: admin as never,
      getUserId: async () => USER_ID,
    });
    expect(result).toEqual({
      ok: false,
      code: "not_found",
      message: "Path not found",
    });
  });

  it("returns path map nodes for active course", async () => {
    const admin = mockAdmin({
      course: {
        id: COURSE_ID,
        topic: "Cap tables",
        depth: "fluent",
        progress: 1,
        total: 12,
        status: "active",
      },
      lessons: [
        { index: 0, title: "Intro" },
        { index: 1, title: "Dilution" },
        { index: 2, title: "Options" },
      ],
    });

    const result = await getCourseMap(COURSE_ID, {
      admin: admin as never,
      getUserId: async () => USER_ID,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.nodes.map((n) => n.status)).toEqual([
        "read",
        "today",
        "locked",
      ]);
    }
  });
});
