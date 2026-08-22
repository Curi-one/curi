import type { SupabaseClient } from "@supabase/supabase-js";
import { getAuthenticatedUserId } from "@/lib/auth/user-id";
import { activityByDayToDates } from "@/lib/progress/heatmap-grid";
import { computeStreak } from "@/lib/streak";
import { createAdminClient } from "@/lib/supabase/admin";

export type ProgressResponse = {
  streak: number;
  heatmap: string[];
  /** Lesson counts per ISO date — drives the calendar heatmap. */
  activityByDay: Record<string, number>;
  activePaths: number;
  masteredPaths: number;
};

export type GetProgressDeps = {
  admin?: SupabaseClient;
  getUserId?: () => Promise<string | null>;
};

const EMPTY: ProgressResponse = {
  streak: 0,
  heatmap: [],
  activityByDay: {},
  activePaths: 0,
  masteredPaths: 0,
};

async function loadActivityByDay(
  userId: string,
  admin: SupabaseClient,
): Promise<Record<string, number>> {
  const { data, error } = await admin
    .from("lesson_activity")
    .select("activity_date")
    .eq("user_id", userId);
  if (error) {
    throw new Error(`lesson_activity progress load failed: ${error.message}`);
  }
  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const date = String(row.activity_date);
    counts[date] = (counts[date] ?? 0) + 1;
  }
  return counts;
}

async function countCoursesByStatus(
  userId: string,
  status: "active" | "completed",
  admin: SupabaseClient,
): Promise<number> {
  const { count, error } = await admin
    .from("courses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", status);
  if (error) {
    throw new Error(`courses ${status} count failed: ${error.message}`);
  }
  return count ?? 0;
}

export async function getProgress(
  deps?: GetProgressDeps,
): Promise<ProgressResponse> {
  const getUserId = deps?.getUserId ?? getAuthenticatedUserId;
  const userId = await getUserId();
  if (!userId) {
    return EMPTY;
  }

  const admin = deps?.admin ?? createAdminClient();
  const [activityByDay, activePaths, masteredPaths] = await Promise.all([
    loadActivityByDay(userId, admin),
    countCoursesByStatus(userId, "active", admin),
    countCoursesByStatus(userId, "completed", admin),
  ]);
  const dates = activityByDayToDates(activityByDay);

  return {
    streak: computeStreak(dates),
    heatmap: dates,
    activityByDay,
    activePaths,
    masteredPaths,
  };
}
