import type {
  FeedDayGroup,
  FeedItemStatus,
  FeedLessonItem,
} from "@/lib/api/schemas";

export type DailyFeedCourseRow = {
  id: string;
  topic: string;
  /** Lesson titles ordered by index; length is totalLessons. */
  lessonTitles: string[];
  progress: number;
  /** ISO date (YYYY-MM-DD) the course was created — used for the overdue heuristic. */
  createdAt?: string;
};

export type DailyFeedActivityRow = {
  courseId: string;
  lessonIndex: number;
  activityDate: string;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function dateToUtcMs(date: string): number {
  return Date.parse(`${date}T00:00:00Z`);
}

/** Whole days between two ISO dates: positive when `date` is before `today`. */
function daysAgoFromDate(today: string, date: string): number {
  return Math.round((dateToUtcMs(today) - dateToUtcMs(date)) / MS_PER_DAY);
}

/** Human label for a feed day group per FLOWS F2 (Tomorrow / Today / Yesterday / short date). */
export function feedDateLabel(daysAgo: number, today: string): string {
  if (daysAgo === -1) return "Tomorrow";
  if (daysAgo === 0) return "Today";
  if (daysAgo === 1) return "Yesterday";
  const ms = dateToUtcMs(today) - daysAgo * MS_PER_DAY;
  const d = new Date(ms);
  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "UTC",
  }).format(d);
  const monthDay = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(d);
  return `${weekday}, ${monthDay}`;
}

function lessonTitleAt(course: DailyFeedCourseRow, index: number): string {
  return course.lessonTitles[index] ?? `Lesson ${index + 1}`;
}

function feedItem(
  course: DailyFeedCourseRow,
  lessonIndex: number,
  daysAgo: number,
  status: FeedItemStatus,
): FeedLessonItem {
  return {
    id: `${course.id}-${lessonIndex}-${status}`,
    courseId: course.id,
    topic: course.topic,
    lessonIndex,
    title: lessonTitleAt(course, lessonIndex),
    lessonNumber: lessonIndex + 1,
    totalLessons: course.lessonTitles.length,
    daysAgo,
    status,
  };
}

/**
 * Build chronological lesson feed items for one user's active paths (FLOWS F2).
 * Completed lessons, today's due lesson, an overdue catch-up (if a day was
 * missed), and tomorrow's locked preview — never more than one overdue day.
 */
export function buildDailyFeedItems(
  courses: DailyFeedCourseRow[],
  activity: DailyFeedActivityRow[],
  today: string,
): FeedLessonItem[] {
  const items: FeedLessonItem[] = [];

  for (const course of courses) {
    const total = course.lessonTitles.length;
    const courseActivity = activity.filter((a) => a.courseId === course.id);
    const hasActivityToday = courseActivity.some(
      (a) => a.activityDate === today,
    );

    for (const row of courseActivity) {
      items.push(
        feedItem(
          course,
          row.lessonIndex,
          daysAgoFromDate(today, row.activityDate),
          "completed",
        ),
      );
    }

    if (course.progress >= total) {
      continue;
    }

    if (!hasActivityToday) {
      items.push(feedItem(course, course.progress, 0, "available"));

      const hasEverHadActivity = courseActivity.length > 0;
      const createdBeforeToday =
        course.createdAt !== undefined && course.createdAt < today;
      const missedDaySignal = hasEverHadActivity || createdBeforeToday;
      if (missedDaySignal) {
        items.push(feedItem(course, course.progress, 1, "overdue"));
      }
    }

    const nextLockedIndex = hasActivityToday
      ? course.progress
      : course.progress + 1;
    if (nextLockedIndex < total) {
      items.push(feedItem(course, nextLockedIndex, -1, "locked"));
    }
  }

  return items;
}

/** Group flat feed items by day; sorted tomorrow → today → past ascending. */
export function groupFeedItems(
  items: FeedLessonItem[],
  today: string,
): FeedDayGroup[] {
  const byDay = new Map<number, FeedLessonItem[]>();
  for (const item of items) {
    const bucket = byDay.get(item.daysAgo);
    if (bucket) {
      bucket.push(item);
    } else {
      byDay.set(item.daysAgo, [item]);
    }
  }

  return [...byDay.entries()]
    .sort(([a], [b]) => a - b)
    .map(([daysAgo, groupItems]) => ({
      daysAgo,
      label: feedDateLabel(daysAgo, today),
      items: groupItems,
    }));
}

/** Chronological Today feed (FLOWS F2) — build items then group by day. */
export function buildDailyFeed(
  courses: DailyFeedCourseRow[],
  activity: DailyFeedActivityRow[],
  today: string,
): FeedDayGroup[] {
  return groupFeedItems(buildDailyFeedItems(courses, activity, today), today);
}
