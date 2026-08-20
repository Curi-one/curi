import type { SupabaseClient } from "@supabase/supabase-js";
import { generateLessonTitles, lessonCountForDepth } from "@/lib/mock/fixtures";
import { DEFAULT_TIMEZONE, todayInTimezone } from "@/lib/timezone";
import { createAdminClient } from "@/lib/supabase/admin";

export const STAGING_DEMO_EMAIL = "demo@curi.one";
export const STAGING_DEMO_NAME = "Demo Member";

export type StagingSeedPath = {
  topic: string;
  depth: "essentials" | "fluent" | "thorough";
  progress: number;
  activityToday: boolean;
};

/** Three-path seed: 2 due today, 1 already completed today (CUR-36). */
export const STAGING_SEED_PATHS: StagingSeedPath[] = [
  {
    topic: "SAFE notes for founders",
    depth: "essentials",
    progress: 0,
    activityToday: false,
  },
  {
    topic: "Cap table basics",
    depth: "fluent",
    progress: 1,
    activityToday: false,
  },
  {
    topic: "Term sheet negotiation",
    depth: "essentials",
    progress: 2,
    activityToday: true,
  },
];

export type SeedStagingMemberResult = {
  userId: string;
  email: string;
  courseIds: string[];
  today: string;
};

export type SeedStagingMemberDeps = {
  admin?: SupabaseClient;
  now?: () => Date;
  paths?: StagingSeedPath[];
};

async function findUserByEmail(
  admin: SupabaseClient,
  email: string,
): Promise<string | null> {
  const { data, error } = await admin
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (error) {
    throw new Error(`users lookup failed: ${error.message}`);
  }
  return data?.id ? String(data.id) : null;
}

async function ensureDemoUser(
  admin: SupabaseClient,
  email: string,
): Promise<string> {
  const existing = await findUserByEmail(admin, email);
  if (existing) {
    return existing;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { name: STAGING_DEMO_NAME, timezone: DEFAULT_TIMEZONE },
  });
  if (error || !data.user) {
    throw new Error(error?.message ?? "Failed to create demo user");
  }
  return data.user.id;
}

async function clearMemberCourses(
  userId: string,
  admin: SupabaseClient,
): Promise<void> {
  const { error } = await admin.from("courses").delete().eq("user_id", userId);
  if (error) {
    throw new Error(`courses clear failed: ${error.message}`);
  }
}

async function insertSeedPath(
  userId: string,
  path: StagingSeedPath,
  today: string,
  admin: SupabaseClient,
): Promise<string> {
  const total = lessonCountForDepth(path.topic, path.depth);
  const titles = generateLessonTitles(path.topic, path.depth, total);

  const { data: course, error: courseError } = await admin
    .from("courses")
    .insert({
      user_id: userId,
      topic: path.topic,
      depth: path.depth,
      clarifications: [{ questionId: "focus", answer: "Founder basics" }],
      status: "active",
      progress: path.progress,
      total,
      source: "custom",
    })
    .select("id")
    .single();

  if (courseError || !course) {
    throw new Error(
      `courses seed insert failed: ${courseError?.message ?? "no row"}`,
    );
  }

  const courseId = String(course.id);

  const { error: lessonsError } = await admin.from("course_lessons").insert(
    titles.map((title, index) => ({
      course_id: courseId,
      index,
      title,
    })),
  );
  if (lessonsError) {
    throw new Error(`course_lessons seed failed: ${lessonsError.message}`);
  }

  if (path.progress > 0) {
    const activityRows = Array.from({ length: path.progress }, (_, i) => {
      const isLatest = i === path.progress - 1;
      return {
        user_id: userId,
        course_id: courseId,
        lesson_index: i,
        activity_date: isLatest && path.activityToday ? today : "2026-08-01",
        lesson_feel: "just_right" as const,
      };
    });

    const { error: activityError } = await admin
      .from("lesson_activity")
      .insert(activityRows);
    if (activityError) {
      throw new Error(`lesson_activity seed failed: ${activityError.message}`);
    }
  }

  return courseId;
}

/**
 * Idempotent staging seed: demo member with 3 active paths (2 due, 1 done today).
 * Clears existing courses for the demo user before insert.
 */
export async function seedStagingMember(
  deps?: SeedStagingMemberDeps,
): Promise<SeedStagingMemberResult> {
  const admin = deps?.admin ?? createAdminClient();
  const now = deps?.now?.() ?? new Date();
  const paths = deps?.paths ?? STAGING_SEED_PATHS;
  const today = todayInTimezone(DEFAULT_TIMEZONE, now);

  const userId = await ensureDemoUser(admin, STAGING_DEMO_EMAIL);
  await clearMemberCourses(userId, admin);

  const { error: tzError } = await admin
    .from("users")
    .update({ timezone: DEFAULT_TIMEZONE, name: STAGING_DEMO_NAME })
    .eq("id", userId);
  if (tzError) {
    throw new Error(`users timezone update failed: ${tzError.message}`);
  }

  const courseIds: string[] = [];
  for (const path of paths) {
    courseIds.push(await insertSeedPath(userId, path, today, admin));
  }

  return {
    userId,
    email: STAGING_DEMO_EMAIL,
    courseIds,
    today,
  };
}
