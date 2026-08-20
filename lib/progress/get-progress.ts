import type { SupabaseClient } from "@supabase/supabase-js";
import { getAuthenticatedUserId } from "@/lib/auth/user-id";
import { computeStreak } from "@/lib/streak";
import { createAdminClient } from "@/lib/supabase/admin";

export type ProgressResponse = {
  streak: number;
  heatmap: string[];
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
  activePaths: 0,
  masteredPaths: 0,
};

async function loadActivityDates(
  userId: string,
  admin: SupabaseClient,
): Promise<string[]> {
  const { data, error } = await admin
    .from("lesson_activity")
    .select("activity_date")
    .eq("user_id", userId);
  if (error) {
    throw new Error(`lesson_activity progress load failed: ${error.message}`);
  }
  return [
    ...new Set((data ?? []).map((row) => String(row.activity_date))),
  ].sort();
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
  const [dates, activePaths, masteredPaths] = await Promise.all([
    loadActivityDates(userId, admin),
    countCoursesByStatus(userId, "active", admin),
    countCoursesByStatus(userId, "completed", admin),
  ]);

  return {
    streak: computeStreak(dates),
    heatmap: dates,
    activePaths,
    masteredPaths,
  };
}
