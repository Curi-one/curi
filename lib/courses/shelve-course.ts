import type { SupabaseClient } from "@supabase/supabase-js";
import { getAuthenticatedUserId } from "@/lib/auth/user-id";
import { createAdminClient } from "@/lib/supabase/admin";

export type ShelveCourseResult =
  | { ok: true; courseId: string }
  | { ok: false; code: "not_found" | "invalid_state"; message: string };

export type ShelveCourseDeps = {
  admin?: SupabaseClient;
  getUserId?: () => Promise<string | null>;
};

export async function shelveCourse(
  courseId: string,
  deps?: ShelveCourseDeps,
): Promise<ShelveCourseResult> {
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
    throw new Error(`courses shelve read failed: ${readError.message}`);
  }
  if (!course) {
    return { ok: false, code: "not_found", message: "Path not found" };
  }

  if (String(course.status) !== "active") {
    return {
      ok: false,
      code: "invalid_state",
      message: "Only active paths can be shelved",
    };
  }

  const { error: updateError } = await admin
    .from("courses")
    .update({ status: "shelved" })
    .eq("id", courseId)
    .eq("user_id", userId);

  if (updateError) {
    throw new Error(`courses shelve update failed: ${updateError.message}`);
  }

  return { ok: true, courseId };
}
