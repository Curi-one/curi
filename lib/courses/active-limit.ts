import type { SupabaseClient } from "@supabase/supabase-js";
import type { Plan } from "@/lib/api/schemas";
import { FREE_ACTIVE_PATH_LIMIT, isFreePlan, normalizePlan } from "@/lib/plans";

/**
 * Single source of truth for the free active-path cap.
 *
 * Every write path that can produce an `active` course must go through
 * `activePathSlotsRemaining` — currently create-course.ts (new path) and
 * otp.ts migratePending (guest → member import). Enforcing it in only one of
 * them is how a free user ends up past the cap.
 */

export async function countActiveCourses(
  admin: SupabaseClient,
  userId: string,
): Promise<number> {
  const { count, error } = await admin
    .from("courses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "active");

  if (error) {
    throw new Error(`Failed to count active courses: ${error.message}`);
  }
  return count ?? 0;
}

export async function loadUserPlan(
  admin: SupabaseClient,
  userId: string,
): Promise<Plan> {
  const { data, error } = await admin
    .from("users")
    .select("plan")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load plan: ${error.message}`);
  }
  return normalizePlan(typeof data?.plan === "string" ? data.plan : null);
}

/** Remaining active-path slots. `Infinity` on Academy. */
export async function activePathSlotsRemaining(
  admin: SupabaseClient,
  userId: string,
  plan: Plan,
): Promise<number> {
  if (!isFreePlan(plan)) {
    return Number.POSITIVE_INFINITY;
  }
  const active = await countActiveCourses(admin, userId);
  return Math.max(0, FREE_ACTIVE_PATH_LIMIT - active);
}
