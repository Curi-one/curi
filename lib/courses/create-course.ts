import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CourseCreateRequest,
  CourseCreateResponse,
  Plan,
} from "@/lib/api/schemas";
import { buildFingerprint } from "@/lib/cache/fingerprint";
import { mergeLearnerDetails } from "@/lib/clarify/details";
import {
  clarificationsToMap,
  generatePathOutline,
  normalizeTopic,
  type GeneratePathOutlineDeps,
} from "@/lib/courses/outline";
import { activePathSlotsRemaining } from "@/lib/courses/active-limit";
import { FREE_ACTIVE_PATH_LIMIT, isFreePlan, normalizePlan } from "@/lib/plans";
import {
  DEFAULT_LEARNING_PROFILE,
  normalizeLearningProfile,
  type LearningProfile,
} from "@/lib/profile/learning-profile";
import { loadUserPreferencesForUserId } from "@/lib/profile/db-preferences";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";

/** @deprecated Use FREE_ACTIVE_PATH_LIMIT from @/lib/plans */
export { FREE_ACTIVE_PATH_LIMIT };
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

/**
 * The Supabase session could not be resolved. Never silently downgrade to the
 * guest branch here — guests are uncapped, so a transient auth failure would
 * hand a capped member an unlimited-path bypass.
 */
export type CreateCourseAuthUnavailable = {
  ok: false;
  code: "auth_unavailable";
  message: string;
};

export type CreateCourseResult =
  | CreateCourseSuccess
  | CreateCoursePlanLimit
  | CreateCourseAuthUnavailable;

/** Thrown by the auth lookup when we cannot tell member from guest. */
export class AuthUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthUnavailableError";
  }
}

export type AuthUser = {
  id: string;
  plan: Plan;
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

/**
 * "No session" and "could not check the session" are different answers.
 * Only the first one means guest; the second throws so the caller can 503.
 */
function isMissingSessionError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }
  const name = (error as { name?: string }).name ?? "";
  const status = (error as { status?: number }).status;
  return (
    name === "AuthSessionMissingError" ||
    name === "AuthInvalidTokenResponseError" ||
    status === 401 ||
    status === 403
  );
}

async function defaultGetUser(): Promise<AuthUser | null> {
  let supabase;
  try {
    supabase = await createServerClient();
  } catch (err) {
    throw new AuthUnavailableError(
      err instanceof Error ? err.message : "Supabase client unavailable",
    );
  }

  const { data, error } = await supabase.auth.getUser();

  if (error && !isMissingSessionError(error)) {
    throw new AuthUnavailableError(error.message);
  }
  if (!data.user) {
    return null;
  }

  const admin = createAdminClient();
  const { data: profile, error: profileError } = await admin
    .from("users")
    .select("plan")
    .eq("id", data.user.id)
    .maybeSingle();

  // Defaulting to "free" on a read failure would cap a paying member; treating
  // it as a member-with-unknown-plan would uncap a free one. Refuse instead.
  if (profileError) {
    throw new AuthUnavailableError(
      `plan lookup failed: ${profileError.message}`,
    );
  }

  return {
    id: data.user.id,
    plan: normalizePlan(typeof profile?.plan === "string" ? profile.plan : null),
  };
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

  let user: AuthUser | null;
  try {
    user = await getUser();
  } catch (err) {
    if (err instanceof AuthUnavailableError) {
      return {
        ok: false,
        code: "auth_unavailable",
        message: "Could not verify your session. Try again in a moment.",
      };
    }
    throw err;
  }

  if (user) {
    const injectedCount = deps?.countActiveCourses;
    const remaining = injectedCount
      ? isFreePlan(user.plan)
        ? Math.max(0, FREE_ACTIVE_PATH_LIMIT - (await injectedCount(user.id)))
        : Number.POSITIVE_INFINITY
      : await activePathSlotsRemaining(admin, user.id, user.plan);

    if (remaining <= 0) {
      return {
        ok: false,
        code: "plan_limit",
        message: "Free plan allows up to 2 active paths. Upgrade to Academy.",
      };
    }
  }

  let learningProfile: LearningProfile | undefined =
    params.request.learningProfile
      ? normalizeLearningProfile(params.request.learningProfile)
      : undefined;
  if (user) {
    try {
      const prefs = await loadUserPreferencesForUserId(user.id);
      learningProfile = {
        seq: prefs.seq,
        anchor: prefs.anchor,
        length: prefs.length,
        rigor: prefs.rigor,
        jargon: prefs.jargon,
      };
    } catch {
      learningProfile = learningProfile ?? { ...DEFAULT_LEARNING_PROFILE };
    }
  }

  const outlinePayload = await generateOutline({
    ...params.request,
    learningProfile,
  });
  const outline = outlinePayload.lessons;
  const topicNormalized = normalizeTopic(params.request.topic);
  const clarifications = mergeLearnerDetails(
    params.request.clarifications,
    params.request.details,
  );
  const fingerprint = buildFingerprint({
    topicNormalized,
    depth: params.request.depth,
    clarifications: clarificationsToMap(
      params.request.clarifications,
      params.request.details,
    ),
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
        clarifications,
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
      clarifications,
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
    throw new Error(`Failed to insert course_lessons: ${lessonsError.message}`);
  }

  return {
    ok: true,
    data: {
      courseId: course.id,
      outline,
    },
  };
}
