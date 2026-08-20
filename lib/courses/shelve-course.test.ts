import { describe, expect, it, vi } from "vitest";
import { shelveCourse } from "@/lib/courses/shelve-course";

const USER_ID = "user-shelve";
const COURSE_ID = "course-shelve";

function mockAdmin(course: { id: string; status: string } | null) {
  const update = vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    }),
  });

  return {
    from: vi.fn((table: string) => {
      if (table !== "courses") throw new Error(`unexpected ${table}`);
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: course,
                error: null,
              }),
            }),
          }),
        }),
        update,
      };
    }),
    update,
  };
}

describe("shelveCourse", () => {
  it("shelves an active path", async () => {
    const admin = mockAdmin({ id: COURSE_ID, status: "active" });
    const result = await shelveCourse(COURSE_ID, {
      admin: admin as never,
      getUserId: async () => USER_ID,
    });
    expect(result).toEqual({ ok: true, courseId: COURSE_ID });
    expect(admin.update).toHaveBeenCalledWith({ status: "shelved" });
  });

  it("rejects shelve on already shelved path", async () => {
    const admin = mockAdmin({ id: COURSE_ID, status: "shelved" });
    const result = await shelveCourse(COURSE_ID, {
      admin: admin as never,
      getUserId: async () => USER_ID,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("invalid_state");
    }
  });
});
