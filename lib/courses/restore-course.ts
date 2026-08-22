import type { SupabaseClient } from "@supabase/supabase-js";
import { getAuthenticatedUserId } from "@/lib/auth/user-id";
import {
  activePathSlotsRemaining,
  loadUserPlan,
} from "@/lib/courses/active-limit";
import { createAdminClient } from "@/lib/supabase/admin";

export type RestoreCourseResult =
  | { ok: true; courseId: string }
  | {
      ok: false;
      code: "not_found" | "invalid_state" | "path_limit";
      message: string;
    };

export type RestoreCourseDeps = {
  admin?: SupabaseClient;
  getUserId?: () => Promise<string | null>;
};

export async function restoreCourse(
  courseId: string,
  deps?: RestoreCourseDeps,
): Promise<RestoreCourseResult> {
  const getUserId = deps?.getUserId ?? getAuthenticatedUserId;
  const userId = await getUserId();
  if (!userId) {
    return { ok: false, code: "not_found", message: "Path not found" };
  }

  const admin = deps?.admin ?? createAdminClient();
  const { data: course, error: readError } = await admin
    .from("courses")
    .select("id, status")
    .eq("id", courseId)
    .eq("user_id", userId)
    .maybeSingle();

  if (readError) {
    throw new Error(`courses restore read failed: ${readError.message}`);
  }
  if (!course) {
    return { ok: false, code: "not_found", message: "Path not found" };
  }

  if (String(course.status) !== "shelved") {
    return {
      ok: false,
      code: "invalid_state",
      message: "Only shelved paths can be restored",
    };
  }

  const plan = await loadUserPlan(admin, userId);
  const remaining = await activePathSlotsRemaining(admin, userId, plan);
  if (remaining <= 0) {
    return {
      ok: false,
      code: "path_limit",
      message: "Free plan allows up to 2 active paths. Upgrade to Academy.",
    };
  }

  const { error: updateError } = await admin
    .from("courses")
    .update({ status: "active" })
    .eq("id", courseId)
    .eq("user_id", userId);

  if (updateError) {
    throw new Error(`courses restore update failed: ${updateError.message}`);
  }

  return { ok: true, courseId };
}
