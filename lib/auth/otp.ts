import type { SupabaseClient } from "@supabase/supabase-js";
import type { LessonFeel, Plan, UserSession } from "@/lib/api/schemas";
import { LessonFeelSchema } from "@/lib/api/schemas";
import { buildFingerprint } from "@/lib/cache/fingerprint";
import {
  clarificationsToMap,
  normalizeTopic,
} from "@/lib/courses/outline";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * Supabase Auth OTP helpers (magic link / email code).
 *
 * Ops: Supabase Auth URL / redirect allowlist must include https://stage.curi.one
 * (Site URL + Additional Redirect URLs) for staging email links.
 */

export type OtpDeps = {
  createServerClient?: () => Promise<SupabaseClient>;
  createAdminClient?: () => SupabaseClient;
  now?: () => Date;
};

export type VerifyOtpResult = {
  userId: string;
  email: string;
};

export type MigratePendingResult = {
  migratedPathIds: string[];
};

type OutlineLesson = { index: number; title: string };

type PendingCourseRow = {
  id: string;
  topic: string;
  depth: string | null;
  clarifications: unknown;
  outline: unknown;
  expires_at: string;
  lesson_feels: unknown;
};

function todayUtcDate(now: Date): string {
  return now.toISOString().slice(0, 10);
}

function parseOutline(raw: unknown): OutlineLesson[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const lessons: OutlineLesson[] = [];
  for (const item of raw) {
    if (
      item &&
      typeof item === "object" &&
      "index" in item &&
      "title" in item &&
      typeof (item as { index: unknown }).index === "number" &&
      typeof (item as { title: unknown }).title === "string"
    ) {
      lessons.push({
        index: (item as { index: number }).index,
        title: (item as { title: string }).title,
      });
    }
  }
  return lessons.sort((a, b) => a.index - b.index);
}

function parseClarifications(
  raw: unknown,
): { questionId: string; answer: string }[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const items: { questionId: string; answer: string }[] = [];
  for (const item of raw) {
    if (
      item &&
      typeof item === "object" &&
      "questionId" in item &&
      "answer" in item &&
      typeof (item as { questionId: unknown }).questionId === "string" &&
      typeof (item as { answer: unknown }).answer === "string"
    ) {
      items.push({
        questionId: (item as { questionId: string }).questionId,
        answer: (item as { answer: string }).answer,
      });
    }
  }
  return items;
}

function parseLessonFeels(raw: unknown): Record<number, LessonFeel> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }
  const out: Record<number, LessonFeel> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    const index = Number.parseInt(key, 10);
    if (Number.isNaN(index)) continue;
    const parsed = LessonFeelSchema.safeParse(value);
    if (parsed.success) {
      out[index] = parsed.data;
    }
  }
  return out;
}

function progressFromFeels(feels: Record<number, LessonFeel>): number {
  const indices = Object.keys(feels).map(Number);
  if (indices.length === 0) {
    return 0;
  }
  return Math.max(...indices) + 1;
}

export async function requestOtp(
  email: string,
  deps?: OtpDeps,
): Promise<void> {
  const createServer = deps?.createServerClient ?? createClient;
  const supabase = await createServer();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });
  if (error) {
    throw new Error(error.message);
  }
}

export async function verifyOtp(
  params: { email: string; token: string },
  deps?: OtpDeps,
): Promise<VerifyOtpResult> {
  const createServer = deps?.createServerClient ?? createClient;
  const supabase = await createServer();
  const { data, error } = await supabase.auth.verifyOtp({
    email: params.email,
    token: params.token,
    type: "email",
  });
  if (error) {
    throw new Error(error.message);
  }
  if (!data.user) {
    throw new Error("OTP verification returned no user");
  }
  return {
    userId: data.user.id,
    email: data.user.email ?? params.email,
  };
}

/**
 * Migrate guest pending_courses for anonymous session → member courses.
 * Reads: id, topic, depth, clarifications, outline, expires_at, lesson_feels
 * (pending_courses also has anonymous_id, clarify_step, created_at — filtered via eq/gt).
 */
