import { describe, expect, it, vi } from "vitest";
import { restoreCourse } from "@/lib/courses/restore-course";
import { FREE_ACTIVE_PATH_LIMIT } from "@/lib/plans";

const USER_ID = "user-restore";
const COURSE_ID = "course-restore";

function mockAdmin(options: {
  course: { id: string; status: string } | null;
  activeCount?: number;
  plan?: string;
}) {
  const update = vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    }),
  });

  return {
    from: vi.fn((table: string) => {
      if (table === "courses") {
        return {
          select: vi.fn().mockImplementation((_cols: string, opts?: { count?: string; head?: boolean }) => {
            if (opts?.count === "exact" && opts?.head) {
              return {
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockResolvedValue({
                    count: options.activeCount ?? 0,
                    error: null,
                  }),
                }),
              };
            }
            return {
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({
                    data: options.course,
                    error: null,
                  }),
                }),
              }),
            };
          }),
          update,
        };
      }
      if (table === "users") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: { plan: options.plan ?? "free" },
                error: null,
              }),
            }),
          }),
        };
      }
      throw new Error(`unexpected ${table}`);
    }),
    update,
  };
}

describe("restoreCourse", () => {
  it("restores a shelved path to active", async () => {
    const admin = mockAdmin({
      course: { id: COURSE_ID, status: "shelved" },
      activeCount: 1,
      plan: "free",
    });
    const result = await restoreCourse(COURSE_ID, {
      admin: admin as never,
      getUserId: async () => USER_ID,
    });
    expect(result).toEqual({ ok: true, courseId: COURSE_ID });
    expect(admin.update).toHaveBeenCalledWith({ status: "active" });
  });

  it("returns path_limit when free plan is at active cap", async () => {
    const admin = mockAdmin({
      course: { id: COURSE_ID, status: "shelved" },
      activeCount: FREE_ACTIVE_PATH_LIMIT,
      plan: "free",
    });
    const result = await restoreCourse(COURSE_ID, {
      admin: admin as never,
      getUserId: async () => USER_ID,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("path_limit");
    }
    expect(admin.update).not.toHaveBeenCalled();
  });

  it("allows restore on academy when many active paths exist", async () => {
    const admin = mockAdmin({
      course: { id: COURSE_ID, status: "shelved" },
      activeCount: 5,
      plan: "academy",
    });
    const result = await restoreCourse(COURSE_ID, {
      admin: admin as never,
      getUserId: async () => USER_ID,
    });
    expect(result).toEqual({ ok: true, courseId: COURSE_ID });
  });

  it("rejects restore when path is not shelved", async () => {
    const admin = mockAdmin({
      course: { id: COURSE_ID, status: "active" },
      activeCount: 0,
    });
    const result = await restoreCourse(COURSE_ID, {
      admin: admin as never,
      getUserId: async () => USER_ID,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("invalid_state");
    }
  });
});
