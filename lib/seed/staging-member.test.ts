import { describe, expect, it, vi } from "vitest";
import {
  seedStagingMember,
  STAGING_DEMO_EMAIL,
  STAGING_SEED_PATHS,
} from "@/lib/seed/staging-member";

const TODAY = "2026-08-20";

describe("seedStagingMember", () => {
  it("creates demo user, 3 courses, and activity for done-today path", async () => {
    const inserts: Record<string, unknown[]> = {
      courses: [],
      course_lessons: [],
      lesson_activity: [],
    };
    const updates: Record<string, unknown[]> = { users: [] };
    let userLookupCount = 0;

    const from = vi.fn((table: string) => {
      if (table === "users") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockImplementation(async () => {
                userLookupCount++;
                if (userLookupCount === 1) {
                  return { data: { id: "demo-user-id" }, error: null };
                }
                return { data: null, error: null };
              }),
            }),
          }),
          update: vi.fn().mockImplementation((payload) => {
            updates.users!.push(payload);
            return {
              eq: vi.fn().mockResolvedValue({ error: null }),
            };
          }),
        };
      }
      if (table === "courses") {
        return {
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
          insert: vi.fn().mockImplementation((payload) => {
            inserts.courses!.push(payload);
            return {
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: `course-${inserts.courses!.length}` },
                  error: null,
                }),
              }),
            };
          }),
        };
      }
      if (table === "course_lessons") {
        return {
          insert: vi.fn().mockImplementation((payload) => {
            inserts.course_lessons!.push(payload);
            return { error: null };
          }),
        };
      }
      if (table === "lesson_activity") {
        return {
          insert: vi.fn().mockImplementation((payload) => {
            inserts.lesson_activity!.push(payload);
            return { error: null };
          }),
        };
      }
      throw new Error(`unexpected table ${table}`);
    });

    const admin = {
      from,
      auth: {
        admin: {
          createUser: vi.fn(),
        },
      },
    };

    const result = await seedStagingMember({
      admin: admin as never,
      now: () => new Date(`${TODAY}T10:00:00Z`),
      paths: STAGING_SEED_PATHS,
    });

    expect(result).toMatchObject({
      userId: "demo-user-id",
      email: STAGING_DEMO_EMAIL,
      today: TODAY,
    });
    expect(result.courseIds).toHaveLength(3);
    expect(inserts.courses).toHaveLength(3);

    const allActivity = (
      inserts.lesson_activity as {
        activity_date: string;
        lesson_index: number;
      }[][]
    ).flat();
    const doneTodayActivity = allActivity.filter(
      (row) => row.activity_date === TODAY,
    );
    expect(doneTodayActivity).toHaveLength(1);
    expect(doneTodayActivity[0]?.lesson_index).toBe(1);
  });
});
