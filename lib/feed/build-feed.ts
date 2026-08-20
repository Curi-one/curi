import type { DepthSlug, FeedResponse, PathSummary } from "@/lib/api/schemas";
import { isPathDueToday } from "@/lib/due-today";

export type FeedCourseRow = {
  id: string;
  topic: string;
  depth: DepthSlug;
  progress: number;
  total: number;
};

export type FeedActivityRow = {
  courseId: string;
  activityDate: string;
};

export function courseIdsWithActivityOnDate(
  activity: FeedActivityRow[],
  date: string,
): Set<string> {
  return new Set(
    activity
      .filter((row) => row.activityDate === date)
      .map((row) => row.courseId),
  );
}

export function buildFeed(
  courses: FeedCourseRow[],
  activityToday: Set<string>,
): FeedResponse {
  const due: PathSummary[] = [];
  const done: PathSummary[] = [];

  for (const course of courses) {
    const summary: PathSummary = {
      id: course.id,
      topic: course.topic,
      progress: course.progress,
      totalLessons: course.total,
      depth: course.depth,
    };

    const state = {
      progress: course.progress,
      totalLessons: course.total,
      hasActivityToday: activityToday.has(course.id),
    };

    if (isPathDueToday(state)) {
      due.push(summary);
    } else if (course.progress < course.total) {
      done.push(summary);
    }
  }

  return { due, done, groups: [] };
}