export async function migratePending(
  sessionId: string,
  userId: string,
  deps?: OtpDeps,
): Promise<MigratePendingResult> {
  const admin = deps?.createAdminClient?.() ?? createAdminClient();
  const now = deps?.now?.() ?? new Date();

  const { data: rows, error } = await admin
    .from("pending_courses")
    .select(
      "id, topic, depth, clarifications, outline, expires_at, lesson_feels",
    )
    .eq("anonymous_id", sessionId)
    .gt("expires_at", now.toISOString());

  if (error) {
    throw new Error(`pending_courses migrate select failed: ${error.message}`);
  }

  const migratedPathIds: string[] = [];
  const pending = (rows ?? []) as PendingCourseRow[];

  for (const row of pending) {
    const depth = row.depth;
    if (
      depth !== "essentials" &&
      depth !== "fluent" &&
      depth !== "thorough"
    ) {
      continue;
    }

    const outline = parseOutline(row.outline);
    if (outline.length === 0) {
      continue;
    }

    const clarifications = parseClarifications(row.clarifications);
    const feels = parseLessonFeels(row.lesson_feels);
    const fingerprint = buildFingerprint({
      topicNormalized: normalizeTopic(row.topic),
      depth,
      clarifications: clarificationsToMap(clarifications),
      cacheType: "path_outline",
    });

    const progress = progressFromFeels(feels);
    const total = outline.length;
    const status = progress >= total ? "completed" : "active";

    const { data: course, error: courseError } = await admin
      .from("courses")
      .insert({
        user_id: userId,
        topic: row.topic,
        depth,
        clarifications,
        clarifications_fingerprint: fingerprint,
        status,
        progress,
        total,
        source: "custom",
      })
      .select("id")
      .single();

    if (courseError || !course) {
      throw new Error(
        `courses migrate insert failed: ${courseError?.message ?? "no row"}`,
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
        `course_lessons migrate insert failed: ${lessonsError.message}`,
      );
    }

    const activityRows = Object.entries(feels).map(([indexKey, feel]) => ({
      user_id: userId,
      course_id: course.id as string,
      lesson_index: Number(indexKey),
      activity_date: todayUtcDate(now),
      lesson_feel: feel,
    }));

    if (activityRows.length > 0) {
      const { error: activityError } = await admin
        .from("lesson_activity")
        .insert(activityRows);
      if (activityError) {
        throw new Error(
          `lesson_activity migrate insert failed: ${activityError.message}`,
        );
      }
    }

    const { error: deleteError } = await admin
      .from("pending_courses")
      .delete()
      .eq("id", row.id);
    if (deleteError) {
      throw new Error(
        `pending_courses migrate delete failed: ${deleteError.message}`,
      );
    }

    migratedPathIds.push(course.id as string);
  }

  return { migratedPathIds };
}

export async function updateUserName(
  userId: string,
  name: string,
  deps?: OtpDeps,
): Promise<void> {
  const admin = deps?.createAdminClient?.() ?? createAdminClient();
  const { error } = await admin
    .from("users")
    .update({ name })
    .eq("id", userId);
  if (error) {
    throw new Error(`users name update failed: ${error.message}`);
  }
}

export async function loadMemberSession(
  userId: string,
  fallbackEmail?: string,
  deps?: OtpDeps,
): Promise<UserSession> {
  const admin = deps?.createAdminClient?.() ?? createAdminClient();
  const { data, error } = await admin
    .from("users")
    .select("name, email, plan")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`users session load failed: ${error.message}`);
  }

  const planRaw = data?.plan;
  const plan: Plan =
    planRaw === "paid" || planRaw === "academy" ? "academy" : "free";

  return {
    kind: "member",
    email: (typeof data?.email === "string" && data.email) || fallbackEmail,
    name: typeof data?.name === "string" && data.name ? data.name : undefined,
    plan,
  };
}
