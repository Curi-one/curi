import type { SupabaseClient } from "@supabase/supabase-js";
import type { DepthSlug, FeedResponse } from "@/lib/api/schemas";
import {
  buildFeed,
  courseIdsWithActivityOnDate,
  type FeedCourseRow,
} from "@/lib/feed/build-feed";
import { DEFAULT_TIMEZONE, todayInTimezone } from "@/lib/timezone";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";

export type GetFeedResult =
  | { ok: true; data: FeedResponse }
  | { ok: false; code: "unauthorized"; message: string };

export type GetFeedDeps = {
  admin?: SupabaseClient;
  getUserId?: () => Promise<string | null>;
  loadTimezone?: (userId: string) => Promise<string>;
  now?: () => Date;
};

function parseDepth(raw: unknown): DepthSlug {
  if (raw === "essentials" || raw === "fluent" || raw === "thorough") {
    return raw;
  }
  return "essentials";
}

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

async function loadActiveCourses(
  userId: string,
  admin: SupabaseClient,
): Promise<FeedCourseRow[]> {
  const { data, error } = await admin
    .from("courses")
    .select("id, topic, depth, progress, total")
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
  }));
}

async function loadActivityForUser(
  userId: string,
  admin: SupabaseClient,
): Promise<{ courseId: string; activityDate: string }[]> {
  const { data, error } = await admin
    .from("lesson_activity")
    .select("course_id, activity_date")
    .eq("user_id", userId);

  if (error) {
    throw new Error(`lesson_activity feed load failed: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    courseId: String(row.course_id),
    activityDate: String(row.activity_date),
  }));
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
    deps?.loadTimezone ??
    ((id: string) => defaultLoadTimezone(id, admin));

  const timezone = await loadTimezone(userId);
  const today = todayInTimezone(timezone, now);

  const [courses, activity] = await Promise.all([
    loadActiveCourses(userId, admin),
    loadActivityForUser(userId, admin),
  ]);

  const activityToday = courseIdsWithActivityOnDate(activity, today);
  return { ok: true, data: buildFeed(courses, activityToday) };
}
