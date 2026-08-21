import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PathOutlinePayload } from "@/lib/cache/content-cache";
import { AuthUnavailableError, createCourse } from "@/lib/courses/create-course";

const OUTLINE: PathOutlinePayload = {
  total: 6,
  lessons: Array.from({ length: 6 }, (_, i) => ({
    index: i,
    title: `L${i}`,
  })),
};

function mockAdminForGuest(pendingId = "pending-uuid-1") {
  const single = vi.fn().mockResolvedValue({
    data: { id: pendingId },
    error: null,
  });
  const select = vi.fn().mockReturnValue({ single });
  const insert = vi.fn().mockReturnValue({ select });
  const from = vi.fn().mockReturnValue({ insert });

  return { client: { from }, from, insert, select, single };
}

describe("createCourse", () => {
  const generateOutline = vi.fn();

  beforeEach(() => {
    generateOutline.mockReset().mockResolvedValue(OUTLINE);
  });

  it("guest writes pending_courses and returns courseId + outline", async () => {
    const admin = mockAdminForGuest("pending-abc");

    const result = await createCourse(
      {
        sessionId: "guest-session-1",
        request: {
          topic: "Stoicism",
          depth: "essentials",
          clarifications: [{ questionId: "focus", answer: "Practice" }],
        },
      },
      {
        admin: admin.client as never,
        getUser: async () => null,
        generateOutline,
      },
    );

    expect(result).toEqual({
      ok: true,
      data: {
        courseId: "pending-abc",
        outline: OUTLINE.lessons,
      },
    });
    expect(admin.from).toHaveBeenCalledWith("pending_courses");
    expect(admin.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        anonymous_id: "guest-session-1",
        topic: "Stoicism",
        depth: "essentials",
        clarifications: [{ questionId: "focus", answer: "Practice" }],
        outline: OUTLINE.lessons,
      }),
    );
    const inserted = admin.insert.mock.calls[0]![0] as {
      expires_at: string;
    };
    const expires = new Date(inserted.expires_at).getTime();
    const now = Date.now();
    expect(expires).toBeGreaterThan(now + 23 * 60 * 60 * 1000);
    expect(expires).toBeLessThanOrEqual(now + 25 * 60 * 60 * 1000);
  });

  it("member free plan returns plan_limit when active count >= 2", async () => {
    const result = await createCourse(
      {
        sessionId: "member-session",
        request: {
          topic: "Third path",
          depth: "fluent",
          clarifications: [],
        },
      },
      {
        admin: {
          from: vi.fn(),
        } as never,
        getUser: async () => ({ id: "user-1", plan: "free" as const }),
        countActiveCourses: async () => 2,
        generateOutline,
      },
    );

    expect(result).toEqual({
      ok: false,
      code: "plan_limit",
      message: "Free plan allows up to 2 active paths. Upgrade to Academy.",
    });
    expect(generateOutline).not.toHaveBeenCalled();
  });

  it("member inserts courses and course_lessons", async () => {
    const lessonsInsert = vi.fn().mockResolvedValue({ error: null });
    const courseSingle = vi.fn().mockResolvedValue({
      data: { id: "course-1" },
      error: null,
    });
    const courseSelect = vi.fn().mockReturnValue({ single: courseSingle });
    const courseInsert = vi.fn().mockReturnValue({ select: courseSelect });

    const from = vi.fn((table: string) => {
      if (table === "courses") {
        return { insert: courseInsert };
      }
      if (table === "course_lessons") {
        return { insert: lessonsInsert };
      }
      throw new Error(`unexpected table ${table}`);
    });

    const result = await createCourse(
      {
        sessionId: "member-session",
        request: {
          topic: "Climate",
          depth: "essentials",
          clarifications: [],
        },
      },
      {
        admin: { from } as never,
        getUser: async () => ({ id: "user-1", plan: "free" as const }),
        countActiveCourses: async () => 0,
        generateOutline,
      },
    );

    expect(result).toEqual({
      ok: true,
      data: {
        courseId: "course-1",
        outline: OUTLINE.lessons,
      },
    });
    expect(courseInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        topic: "Climate",
        depth: "essentials",
        total: 6,
        status: "active",
        progress: 0,
      }),
    );
    expect(lessonsInsert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          course_id: "course-1",
          index: 0,
          title: "L0",
        }),
      ]),
    );
    expect(lessonsInsert.mock.calls[0]![0]).toHaveLength(6);
  });

  it("refuses rather than falling back to the uncapped guest path when auth is unavailable", async () => {
    // A member whose session lookup fails must not be treated as a guest:
    // guests have no active-path cap, so that would be a free bypass.
    const result = await createCourse(
      {
        sessionId: "member-session",
        request: { topic: "Bypass", depth: "essentials", clarifications: [] },
      },
      {
        admin: { from: vi.fn() } as never,
        getUser: async () => {
          throw new AuthUnavailableError("supabase unreachable");
        },
        generateOutline,
      },
    );

    expect(result).toEqual({
      ok: false,
      code: "auth_unavailable",
      message: "Could not verify your session. Try again in a moment.",
    });
    expect(generateOutline).not.toHaveBeenCalled();
  });

  it("does not cap Academy members", async () => {
    const lessonsInsert = vi.fn().mockResolvedValue({ error: null });
    const courseInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi
          .fn()
          .mockResolvedValue({ data: { id: "course-9" }, error: null }),
      }),
    });
    const from = vi.fn((table: string) => {
      if (table === "courses") return { insert: courseInsert };
      if (table === "course_lessons") return { insert: lessonsInsert };
      throw new Error(`unexpected table ${table}`);
    });

    const result = await createCourse(
      {
        sessionId: "member-session",
        request: { topic: "Tenth", depth: "essentials", clarifications: [] },
      },
      {
        admin: { from } as never,
        getUser: async () => ({ id: "user-1", plan: "academy" as const }),
        countActiveCourses: async () => 9,
        generateOutline,
      },
    );

    expect(result.ok).toBe(true);
  });
});
