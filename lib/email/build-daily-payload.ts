import type { SupabaseClient } from "@supabase/supabase-js";
import type { DepthSlug } from "@/lib/api/schemas";
import { parseDepth } from "@/lib/courses/summary";
import { buildFeed } from "@/lib/feed/build-feed";
import {
  defaultLoadCourse,
  getLessonBody,
  markdownToParagraphs,
} from "@/lib/lessons/body";
import { computeStreak } from "@/lib/streak";
import { appBaseUrl } from "@/lib/email/urls";
import {
  buildSignedEmailOpenUrl,
  lessonPagePath,
} from "@/lib/email/signed-open-link";
import {
  CURIOSITY_EMAIL_FORMAT,
  type DailyLessonEmailPayload,
} from "@/lib/email/daily-lesson-html";
import { todayInTimezone } from "@/lib/timezone";

const DEPTH_LABELS: Record<DepthSlug, string> = {
  essentials: "Essentials",
  fluent: "Fluent",
  thorough: "Thorough",
};

type DueCourseRow = {
  id: string;
  topic: string;
  depth: DepthSlug;
  progress: number;
  total: number;
};

type LessonRow = {
  courseId: string;
  index: number;
  title: string;
  body: string;
  cacheKey: string | null;
};

type Enrichment = {
  takeaways: string[];
  pullQuote?: string;
};

