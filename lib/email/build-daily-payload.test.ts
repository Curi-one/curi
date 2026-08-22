import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { buildDailyLessonEmailPayload } from "@/lib/email/build-daily-payload";
import type { getLessonBody } from "@/lib/lessons/body";

type TableHandler = (filters: Record<string, string>) => unknown;

function mockAdmin(handlers: Record<string, TableHandler>): SupabaseClient {
  return {
    from(table: string) {
      const filters: Record<string, string> = {};
      const builder: Record<string, unknown> = {};
      const run = () => {
        const handler = handlers[table];
        if (!handler) {
          return Promise.resolve({ data: null, error: null });
        }
        return Promise.resolve(handler(filters));
      };
      builder.select = () => builder;
      builder.eq = (col: string, val: string) => {
        filters[col] = String(val);
        return builder;
      };
      builder.order = () => run();
      builder.maybeSingle = () => run();
      return builder;
    },
  } as unknown as SupabaseClient;
}

const baseParams = {
  userId: "user-1",
  email: "learner@example.com",
  name: "Awais",
  plan: "free",
  timezone: "UTC",
  unsubscribeToken: "tok",
};

describe("buildDailyLessonEmailPayload", () => {
  it("generates snapshot material via getLessonBody when stored content is empty", async () => {
    const admin = mockAdmin({
      courses: () => ({
        data: [
          {
            id: "course-1",
            topic: "Term Sheets",
            depth: "essentials",
            progress: 0,
            total: 12,
          },
        ],
        error: null,
      }),
      lesson_activity: () => ({ data: [], error: null }),
      course_lessons: (filters) => {
        if (filters.index === "0") {
          return {
            data: { index: 0, title: "How a SAFE converts" },
            error: null,
          };
        }
        return { data: null, error: null };
      },
      lesson_content: () => ({
        data: { body: "", cache_key: null },
        error: null,
      }),
    });

    const resolveBody = vi.fn<typeof getLessonBody>().mockResolvedValue({
      ok: true,
      data: {
        title: "How a SAFE converts",
        body: [
          "A startup raises $200k on a SAFE with a $5M cap.",
          "Two numbers usually govern the conversion.",
        ],
        sources: [],
        takeaways: ["Cap matters", "Discount matters", "Post-money vs pre"],
        shareableFact: {
          fact: "SAFEs convert at a capped price.",
          reflection: "The cap sets a ceiling on conversion price.",
        },
      },
    });

    const payload = await buildDailyLessonEmailPayload(
      baseParams,
      admin,
      new Date("2026-08-21T12:00:00Z"),
      true,
      { getLessonBody: resolveBody },
    );

    expect(payload).not.toBeNull();
    expect(payload!.emailFormat).toBe("Curiosity");
    expect(resolveBody).toHaveBeenCalledWith(
      {
        courseId: "course-1",
        lessonIndex: 0,
        sessionId: "user-1",
      },
      expect.objectContaining({
        admin,
        loadCourse: expect.any(Function),
      }),
    );
    expect(payload!.featured.bodyParagraphs).toEqual([
      "A startup raises $200k on a SAFE with a $5M cap.",
      "Two numbers usually govern the conversion.",
    ]);
    expect(payload!.featured.takeaways).toEqual([
      "Cap matters",
      "Discount matters",
      "Post-money vs pre",
    ]);
    expect(payload!.featured.pullQuote).toBe(
      "The cap sets a ceiling on conversion price.",
    );
  });

  it("does not call getLessonBody when takeaways already exist for snapshot", async () => {
    const admin = mockAdmin({
      courses: () => ({
        data: [
          {
            id: "course-1",
            topic: "Term Sheets",
            depth: "essentials",
            progress: 0,
            total: 12,
          },
        ],
        error: null,
      }),
      lesson_activity: () => ({ data: [], error: null }),
      course_lessons: () => ({
        data: { index: 0, title: "How a SAFE converts" },
        error: null,
      }),
      lesson_content: () => ({
        data: { body: "", cache_key: "ck-1" },
        error: null,
      }),
      content_cache: () => ({
        data: {
          payload: {
            takeaways: ["Already cached peek"],
          },
        },
        error: null,
      }),
    });

    const resolveBody = vi.fn<typeof getLessonBody>();

    const payload = await buildDailyLessonEmailPayload(
      baseParams,
      admin,
      new Date("2026-08-21T12:00:00Z"),
      true,
      { getLessonBody: resolveBody },
    );

    expect(payload).not.toBeNull();
    expect(resolveBody).not.toHaveBeenCalled();
    expect(payload!.featured.takeaways).toEqual(["Already cached peek"]);
    expect(payload!.emailFormat).toBe("Curiosity");
  });

  it("keeps stored body without calling getLessonBody when content exists", async () => {
    const admin = mockAdmin({
      courses: () => ({
        data: [
          {
            id: "course-1",
            topic: "Term Sheets",
            depth: "essentials",
            progress: 0,
            total: 12,
          },
        ],
        error: null,
      }),
      lesson_activity: () => ({ data: [], error: null }),
      course_lessons: () => ({
        data: { index: 0, title: "How a SAFE converts" },
        error: null,
      }),
      lesson_content: () => ({
        data: {
          body: "Stored paragraph one.\n\nStored paragraph two.",
          cache_key: null,
        },
        error: null,
      }),
    });

    const resolveBody = vi.fn<typeof getLessonBody>();

    const payload = await buildDailyLessonEmailPayload(
      baseParams,
      admin,
      new Date("2026-08-21T12:00:00Z"),
      true,
      { getLessonBody: resolveBody },
    );

    expect(payload).not.toBeNull();
    expect(resolveBody).not.toHaveBeenCalled();
    expect(payload!.featured.bodyParagraphs).toEqual([
      "Stored paragraph one.",
      "Stored paragraph two.",
    ]);
    expect(payload!.emailFormat).toBe("Curiosity");
  });
});
