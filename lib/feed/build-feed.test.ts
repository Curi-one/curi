import { describe, expect, it } from "vitest";
import {
  buildFeed,
  courseIdsWithActivityOnDate,
  type FeedActivityRow,
  type FeedCourseRow,
} from "@/lib/feed/build-feed";

const TODAY = "2026-08-20";

function course(
  id: string,
  progress: number,
  total = 10,
): FeedCourseRow {
  return {
    id,
    topic: `Topic ${id}`,
    depth: "essentials",
    progress,
    total,
  };
}

describe("courseIdsWithActivityOnDate", () => {
  it("returns course ids with matching activity date", () => {
    const activity: FeedActivityRow[] = [
      { courseId: "a", activityDate: TODAY },
      { courseId: "b", activityDate: "2026-08-19" },
      { courseId: "c", activityDate: TODAY },
    ];
    expect(courseIdsWithActivityOnDate(activity, TODAY)).toEqual(
      new Set(["a", "c"]),
    );
  });
});

describe("buildFeed", () => {
  it("groups 3 active paths into 2 due and 1 done (staging seed shape)", () => {
    const courses = [
      course("path-1", 0),
      course("path-2", 1),
      course("path-3", 2),
    ];
    const activityToday = new Set(["path-3"]);

    const feed = buildFeed(courses, activityToday);

    expect(feed.due.map((p) => p.id)).toEqual(["path-1", "path-2"]);
    expect(feed.done.map((p) => p.id)).toEqual(["path-3"]);
  });

  it("excludes completed paths from due and done", () => {
    const courses = [course("finished", 10, 10)];
    const feed = buildFeed(courses, new Set());
    expect(feed.due).toEqual([]);
    expect(feed.done).toEqual([]);
  });

  it("puts path with activity today in done not due", () => {
    const courses = [course("active", 3)];
    const feed = buildFeed(courses, new Set(["active"]));
    expect(feed.due).toEqual([]);
    expect(feed.done).toHaveLength(1);
    expect(feed.done[0]?.id).toBe("active");
  });
});
