import { describe, expect, it } from "vitest";
import {
  buildDailyFeed,
  buildDailyFeedItems,
  feedDateLabel,
  groupFeedItems,
  type DailyFeedActivityRow,
  type DailyFeedCourseRow,
} from "@/lib/feed/build-daily-feed";

const TODAY = "2026-08-20";

function course(
  overrides: Partial<DailyFeedCourseRow> & { id: string },
): DailyFeedCourseRow {
  return {
    topic: `Topic ${overrides.id}`,
    lessonTitles: Array.from({ length: 7 }, (_, i) => `Lesson ${i + 1}`),
    progress: 0,
    createdAt: TODAY,
    ...overrides,
  };
}

describe("feedDateLabel", () => {
  it("labels tomorrow, today, and yesterday", () => {
    expect(feedDateLabel(-1, TODAY)).toBe("Tomorrow");
    expect(feedDateLabel(0, TODAY)).toBe("Today");
    expect(feedDateLabel(1, TODAY)).toBe("Yesterday");
  });

  it("formats older days as a short date", () => {
    // 2026-08-20 is a Thursday, so 3 days ago is Monday Aug 17.
    expect(feedDateLabel(3, TODAY)).toBe("Mon, Aug 17");
  });
});

describe("buildDailyFeedItems", () => {
  it("adds an available item today when path is due and untouched today", () => {
    const courses = [course({ id: "p1", progress: 2 })];
    const items = buildDailyFeedItems(courses, [], TODAY);

    const available = items.find((i) => i.status === "available");
    expect(available).toMatchObject({
      courseId: "p1",
      lessonIndex: 2,
      lessonNumber: 3,
      daysAgo: 0,
      status: "available",
    });
  });

  it("adds a locked tomorrow item at progress + 1 when no activity today", () => {
    const courses = [course({ id: "p1", progress: 2 })];
    const items = buildDailyFeedItems(courses, [], TODAY);

    const locked = items.find((i) => i.status === "locked");
    expect(locked).toMatchObject({
      courseId: "p1",
      lessonIndex: 3,
      daysAgo: -1,
      status: "locked",
    });
  });

  it("locks progress index (not progress+1) when activity already happened today", () => {
    const courses = [course({ id: "p1", progress: 3 })];
    const activity: DailyFeedActivityRow[] = [
      { courseId: "p1", lessonIndex: 2, activityDate: TODAY },
    ];
    const items = buildDailyFeedItems(courses, activity, TODAY);

    expect(items.some((i) => i.status === "available")).toBe(false);
    const locked = items.find((i) => i.status === "locked");
    expect(locked).toMatchObject({ lessonIndex: 3, daysAgo: -1 });
    const completedToday = items.find(
      (i) => i.status === "completed" && i.daysAgo === 0,
    );
    expect(completedToday).toMatchObject({ lessonIndex: 2 });
  });

  it("does not add a locked item when the next lesson would be out of bounds", () => {
    const courses = [
      course({
        id: "p1",
        progress: 6,
        lessonTitles: Array.from({ length: 7 }, (_, i) => `L${i + 1}`),
      }),
    ];
    const items = buildDailyFeedItems(courses, [], TODAY);
    expect(items.some((i) => i.status === "locked")).toBe(false);
  });

  it("maps past activity to completed items with correct daysAgo", () => {
    const courses = [course({ id: "p1", progress: 3 })];
    const activity: DailyFeedActivityRow[] = [
      { courseId: "p1", lessonIndex: 0, activityDate: "2026-08-18" },
      { courseId: "p1", lessonIndex: 1, activityDate: "2026-08-19" },
      { courseId: "p1", lessonIndex: 2, activityDate: TODAY },
    ];
    const items = buildDailyFeedItems(courses, activity, TODAY);
    const completed = items.filter((i) => i.status === "completed");
    expect(completed).toHaveLength(3);
    expect(completed.map((i) => i.daysAgo).sort()).toEqual([0, 1, 2]);
  });

  it("does not duplicate today’s lesson under yesterday after completing on schedule", () => {
    const courses = [course({ id: "p1", progress: 1, createdAt: "2026-08-19" })];
    const activity: DailyFeedActivityRow[] = [
      { courseId: "p1", lessonIndex: 0, activityDate: "2026-08-19" },
    ];
    const items = buildDailyFeedItems(courses, activity, TODAY);

    expect(items.filter((i) => i.lessonIndex === 1 && i.status === "available")).toEqual([
      expect.objectContaining({ daysAgo: 0, status: "available" }),
    ]);
    expect(items.some((i) => i.lessonIndex === 1 && i.status === "overdue")).toBe(
      false,
    );
    expect(items.find((i) => i.status === "locked")).toMatchObject({
      lessonIndex: 2,
      daysAgo: -1,
    });
  });

  it("adds an overdue item for the current lesson when a day was missed", () => {
    const courses = [
      course({ id: "p1", progress: 2, createdAt: "2026-08-15" }),
    ];
    const activity: DailyFeedActivityRow[] = [
      { courseId: "p1", lessonIndex: 0, activityDate: "2026-08-17" },
      { courseId: "p1", lessonIndex: 1, activityDate: "2026-08-18" },
    ];
    const items = buildDailyFeedItems(courses, activity, TODAY);
    const overdue = items.find((i) => i.status === "overdue");
    expect(overdue).toMatchObject({ lessonIndex: 2, daysAgo: 1 });
  });

  it("does not add an overdue item for a brand new path created today with no activity", () => {
    const courses = [course({ id: "p1", progress: 0, createdAt: TODAY })];
    const items = buildDailyFeedItems(courses, [], TODAY);
    expect(items.some((i) => i.status === "overdue")).toBe(false);
  });

  it("skips available/locked/overdue items for a fully completed path", () => {
    const courses = [
      course({
        id: "p1",
        progress: 7,
        lessonTitles: Array.from({ length: 7 }, (_, i) => `L${i + 1}`),
      }),
    ];
    const items = buildDailyFeedItems(courses, [], TODAY);
    expect(items).toEqual([]);
  });
});

describe("groupFeedItems", () => {
  it("groups and sorts tomorrow, today, then past ascending", () => {
    const courses = [
      course({ id: "p1", progress: 2, createdAt: "2026-08-10" }),
    ];
    const activity: DailyFeedActivityRow[] = [
      { courseId: "p1", lessonIndex: 0, activityDate: "2026-08-18" },
      { courseId: "p1", lessonIndex: 1, activityDate: "2026-08-19" },
    ];
    const items = buildDailyFeedItems(courses, activity, TODAY);
    const groups = groupFeedItems(items, TODAY);

    expect(groups.map((g) => g.daysAgo)).toEqual([-1, 0, 1, 2]);
    expect(groups.find((g) => g.daysAgo === 1)?.items.every((i) => i.status === "completed")).toBe(true);
    expect(groups.map((g) => g.label)).toEqual([
      "Tomorrow",
      "Today",
      "Yesterday",
      feedDateLabel(2, TODAY),
    ]);
  });
});

describe("buildDailyFeed", () => {
  it("combines build + group into sorted day groups", () => {
    const courses = [course({ id: "p1", progress: 2 })];
    const groups = buildDailyFeed(courses, [], TODAY);
    expect(groups.map((g) => g.daysAgo)).toEqual([-1, 0]);
    expect(groups[0]?.items[0]?.status).toBe("locked");
    expect(groups[1]?.items[0]?.status).toBe("available");
  });
});
