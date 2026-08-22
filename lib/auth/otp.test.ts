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

  it("embeds returnTo in callback URL when provided", async () => {
    const signInWithOtp = vi.fn().mockResolvedValue({ error: null });
    const createServerClient = vi.fn().mockResolvedValue({
      auth: { signInWithOtp },
    });

    await requestOtp("learner@example.com", { createServerClient }, "/profile");

    expect(signInWithOtp).toHaveBeenCalledWith({
      email: "learner@example.com",
      options: {
        shouldCreateUser: true,
        emailRedirectTo: expect.stringContaining("next=%2Fprofile"),
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
          .mockResolvedValue({
            error: { message: "Too Many Requests", status: 429 },
          }),
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
  it("accepts the fixed code on staging and local real Supabase", () => {
    vi.stubEnv("APP_ENV", "staging");
    vi.stubEnv("USE_MOCK_API", "false");
    expect(isStagingOtpBypass("118833")).toBe(true);
    expect(isStagingOtpBypass("000000")).toBe(false);
    vi.unstubAllEnvs();

    vi.stubEnv("APP_ENV", "local");
    vi.stubEnv("USE_MOCK_API", "false");
    expect(isStagingOtpBypass("118833")).toBe(true);
    vi.unstubAllEnvs();

    vi.stubEnv("APP_ENV", "local");
    vi.stubEnv("USE_MOCK_API", "true");
    expect(isStagingOtpBypass("118833")).toBe(false);
    vi.unstubAllEnvs();

    vi.stubEnv("APP_ENV", "production");
    vi.stubEnv("USE_MOCK_API", "false");
    expect(isStagingOtpBypass("118833")).toBe(false);
    vi.unstubAllEnvs();
  });

  it("signs in via admin magic link when bypass is allowed", async () => {
    vi.stubEnv("APP_ENV", "staging");
    vi.stubEnv("USE_MOCK_API", "false");
    const createUser = vi
      .fn()
      .mockResolvedValue({
        data: { user: {} },
        error: { message: "User already registered" },
      });
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

  type PendingFixture = {
    id: string;
    topic: string;
    depth?: string;
    outline?: { index: number; title: string }[];
    lesson_feels?: Record<string, string>;
    created_at?: string;
  };

  /**
   * Admin double covering every table migratePending touches, including the
   * active-course count that drives the free-plan cap.
   */
  function mockAdmin(options: {
    pending: PendingFixture[];
    plan?: string;
    activeCount?: number;
  }) {
    const rows = options.pending.map((row) => ({
      id: row.id,
      topic: row.topic,
      depth: row.depth ?? "essentials",
      clarifications: [{ questionId: "focus", answer: "Practice" }],
      outline: row.outline ?? [
        { index: 0, title: "L0" },
        { index: 1, title: "L1" },
      ],
      expires_at: "2026-08-21T12:00:00.000Z",
      lesson_feels: row.lesson_feels ?? {},
      created_at: row.created_at ?? "2026-08-19T00:00:00.000Z",
    }));

    const gt = vi.fn().mockResolvedValue({ data: rows, error: null });
    const pendingSelectEq = vi.fn().mockReturnValue({ gt });
    const pendingSelect = vi.fn().mockReturnValue({ eq: pendingSelectEq });
    const pendingDeleteEq = vi.fn().mockResolvedValue({ error: null });
    const pendingDelete = vi.fn().mockReturnValue({ eq: pendingDeleteEq });

    const inserted: Record<string, unknown>[] = [];
    let nextCourse = 0;
    const courseInsert = vi.fn((row: Record<string, unknown>) => {
      inserted.push(row);
      nextCourse += 1;
      const id = `course-${nextCourse}`;
      return {
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id }, error: null }),
        }),
      };
    });

    // .select("id", { count: "exact", head: true }).eq(...).eq(...)
    const coursesCountSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          count: options.activeCount ?? 0,
          error: null,
        }),
      }),
    });

    const lessonsInsert = vi.fn().mockResolvedValue({ error: null });
    const activityInsert = vi.fn().mockResolvedValue({ error: null });
    const usersMaybeSingle = vi.fn().mockResolvedValue({
      data: { timezone: "UTC", plan: options.plan ?? "free" },
      error: null,
    });

    const from = vi.fn((table: string) => {
      if (table === "pending_courses") {
        return { select: pendingSelect, delete: pendingDelete };
      }
      if (table === "users") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({ maybeSingle: usersMaybeSingle }),
          }),
        };
      }
      if (table === "courses") {
        return { insert: courseInsert, select: coursesCountSelect };
      }
      if (table === "course_lessons") {
        return { insert: lessonsInsert };
      }
      if (table === "lesson_activity") {
        return { insert: activityInsert };
      }
      throw new Error(`unexpected table ${table}`);
    });

    return {
      client: { from } as never,
      from,
      gt,
      inserted,
      courseInsert,
      lessonsInsert,
      activityInsert,
      pendingSelect,
      pendingSelectEq,
      pendingDeleteEq,
    };
  }

  it("inserts courses, course_lessons, lesson_activity from pending then deletes", async () => {
    const admin = mockAdmin({
      pending: [
        {
          id: "pending-1",
          topic: "Stoicism",
          lesson_feels: { "0": "just_right" },
        },
      ],
    });

    const result = await migratePending("anon-session", "user-1", {
      createAdminClient: () => admin.client,
      now: () => now,
    });

    expect(result).toEqual({
      migratedPathIds: ["course-1"],
      shelvedPathIds: [],
    });
    expect(admin.pendingSelect).toHaveBeenCalledWith(
      "id, topic, depth, clarifications, outline, expires_at, lesson_feels, created_at",
    );
    expect(admin.pendingSelectEq).toHaveBeenCalledWith(
      "anonymous_id",
      "anon-session",
    );

    expect(admin.courseInsert).toHaveBeenCalledWith(
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

    expect(admin.lessonsInsert).toHaveBeenCalledWith([
      expect.objectContaining({ course_id: "course-1", index: 0, title: "L0" }),
      expect.objectContaining({ course_id: "course-1", index: 1, title: "L1" }),
    ]);

    expect(admin.activityInsert).toHaveBeenCalledWith([
      {
        user_id: "user-1",
        course_id: "course-1",
        lesson_index: 0,
        activity_date: "2026-08-20",
        lesson_feel: "just_right",
      },
    ]);

    expect(admin.pendingDeleteEq).toHaveBeenCalledWith("id", "pending-1");
  });

  it("skips expired rows (query filters expires_at > now)", async () => {
    const admin = mockAdmin({ pending: [] });

    const result = await migratePending("anon-session", "user-1", {
      createAdminClient: () => admin.client,
      now: () => now,
    });

    expect(result).toEqual({ migratedPathIds: [], shelvedPathIds: [] });
    expect(admin.gt).toHaveBeenCalledWith("expires_at", now.toISOString());
  });

  it("shelves a pending path when the free plan is already at the cap", async () => {
    const admin = mockAdmin({
      pending: [{ id: "pending-1", topic: "Third path" }],
      plan: "free",
      activeCount: 2,
    });

    const result = await migratePending("anon-session", "user-1", {
      createAdminClient: () => admin.client,
      now: () => now,
    });

    expect(result).toEqual({
      migratedPathIds: [],
      shelvedPathIds: ["course-1"],
    });
    expect(admin.courseInsert).toHaveBeenCalledWith(
      expect.objectContaining({ status: "shelved" }),
    );
  });

  it("fills remaining free slots and shelves the overflow", async () => {
    const admin = mockAdmin({
      pending: [
        { id: "pending-1", topic: "A", created_at: "2026-08-19T01:00:00Z" },
        { id: "pending-2", topic: "B", created_at: "2026-08-19T02:00:00Z" },
        { id: "pending-3", topic: "C", created_at: "2026-08-19T03:00:00Z" },
      ],
      plan: "free",
      activeCount: 1,
    });

    const result = await migratePending("anon-session", "user-1", {
      createAdminClient: () => admin.client,
      now: () => now,
    });

    // 1 slot left of 2 → one active, two shelved.
    expect(result.migratedPathIds).toHaveLength(1);
    expect(result.shelvedPathIds).toHaveLength(2);
    expect(
      admin.inserted.filter((row) => row.status === "active"),
    ).toHaveLength(1);
    expect(
      admin.inserted.filter((row) => row.status === "shelved"),
    ).toHaveLength(2);
  });

  it("gives the active slot to the path the guest actually worked through", async () => {
    const admin = mockAdmin({
      pending: [
        { id: "pending-1", topic: "Untouched", created_at: "2026-08-19T01:00:00Z" },
        {
          id: "pending-2",
          topic: "Worked",
          lesson_feels: { "0": "just_right" },
          created_at: "2026-08-19T05:00:00Z",
        },
      ],
      plan: "free",
      activeCount: 1,
    });

    await migratePending("anon-session", "user-1", {
      createAdminClient: () => admin.client,
      now: () => now,
    });

    const active = admin.inserted.find((row) => row.status === "active");
    expect(active).toMatchObject({ topic: "Worked" });
  });

  it("does not cap Academy members", async () => {
    const admin = mockAdmin({
      pending: [
        { id: "pending-1", topic: "A" },
        { id: "pending-2", topic: "B" },
        { id: "pending-3", topic: "C" },
      ],
      plan: "academy",
      activeCount: 9,
    });

    const result = await migratePending("anon-session", "user-1", {
      createAdminClient: () => admin.client,
      now: () => now,
    });

    expect(result.migratedPathIds).toHaveLength(3);
    expect(result.shelvedPathIds).toEqual([]);
  });

  it("imports a fully-finished pending path as completed, not against the cap", async () => {
    const admin = mockAdmin({
      pending: [
        {
          id: "pending-1",
          topic: "Done",
          outline: [{ index: 0, title: "L0" }],
          lesson_feels: { "0": "just_right" },
        },
      ],
      plan: "free",
      activeCount: 2,
    });

    const result = await migratePending("anon-session", "user-1", {
      createAdminClient: () => admin.client,
      now: () => now,
    });

    expect(result.shelvedPathIds).toEqual([]);
    expect(admin.courseInsert).toHaveBeenCalledWith(
      expect.objectContaining({ status: "completed" }),
    );
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
