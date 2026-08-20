import type { SupabaseClient } from "@supabase/supabase-js";
import type { DepthSlug } from "@/lib/api/schemas";
import { getAuthenticatedUserId } from "@/lib/auth/user-id";
import { buildPathMapNodes, type PathMapInput } from "@/lib/courses/path-map";
import { parseDepth } from "@/lib/courses/summary";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_TIMEZONE, todayInTimezone } from "@/lib/timezone";

export type CourseMapResponse = {
  id: string;
  topic: string;
  depth: DepthSlug;
  nodes: ReturnType<typeof buildPathMapNodes>;
};

export type GetCourseMapResult =
  | { ok: true; data: CourseMapResponse }
  | { ok: false; code: "not_found"; message: string };

export type GetCourseMapDeps = {
  admin?: SupabaseClient;
  getUserId?: () => Promise<string | null>;
  loadTimezone?: (userId: string, admin: SupabaseClient) => Promise<string>;
  now?: () => Date;
};

async function defaultLoadTimezone(
  userId: string,
  admin: SupabaseClient,
): Promise<string> {
  const { data } = await admin
    .from("users")
    .select("timezone")
    .eq("id", userId)
    .maybeSingle();
  const tz = data?.timezone;
  return typeof tz === "string" && tz.length > 0 ? tz : DEFAULT_TIMEZONE;
}

async function loadHasActivityToday(
  params: { courseId: string; userId: string; today: string },
  admin: SupabaseClient,
): Promise<boolean> {
  const { data, error } = await admin
    .from("lesson_activity")
    .select("id")
    .eq("course_id", params.courseId)
    .eq("user_id", params.userId)
    .eq("activity_date", params.today)
    .maybeSingle();
  if (error) {
    throw new Error(`lesson_activity map load failed: ${error.message}`);
  }
  return Boolean(data);
}

export async function getCourseMap(
  courseId: string,
  deps?: GetCourseMapDeps,
): Promise<GetCourseMapResult> {
  const getUserId = deps?.getUserId ?? getAuthenticatedUserId;
  const userId = await getUserId();
  if (!userId) {
    return { ok: false, code: "not_found", message: "Path not found" };
  }

  const admin = deps?.admin ?? createAdminClient();
  const { data: course, error: courseError } = await admin
    .from("courses")
    .select("id, topic, depth, progress, total, status")
    .eq("id", courseId)
    .eq("user_id", userId)
    .maybeSingle();

  if (courseError) {
    throw new Error(`courses map load failed: ${courseError.message}`);
  }
  if (!course) {
    return { ok: false, code: "not_found", message: "Path not found" };
  }

  const { data: lessons, error: lessonsError } = await admin
    .from("course_lessons")
    .select("index, title")
    .eq("course_id", courseId)
    .order("index", { ascending: true });

  if (lessonsError) {
    throw new Error(`course_lessons map load failed: ${lessonsError.message}`);
  }

  const statusRaw = String(course.status);
  const status: PathMapInput["status"] =
    statusRaw === "completed" || statusRaw === "shelved" ? statusRaw : "active";

  const progress = typeof course.progress === "number" ? course.progress : 0;

  const lessonRows = (lessons ?? []).map((row) => ({
    index: row.index as number,
    title: String(row.title),
  }));

  let hasActivityToday = false;
  if (status === "active") {
    const loadTimezone = deps?.loadTimezone ?? defaultLoadTimezone;
    const timezone = await loadTimezone(userId, admin);
    const today = todayInTimezone(timezone, deps?.now?.());
    hasActivityToday = await loadHasActivityToday(
      { courseId, userId, today },
      admin,
    );
  }

  return {
    ok: true,
    data: {
      id: String(course.id),
      topic: String(course.topic),
      depth: parseDepth(course.depth),
      nodes: buildPathMapNodes({
        progress,
        status,
        lessons: lessonRows,
        hasActivityToday,
      }),
    },
  };
}
