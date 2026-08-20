import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CourseCreateRequest,
  CourseCreateResponse,
  Plan,
} from "@/lib/api/schemas";
import { buildFingerprint } from "@/lib/cache/fingerprint";
import {
  clarificationsToMap,
  generatePathOutline,
  normalizeTopic,
  type GeneratePathOutlineDeps,
} from "@/lib/courses/outline";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";

/** Free plan active-path cap (docs/FLOWS.md, mock store). */
export const FREE_ACTIVE_PATH_LIMIT = 2;
const PENDING_TTL_MS = 24 * 60 * 60 * 1000;

export type CreateCourseSuccess = {
  ok: true;
  data: CourseCreateResponse;
};

export type CreateCoursePlanLimit = {
  ok: false;
  code: "plan_limit";
  message: string;
};

export type CreateCourseResult = CreateCourseSuccess | CreateCoursePlanLimit;

export type AuthUser = {
  id: string;
  plan: Plan | "paid";
};

export type CreateCourseDeps = {
  admin?: SupabaseClient;
  getUser?: () => Promise<AuthUser | null>;
  countActiveCourses?: (userId: string) => Promise<number>;
  generateOutline?: (
    input: CourseCreateRequest,
    deps?: GeneratePathOutlineDeps,
  ) => ReturnType<typeof generatePathOutline>;
};

async function defaultGetUser(): Promise<AuthUser | null> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return null;
    }

    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("users")
      .select("plan")
      .eq("id", user.id)
      .maybeSingle();

    const planRaw = profile?.plan;
    const plan: Plan | "paid" =
      planRaw === "paid" || planRaw === "academy" || planRaw === "free"
        ? planRaw === "academy"
          ? "academy"
          : planRaw
        : "free";

    return { id: user.id, plan };
  } catch {
    // No Supabase auth session yet (staging until auth ships).
    return null;
  }
}

async function defaultCountActiveCourses(
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

/**
 * Real path create: cache-first outline, then guest pending_courses
 * or member courses + course_lessons. No supabase user → guest pending.
 */
export async function createCourse(
  params: {
    sessionId: string;
    request: CourseCreateRequest;
  },
  deps?: CreateCourseDeps,
): Promise<CreateCourseResult> {
  const admin = deps?.admin ?? createAdminClient();
  const getUser = deps?.getUser ?? defaultGetUser;
  const generateOutline = deps?.generateOutline ?? generatePathOutline;

  const user = await getUser();

  if (user) {
    const countActive =
      deps?.countActiveCourses ??
      ((userId: string) => defaultCountActiveCourses(admin, userId));
    const activeCount = await countActive(user.id);
    const isFree = user.plan === "free";
    if (isFree && activeCount >= FREE_ACTIVE_PATH_LIMIT) {
      return {
        ok: false,
        code: "plan_limit",
        message:
          "Free plan allows up to 2 active paths. Upgrade to Academy.",
      };
    }
  }

  const outlinePayload = await generateOutline(params.request);
  const outline = outlinePayload.lessons;
  const topicNormalized = normalizeTopic(params.request.topic);
  const fingerprint = buildFingerprint({
    topicNormalized,
    depth: params.request.depth,
    clarifications: clarificationsToMap(params.request.clarifications),
    cacheType: "path_outline",
  });

  if (!user) {
    const expiresAt = new Date(Date.now() + PENDING_TTL_MS).toISOString();
    const { data, error } = await admin
      .from("pending_courses")
      .insert({
        anonymous_id: params.sessionId,
        topic: params.request.topic,
        depth: params.request.depth,
        clarifications: params.request.clarifications,
        outline,
        expires_at: expiresAt,
      })
      .select("id")
      .single();

    if (error || !data) {
      throw new Error(
        `Failed to insert pending_courses: ${error?.message ?? "no row"}`,
      );
    }

    return {
      ok: true,
      data: {
        courseId: data.id,
        outline,
      },
    };
  }

  const { data: course, error: courseError } = await admin
    .from("courses")
    .insert({
      user_id: user.id,
      topic: params.request.topic,
      depth: params.request.depth,
      clarifications: params.request.clarifications,
      clarifications_fingerprint: fingerprint,
      status: "active",
      progress: 0,
      total: outlinePayload.total,
      source: "custom",
    })
    .select("id")
    .single();

  if (courseError || !course) {
    throw new Error(
      `Failed to insert courses: ${courseError?.message ?? "no row"}`,
    );
  }

  const { error: lessonsError } = await admin.from("course_lessons").insert(
    outline.map((lesson) => ({
      course_id: course.id,
      index: lesson.index,
      title: lesson.title,
      cache_key: fingerprint,
    })),
  );

  if (lessonsError) {
    throw new Error(
      `Failed to insert course_lessons: ${lessonsError.message}`,
    );
  }

  return {
    ok: true,
    data: {
      courseId: course.id,
      outline,
    },
  };
}
