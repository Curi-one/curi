import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  classifyAuthError,
  isStagingOtpBypass,
  migratePending,
  requestOtp,
  signInWithStagingOtp,
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
      options: {
        shouldCreateUser: true,
        emailRedirectTo: expect.stringContaining("/auth/callback"),
      },
    });
  });

  it("throws when supabase returns an error", async () => {
    const createServerClient = vi.fn().mockResolvedValue({
      auth: {
        signInWithOtp: vi
          .fn()
          .mockResolvedValue({ error: { message: "service unavailable" } }),
      },
    });

    await expect(
      requestOtp("learner@example.com", { createServerClient }),
    ).rejects.toThrow("service unavailable");
  });

  it("does not throw on rate limit so the user can still enter a prior code", async () => {
    const createServerClient = vi.fn().mockResolvedValue({
      auth: {
        signInWithOtp: vi.fn().mockResolvedValue({
          error: { message: "email rate limit exceeded", status: 429 },
        }),
      },
    });

    await expect(
      requestOtp("learner@example.com", { createServerClient }),
    ).resolves.toEqual({ sent: false, rateLimited: true });
  });

  it("detects rate limit from HTTP 429 even when message is generic", async () => {
    const createServerClient = vi.fn().mockResolvedValue({
      auth: {
        signInWithOtp: vi
          .fn()
          .mockResolvedValue({ error: { message: "Too Many Requests", status: 429 } }),
      },
    });

    await expect(
      requestOtp("learner@example.com", { createServerClient }),
    ).resolves.toEqual({ sent: false, rateLimited: true });
  });

  it("sends once even when the email already exists", async () => {
    const signInWithOtp = vi.fn().mockResolvedValue({ error: null });
    const createServerClient = vi.fn().mockResolvedValue({
      auth: { signInWithOtp },
    });

    await expect(
      requestOtp("learner@example.com", { createServerClient }),
    ).resolves.toEqual({ sent: true, rateLimited: false });
    expect(signInWithOtp).toHaveBeenCalledTimes(1);
  });
});

describe("staging OTP bypass", () => {
  it("only accepts the fixed code on staging", () => {
    vi.stubEnv("APP_ENV", "staging");
    expect(isStagingOtpBypass("118833")).toBe(true);
    expect(isStagingOtpBypass("000000")).toBe(false);
    vi.unstubAllEnvs();
    vi.stubEnv("APP_ENV", "production");
    expect(isStagingOtpBypass("118833")).toBe(false);
  });

  it("signs in via admin magic link on staging", async () => {
    vi.stubEnv("APP_ENV", "staging");
    const createUser = vi.fn().mockResolvedValue({ data: { user: {} }, error: null });
    const generateLink = vi.fn().mockResolvedValue({
      data: { properties: { hashed_token: "hash-token" } },
      error: null,
    });
    const verifyOtpFn = vi.fn().mockResolvedValue({
      data: { user: { id: "user-staging", email: "learner@example.com" } },
      error: null,
    });
    const createAdminClient = vi.fn().mockReturnValue({
      auth: { admin: { createUser, generateLink } },
    });
    const createServerClient = vi.fn().mockResolvedValue({
      auth: { verifyOtp: verifyOtpFn },
    });

    const result = await signInWithStagingOtp("learner@example.com", {
      createAdminClient,
      createServerClient,
    });

    expect(result).toEqual({
      userId: "user-staging",
      email: "learner@example.com",
    });
    expect(generateLink).toHaveBeenCalled();
    expect(verifyOtpFn).toHaveBeenCalledWith({
      token_hash: "hash-token",
      type: "magiclink",
    });
    vi.unstubAllEnvs();
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

describe("classifyAuthError", () => {
  it("treats rate limits as 429 not a generic 500", () => {
    expect(classifyAuthError("email rate limit exceeded")).toEqual({
      status: 429,
      code: "rate_limited",
    });
  });

  it("treats otp failures as invalid_code", () => {
    expect(classifyAuthError("Token has expired or is invalid")).toEqual({
      status: 401,
      code: "invalid_code",
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
      if (table === "users") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: { timezone: "UTC" },
                error: null,
              }),
            }),
          }),
        };
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
    const pendingEq = vi.fn().mockReturnValue({ gt });
    const pendingSelect = vi.fn().mockReturnValue({ eq: pendingEq });
    const usersMaybeSingle = vi.fn().mockResolvedValue({
      data: { timezone: "UTC" },
      error: null,
    });
    const from = vi.fn((table: string) => {
      if (table === "pending_courses") {
        return { select: pendingSelect };
      }
      if (table === "users") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({ maybeSingle: usersMaybeSingle }),
          }),
        };
      }
      throw new Error(`unexpected table ${table}`);
    });

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