async function loadDueCourses(
  userId: string,
  admin: SupabaseClient,
): Promise<DueCourseRow[]> {
  const { data, error } = await admin
    .from("courses")
    .select("id, topic, depth, progress, total")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`courses load failed: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: String(row.id),
    topic: String(row.topic),
    depth: parseDepth(row.depth),
    progress: typeof row.progress === "number" ? row.progress : 0,
    total: typeof row.total === "number" && row.total > 0 ? row.total : 1,
  }));
}

async function loadActivityDates(
  userId: string,
  admin: SupabaseClient,
): Promise<string[]> {
  const { data, error } = await admin
    .from("lesson_activity")
    .select("activity_date")
    .eq("user_id", userId);

  if (error) {
    throw new Error(`lesson_activity load failed: ${error.message}`);
  }

  return (data ?? []).map((row) => String(row.activity_date));
}

async function loadLessonRow(
  courseId: string,
  lessonIndex: number,
  admin: SupabaseClient,
): Promise<LessonRow | null> {
  const [{ data: lesson }, { data: content }] = await Promise.all([
    admin
      .from("course_lessons")
      .select("index, title")
      .eq("course_id", courseId)
      .eq("index", lessonIndex)
      .maybeSingle(),
    admin
      .from("lesson_content")
      .select("body, cache_key")
      .eq("course_id", courseId)
      .eq("lesson_index", lessonIndex)
      .maybeSingle(),
  ]);

  if (!lesson) return null;

  return {
    courseId,
    index: lessonIndex,
    title: String(lesson.title),
    body: typeof content?.body === "string" ? content.body : "",
    cacheKey:
      typeof content?.cache_key === "string" ? content.cache_key : null,
  };
}

async function loadTomorrowTitle(
  courseId: string,
  lessonIndex: number,
  admin: SupabaseClient,
): Promise<string | undefined> {
  const { data } = await admin
    .from("course_lessons")
    .select("title")
    .eq("course_id", courseId)
    .eq("index", lessonIndex)
    .maybeSingle();
  return data?.title ? String(data.title) : undefined;
}

async function loadEnrichment(
  cacheKey: string | null,
  admin: SupabaseClient,
): Promise<Enrichment> {
  if (!cacheKey) return { takeaways: [] };

  const { data } = await admin
    .from("content_cache")
    .select("payload")
    .eq("cache_key", cacheKey)
    .maybeSingle();

  if (!data?.payload || typeof data.payload !== "object") {
    return { takeaways: [] };
  }

  const payload = data.payload as {
    takeaways?: string[];
    shareableFact?: { fact?: string; reflection?: string };
  };

  const takeaways = Array.isArray(payload.takeaways)
    ? payload.takeaways.filter((t): t is string => typeof t === "string")
    : [];

  const pullQuote =
    payload.shareableFact?.reflection ?? payload.shareableFact?.fact;

  return {
    takeaways,
    ...(pullQuote ? { pullQuote } : {}),
  };
}

export type BuildDailyLessonEmailPayloadDeps = {
  getLessonBody?: typeof getLessonBody;
};

export async function buildDailyLessonEmailPayload(
  params: {
    userId: string;
    email: string;
    name: string | null;
    plan: string;
    timezone: string;
    /** Ignored — send path always uses Curiosity. Kept for call-site compatibility. */
    emailFormat?: string;
    unsubscribeToken: string;
  },
  admin: SupabaseClient,
  now = new Date(),
  /** QA: treat active paths as due even if already completed today. */
  sample = false,
  deps?: BuildDailyLessonEmailPayloadDeps,
): Promise<DailyLessonEmailPayload | null> {
  const today = todayInTimezone(params.timezone, now);
  const [courses, activityDates, activityRowsResult] = await Promise.all([
    loadDueCourses(params.userId, admin),
    loadActivityDates(params.userId, admin),
    sample
      ? Promise.resolve({ data: [] as { course_id: string }[] })
      : admin
          .from("lesson_activity")
          .select("course_id, activity_date")
          .eq("user_id", params.userId)
          .eq("activity_date", today),
  ]);

  const todayCourseIds = new Set(
    (activityRowsResult.data ?? []).map((row) => String(row.course_id)),
  );

  const feed = buildFeed(
    courses.map((c) => ({
      id: c.id,
      topic: c.topic,
      depth: c.depth,
      progress: c.progress,
      total: c.total,
    })),
    todayCourseIds,
  );

  const dueCoursesSource =
    feed.due.length > 0
      ? feed.due
      : sample
        ? courses
            .filter((c) => c.progress < c.total)
            .map((c) => ({
              id: c.id,
              topic: c.topic,
              progress: c.progress,
              totalLessons: c.total,
              depth: c.depth,
            }))
        : [];

  if (dueCoursesSource.length === 0) {
    return null;
  }

  const dueIds = dueCoursesSource.map((d) => d.id);
  const dueCourses = courses.filter((c) => dueIds.includes(c.id));
  const featuredCourse = dueCourses[0];
  const featuredLesson = await loadLessonRow(
    featuredCourse.id,
    featuredCourse.progress,
    admin,
  );

  if (!featuredLesson) {
    return null;
  }

  const enrichment = await loadEnrichment(featuredLesson.cacheKey, admin);
  let bodyParagraphs = markdownToParagraphs(featuredLesson.body);
  let takeaways = enrichment.takeaways;
  let pullQuote = enrichment.pullQuote;

  // Curiosity emails only need a short snapshot. If nothing is stored yet
  // (cron before open), generate cache-first so we can peek takeaway / quote /
  // first paragraph — never rendered as a full lesson body.
  const needsSnapshotMaterial =
    takeaways.length === 0 &&
    !pullQuote &&
    bodyParagraphs.length === 0;
  if (needsSnapshotMaterial) {
    const resolveBody = deps?.getLessonBody ?? getLessonBody;
    const result = await resolveBody(
      {
        courseId: featuredCourse.id,
        lessonIndex: featuredCourse.progress,
        sessionId: params.userId,
      },
      {
        admin,
        loadCourse: (p) =>
          defaultLoadCourse({ ...p, userId: params.userId }, admin),
      },
    );
    if (result.ok) {
      bodyParagraphs = result.data.body;
      if (result.data.takeaways && result.data.takeaways.length > 0) {
        takeaways = result.data.takeaways;
      }
      const fact = result.data.shareableFact;
      if (fact) {
        pullQuote = fact.reflection ?? fact.fact;
      }
    }
  }

  const tomorrowTitle =
    featuredCourse.progress + 1 < featuredCourse.total
      ? await loadTomorrowTitle(
          featuredCourse.id,
          featuredCourse.progress + 1,
          admin,
        )
      : undefined;

  const base = appBaseUrl();
  const featuredLessonPath = lessonPagePath(
    featuredCourse.id,
    featuredCourse.progress,
  );
  const ctaReturnTo =
    dueCourses.length > 1 ? "/today" : featuredLessonPath;

  const alsoDue = await Promise.all(
    dueCourses.slice(1).map(async (course) => {
      const lesson = await loadLessonRow(course.id, course.progress, admin);
      const path = lessonPagePath(course.id, course.progress);
      return {
        topic: course.topic,
        lessonTitle: lesson?.title ?? "Today's lesson",
        lessonUrl: buildSignedEmailOpenUrl(params.email, path, now),
      };
    }),
  );

  const streak = computeStreak(activityDates);
  const dateLabel = now.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: params.timezone,
  });

  return {
    to: params.email,
    userName: params.name?.trim() || params.email.split("@")[0] || "Learner",
    streak,
    dateLabel,
    emailFormat: CURIOSITY_EMAIL_FORMAT,
    featured: {
      topic: featuredCourse.topic,
      depthLabel: DEPTH_LABELS[featuredCourse.depth],
      lessonTitle: featuredLesson.title,
      lessonIndex: featuredCourse.progress,
      totalLessons: featuredCourse.total,
      bodyParagraphs,
      pullQuote,
      takeaways,
      tomorrowTitle,
    },
    alsoDue,
    ctaUrl: buildSignedEmailOpenUrl(params.email, ctaReturnTo, now),
    preferencesUrl: `${base}/profile?tab=email`,
    unsubscribeUrl: `${base}/api/email/unsubscribe?token=${encodeURIComponent(params.unsubscribeToken)}`,
    isAcademy: params.plan === "academy",
  };
}
