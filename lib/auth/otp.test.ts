import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  migratePending,
  requestOtp,
  updateUserName,
  verifyOtp,
} from "@/lib/auth/otp";

describe("requestOtp", () => {
  it("calls signInWithOtp with shouldCreateUser", async () => {
    const signInWithOtp = vi.fn().mockResolvedValue({ error: null });
    const createServerClient = vi.fn().mockResolvedValue({
      auth: { signInWithOtp },
    });

    await requestOtp("learner@example.com", { createServerClient });

    expect(signInWithOtp).toHaveBeenCalledWith({
      email: "learner@example.com",
      options: { shouldCreateUser: true },
    });
  });

  it("throws when supabase returns an error", async () => {
    const createServerClient = vi.fn().mockResolvedValue({
      auth: {
        signInWithOtp: vi
          .fn()
          .mockResolvedValue({ error: { message: "rate limited" } }),
      },
    });

    await expect(
      requestOtp("learner@example.com", { createServerClient }),
    ).rejects.toThrow("rate limited");
  });
});

describe("verifyOtp", () => {
  it("verifies email OTP and returns user id", async () => {
    const verifyOtpFn = vi.fn().mockResolvedValue({
      data: { user: { id: "user-1", email: "learner@example.com" } },
      error: null,
    });
    const createServerClient = vi.fn().mockResolvedValue({
      auth: { verifyOtp: verifyOtpFn },
    });

    const result = await verifyOtp(
      { email: "learner@example.com", token: "654321" },
      { createServerClient },
    );

    expect(verifyOtpFn).toHaveBeenCalledWith({
      email: "learner@example.com",
      token: "654321",
      type: "email",
    });
    expect(result).toEqual({
      userId: "user-1",
      email: "learner@example.com",
    });
  });
});

describe("migratePending", () => {
  const now = new Date("2026-08-20T12:00:00.000Z");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("inserts courses, course_lessons, lesson_activity from pending then deletes", async () => {
    const pendingRows = [
      {
        id: "pending-1",
        topic: "Stoicism",
        depth: "essentials",
        clarifications: [{ questionId: "focus", answer: "Practice" }],
        outline: [
          { index: 0, title: "L0" },
          { index: 1, title: "L1" },
        ],
        expires_at: "2026-08-21T12:00:00.000Z",
        lesson_feels: { "0": "just_right" },
      },
    ];

    const pendingSelectEq = vi.fn().mockReturnValue({
      gt: vi.fn().mockResolvedValue({ data: pendingRows, error: null }),
    });
    const pendingSelect = vi.fn().mockReturnValue({ eq: pendingSelectEq });
    const pendingDeleteEq = vi.fn().mockResolvedValue({ error: null });
    const pendingDelete = vi.fn().mockReturnValue({ eq: pendingDeleteEq });

    const courseSingle = vi.fn().mockResolvedValue({
      data: { id: "course-1" },
      error: null,
    });
    const courseSelect = vi.fn().mockReturnValue({ single: courseSingle });
    const courseInsert = vi.fn().mockReturnValue({ select: courseSelect });

    const lessonsInsert = vi.fn().mockResolvedValue({ error: null });
    const activityInsert = vi.fn().mockResolvedValue({ error: null });

    const from = vi.fn((table: string) => {
      if (table === "pending_courses") {
        return { select: pendingSelect, delete: pendingDelete };
      }
      if (table === "courses") {
        return { insert: courseInsert };
      }
      if (table === "course_lessons") {
        return { insert: lessonsInsert };
      }
      if (table === "lesson_activity") {
        return { insert: activityInsert };
      }
      throw new Error(`unexpected table ${table}`);
    });

    const result = await migratePending("anon-session", "user-1", {
      createAdminClient: () => ({ from }) as never,
      now: () => now,
    });

    expect(result).toEqual({ migratedPathIds: ["course-1"] });
    expect(from).toHaveBeenCalledWith("pending_courses");
    expect(pendingSelect).toHaveBeenCalledWith(
      "id, topic, depth, clarifications, outline, expires_at, lesson_feels",
    );
    expect(pendingSelectEq).toHaveBeenCalledWith(
      "anonymous_id",
      "anon-session",
    );

    expect(courseInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        topic: "Stoicism",
        depth: "essentials",
        clarifications: [{ questionId: "focus", answer: "Practice" }],
        status: "active",
        progress: 1,
        total: 2,
        source: "custom",
      }),
    );

    expect(lessonsInsert).toHaveBeenCalledWith([
      expect.objectContaining({
        course_id: "course-1",
        index: 0,
        title: "L0",
      }),
      expect.objectContaining({
        course_id: "course-1",
        index: 1,
        title: "L1",
      }),
    ]);

    expect(activityInsert).toHaveBeenCalledWith([
      {
        user_id: "user-1",
        course_id: "course-1",
        lesson_index: 0,
        activity_date: "2026-08-20",
        lesson_feel: "just_right",
      },
    ]);

    expect(pendingDeleteEq).toHaveBeenCalledWith("id", "pending-1");
  });

  it("skips expired rows (query filters expires_at > now)", async () => {
    const gt = vi.fn().mockResolvedValue({ data: [], error: null });
    const eq = vi.fn().mockReturnValue({ gt });
    const select = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ select });

    const result = await migratePending("anon-session", "user-1", {
      createAdminClient: () => ({ from }) as never,
      now: () => now,
    });

    expect(result).toEqual({ migratedPathIds: [] });
    expect(gt).toHaveBeenCalledWith("expires_at", now.toISOString());
  });
});

describe("updateUserName", () => {
  it("updates public.users.name", async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ update });

    await updateUserName("user-1", "Alex", {
      createAdminClient: () => ({ from }) as never,
    });

    expect(from).toHaveBeenCalledWith("users");
    expect(update).toHaveBeenCalledWith({ name: "Alex" });
    expect(eq).toHaveBeenCalledWith("id", "user-1");
  });
});
