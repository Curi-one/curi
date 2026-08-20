import type { FeedResponse } from "@/lib/api/schemas";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildFeed,
  courseIdsWithActivityOnDate,
  type FeedCourseRow,
} from "@/lib/feed/build-feed";
import {
  buildDailyFeed,
  type DailyFeedActivityRow,
  type DailyFeedCourseRow,
} from "@/lib/feed/build-daily-feed";
import { parseDepth } from "@/lib/courses/summary";
import { DEFAULT_TIMEZONE, todayInTimezone } from "@/lib/timezone";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";

export type GetFeedResult =
  | { ok: true; data: FeedResponse }
  | { ok: false; code: "unauthorized"; message: string };

export type GetFeedDeps = {
  getUserId?: () => Promise<string | null>;
  admin?: SupabaseClient;
  loadTimezone?: (userId: string) => Promise<string>;
  now?: () => Date;
};

async function defaultGetUserId(): Promise<string | null> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

async function defaultLoadTimezone(
  userId: string,
  admin: SupabaseClient,
): Promise<string> {
  const { data, error } = await admin
    .from("users")
    .select("timezone")
    .eq("id", userId)
    .maybeSingle();
  if (error) {
    throw new Error(`users timezone load failed: ${error.message}`);
  }
  const tz = data?.timezone;
  return typeof tz === "string" && tz.length > 0 ? tz : DEFAULT_TIMEZONE;
}

type ActiveCourseRow = FeedCourseRow & {
  createdAt: string;
};

async function loadActiveCourses(
  userId: string,
  admin: SupabaseClient,
): Promise<ActiveCourseRow[]> {
  const { data, error } = await admin
    .from("courses")
    .select("id, topic, depth, progress, total, created_at")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`courses feed load failed: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: String(row.id),
    topic: String(row.topic),
    depth: parseDepth(row.depth),
    progress: typeof row.progress === "number" ? row.progress : 0,
    total: typeof row.total === "number" && row.total > 0 ? row.total : 1,
    createdAt: String(row.created_at).slice(0, 10),
  }));
}

async function loadActivityForUser(
  userId: string,
  admin: SupabaseClient,
): Promise<(DailyFeedActivityRow & { activityDate: string })[]> {
  const { data, error } = await admin
    .from("lesson_activity")
    .select("course_id, lesson_index, activity_date")
    .eq("user_id", userId);

  if (error) {
    throw new Error(`lesson_activity feed load failed: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    courseId: String(row.course_id),
    lessonIndex: typeof row.lesson_index === "number" ? row.lesson_index : 0,
    activityDate: String(row.activity_date),
  }));
}

async function loadLessonTitles(
  courseIds: string[],
  admin: SupabaseClient,
): Promise<Map<string, string[]>> {
  const titlesByCourse = new Map<string, string[]>();
  if (courseIds.length === 0) {
    return titlesByCourse;
  }

  const { data, error } = await admin
    .from("course_lessons")
    .select("course_id, index, title")
    .in("course_id", courseIds)
    .order("index", { ascending: true });

  if (error) {
    throw new Error(`course_lessons feed load failed: ${error.message}`);
  }

  for (const row of data ?? []) {
    const courseId = String(row.course_id);
    const index = typeof row.index === "number" ? row.index : 0;
    const list = titlesByCourse.get(courseId) ?? [];
    list[index] = String(row.title);
    titlesByCourse.set(courseId, list);
  }
  return titlesByCourse;
}

/**
 * Member Today feed from Supabase — due/done grouping per user local calendar day.
 */
export async function getFeed(deps?: GetFeedDeps): Promise<GetFeedResult> {
  const getUserId = deps?.getUserId ?? defaultGetUserId;
  const userId = await getUserId();
  if (!userId) {
    return {
      ok: false,
      code: "unauthorized",
      message: "Sign in required for Today feed",
    };
  }

  const admin = deps?.admin ?? createAdminClient();
  const now = deps?.now?.() ?? new Date();

  const loadTimezone =
    deps?.loadTimezone ?? ((id: string) => defaultLoadTimezone(id, admin));

  const timezone = await loadTimezone(userId);
  const today = todayInTimezone(timezone, now);

  const [courses, activity] = await Promise.all([
    loadActiveCourses(userId, admin),
    loadActivityForUser(userId, admin),
  ]);

  const activityToday = courseIdsWithActivityOnDate(activity, today);
  const { due, done } = buildFeed(courses, activityToday);

  const titlesByCourse = await loadLessonTitles(
    courses.map((c) => c.id),
    admin,
  );
  const dailyFeedCourses: DailyFeedCourseRow[] = courses.map((c) => ({
    id: c.id,
    topic: c.topic,
    lessonTitles: titlesByCourse.get(c.id) ?? Array(c.total).fill(""),
    progress: c.progress,
    createdAt: c.createdAt,
  }));
  const groups = buildDailyFeed(dailyFeedCourses, activity, today);

  return { ok: true, data: { due, done, groups } };
}
