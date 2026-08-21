import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  chatCompletion,
  quizModel,
  type PerplexityMessage,
  type PerplexitySource,
} from "@/lib/ai/perplexity";
import type {
  LessonFeel,
  QuizResponse,
  QuizSubmitRequest,
  QuizSubmitResponse,
  Source,
} from "@/lib/api/schemas";
import { QuizQuestionSchema, SourceSchema } from "@/lib/api/schemas";
import { buildFingerprint } from "@/lib/cache/fingerprint";
import {
  lookupQuiz,
  storeQuiz,
  type QuizPayload,
  type QuizQuestionPayload,
  type StoreQuizInput,
} from "@/lib/cache/content-cache";
import { stripMarkdownFences } from "@/lib/clarify/generate";
import { clarificationsToMap, normalizeTopic } from "@/lib/courses/outline";
import {
  isShelvedLessonBlocked,
  SHELVED_LOCK_MESSAGE,
  defaultLoadCourse,
  normalizeSources,
  type CourseContext,
  type ClarificationItem,
  type CourseLessonRef,
} from "@/lib/lessons/body";
import { computeStreak } from "@/lib/streak";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_TIMEZONE, todayInTimezone } from "@/lib/timezone";

const PerplexityQuizSchema = z.object({
  questions: z
    .array(
      z.object({
        id: z.string().min(1),
        prompt: z.string().min(1),
        options: z.array(z.string().min(1)).min(2).max(6),
        correctIndex: z.number().int().nonnegative(),
        explanation: z.string().min(1),
        source_refs: z.unknown().optional(),
      }),
    )
    .min(3)
    .max(5),
});

export type GetQuizSuccess = { ok: true; data: QuizResponse };
export type GetQuizNotFound = {
  ok: false;
  code: "not_found";
  message: string;
};
export type GetQuizLocked = {
  ok: false;
  code: "locked";
  message: string;
};
export type GetQuizResult = GetQuizSuccess | GetQuizNotFound | GetQuizLocked;

export type SubmitQuizSuccess = { ok: true; data: QuizSubmitResponse };
export type SubmitQuizError = {
  ok: false;
  code: "not_found" | "already_done_today" | "locked";
  message: string;
};
export type SubmitQuizResult = SubmitQuizSuccess | SubmitQuizError;

export type GetQuizDeps = {
  admin?: SupabaseClient;
  lookup?: typeof lookupQuiz;
  store?: (input: StoreQuizInput) => Promise<void>;
  complete?: typeof chatCompletion;
  loadCourse?: (params: {
    courseId: string;
    sessionId: string;
  }) => Promise<CourseContext | null>;
  loadBodySummary?: (params: {
    course: CourseContext;
    lessonIndex: number;
    lessonTitle: string;
  }) => Promise<string>;
  upsertQuizQuestions?: (params: {
    courseId: string;
    lessonIndex: number;
    questions: QuizQuestionPayload[];
    cacheKey: string;
  }) => Promise<void>;
};

export type SubmitQuizDeps = {
  admin?: SupabaseClient;
  lookup?: typeof lookupQuiz;
  loadCourse?: (params: {
    courseId: string;
    sessionId: string;
  }) => Promise<CourseContext | null>;
  persistFeel?: (params: {
    course: CourseContext;
    courseId: string;
    lessonIndex: number;
    lessonFeel: LessonFeel;
    sessionId: string;
  }) => Promise<{ isNew: boolean; blockedByDayLimit?: boolean }>;
  bumpProgress?: (params: {
    courseId: string;
    lessonIndex: number;
    totalLessons: number;
    userId?: string;
  }) => Promise<void>;
  loadActivityDates?: (userId: string) => Promise<string[]>;
  countPathsStillDue?: (userId: string, today: string) => Promise<number>;
  today?: () => string;
};

export class QuizGenerationError extends Error {
  constructor(message = "Failed to generate quiz") {
    super(message);
    this.name = "QuizGenerationError";
  }
}

async function loadUserTimezone(
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

function sourceFromRefs(refs: unknown): Source | undefined {
  if (refs == null) return undefined;
  const candidates = Array.isArray(refs) ? refs : [refs];
  for (const item of candidates) {
    if (!item || typeof item !== "object") continue;
    const obj = item as Record<string, unknown>;
    const title =
      typeof obj.title === "string"
        ? obj.title
        : typeof obj.name === "string"
          ? obj.name
          : undefined;
    const url = typeof obj.url === "string" ? obj.url : undefined;
    if (!title || !url) continue;
    const parsed = SourceSchema.safeParse({ title, url });
    if (parsed.success) return parsed.data;
  }
  return undefined;
}

function toQuizResponse(questions: QuizQuestionPayload[]): QuizResponse {
  return {
    questions: questions.map((q) => {
      const source = sourceFromRefs(q.source_refs);
      const item = {
        id: q.id,
        prompt: q.prompt,
        options: q.options,
        correctIndex: q.correctIndex,
        ...(q.explanation ? { explanation: q.explanation } : {}),
        ...(source ? { source } : {}),
      };
      const parsed = QuizQuestionSchema.safeParse(item);
      if (!parsed.success) {
        throw new QuizGenerationError("Invalid quiz question shape");
      }
      return parsed.data;
    }),
  };
}

function parseQuizJson(content: string): QuizPayload | null {
  try {
    const raw = JSON.parse(stripMarkdownFences(content)) as unknown;
    const parsed = PerplexityQuizSchema.safeParse(raw);
    if (!parsed.success) {
      return null;
    }
    for (const q of parsed.data.questions) {
      if (q.correctIndex >= q.options.length) {
        return null;
      }
    }
    return {
      questions: parsed.data.questions.map((q) => ({
        id: q.id,
        prompt: q.prompt,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
        source_refs: q.source_refs,
      })),
    };
  } catch {
    return null;
  }
}

function buildQuizMessages(input: {
  topic: string;
  depth: string;
  clarifications: ClarificationItem[];
  lessonIndex: number;
  lessonTitle: string;
  bodySummary: string;
}): PerplexityMessage[] {
  const lines = [
    `Topic: ${input.topic}`,
    `Depth band: ${input.depth}`,
    `Lesson index: ${input.lessonIndex} (0-based)`,
    `Lesson title: ${input.lessonTitle}`,
    "Body summary:",
    input.bodySummary,
    "Generate 3–5 multiple-choice questions that test this lesson only.",
    'Return ONLY valid JSON: {"questions":[{"id":"q1","prompt":"...","options":["a","b","c","d"],"correctIndex":0,"explanation":"..."}]}',
  ];

  if (input.clarifications.length > 0) {
    lines.push("Learner clarifications:");
    for (const item of input.clarifications) {
      lines.push(`- ${item.questionId}: ${item.answer}`);
    }
  }

  return [
    {
      role: "system",
      content: `You write short MCQ quizzes for Curi micro-lessons.
Return ONLY valid JSON (no markdown fences) with 3–5 questions:
{"questions":[{"id":string,"prompt":string,"options":string[2-6],"correctIndex":number,"explanation":string,"source_refs"?:unknown}]}

Rules:
- correctIndex is 0-based into options.
- explanation must say why the correct answer is right (1–2 sentences).
- Stay within the lesson; do not quiz the whole path.`,
    },
    { role: "user", content: lines.join("\n") },
  ];
}

async function defaultLoadBodySummary(
  params: {
    courseId: string;
    course: CourseContext;
    lessonIndex: number;
    lessonTitle: string;
  },
  admin: SupabaseClient,
): Promise<string> {
  if (params.course.kind === "member") {
    const { data, error } = await admin
      .from("lesson_content")
      .select("body")
      .eq("course_id", params.courseId)
      .eq("lesson_index", params.lessonIndex)
      .maybeSingle();
    if (!error && typeof data?.body === "string" && data.body.length > 0) {
      return data.body.slice(0, 2500);
    }
  }
  return `Lesson: ${params.lessonTitle}\nTopic: ${params.course.topic}`;
}

async function defaultUpsertQuizQuestions(
  params: {
    courseId: string;
    lessonIndex: number;
    questions: QuizQuestionPayload[];
    cacheKey: string;
  },
  admin: SupabaseClient,
): Promise<void> {
  const { error } = await admin.from("quiz_questions").upsert(
    {
      course_id: params.courseId,
      lesson_index: params.lessonIndex,
      questions: params.questions,
      cache_key: params.cacheKey,
    },
    { onConflict: "course_id,lesson_index" },
  );
  if (error) {
    throw new Error(`quiz_questions upsert failed: ${error.message}`);
  }
}

async function defaultPersistFeel(
  params: {
    course: CourseContext;
    courseId: string;
    lessonIndex: number;
    lessonFeel: LessonFeel;
    sessionId: string;
  },
  admin: SupabaseClient,
): Promise<{ isNew: boolean; blockedByDayLimit?: boolean }> {
  if (params.course.kind === "pending") {
    const { data: pending, error: readError } = await admin
      .from("pending_courses")
      .select("lesson_feels")
      .eq("id", params.courseId)
      .eq("anonymous_id", params.sessionId)
      .maybeSingle();
    if (readError) {
      throw new Error(`pending_courses feel read failed: ${readError.message}`);
    }
    const existing =
      pending?.lesson_feels &&
      typeof pending.lesson_feels === "object" &&
      !Array.isArray(pending.lesson_feels)
        ? (pending.lesson_feels as Record<string, string>)
        : {};
    const key = String(params.lessonIndex);
    const already = existing[key] !== undefined;
    // Guest loop: auth after first quiz — only one lesson per pending path.
    const otherKeys = Object.keys(existing).filter((k) => k !== key);
    if (!already && otherKeys.length > 0) {
      return { isNew: false, blockedByDayLimit: true };
    }
    const next = { ...existing, [key]: params.lessonFeel };
    const { error: writeError } = await admin
      .from("pending_courses")
      .update({ lesson_feels: next })
      .eq("id", params.courseId)
      .eq("anonymous_id", params.sessionId);
    if (writeError) {
      throw new Error(
        `pending_courses feel write failed: ${writeError.message}`,
      );
    }
    return { isNew: !already };
  }

  if (!params.course.userId) {
    throw new Error("member course missing userId");
  }

  const { data: existing, error: existingError } = await admin
    .from("lesson_activity")
    .select("id")
    .eq("user_id", params.course.userId)
    .eq("course_id", params.courseId)
    .eq("lesson_index", params.lessonIndex)
    .maybeSingle();
  if (existingError) {
    throw new Error(`lesson_activity lookup failed: ${existingError.message}`);
  }
  if (existing) {
    return { isNew: false };
  }

  const timezone = await loadUserTimezone(params.course.userId, admin);
  const today = todayInTimezone(timezone);

  // One lesson / path / day — block a different lesson on the same local day.
  const { data: todayRow, error: todayError } = await admin
    .from("lesson_activity")
    .select("lesson_index")
    .eq("user_id", params.course.userId)
    .eq("course_id", params.courseId)
    .eq("activity_date", today)
    .maybeSingle();
  if (todayError) {
    throw new Error(
      `lesson_activity today lookup failed: ${todayError.message}`,
    );
  }
  if (
    todayRow &&
    typeof todayRow.lesson_index === "number" &&
    todayRow.lesson_index !== params.lessonIndex
  ) {
    return { isNew: false, blockedByDayLimit: true };
  }

  const { error: insertError } = await admin.from("lesson_activity").insert({
    user_id: params.course.userId,
    course_id: params.courseId,
    lesson_index: params.lessonIndex,
    activity_date: today,
    lesson_feel: params.lessonFeel,
  });
  if (insertError) {
    // Unique race → treat as idempotent hit
    if (insertError.code === "23505") {
      return { isNew: false };
    }
    throw new Error(`lesson_activity insert failed: ${insertError.message}`);
  }
  return { isNew: true };
}

async function defaultBumpProgress(
  params: {
    courseId: string;
    lessonIndex: number;
    totalLessons: number;
    userId?: string;
  },
  admin: SupabaseClient,
): Promise<void> {
  let query = admin
    .from("courses")
    .select("progress, total, status")
    .eq("id", params.courseId);
  if (params.userId) {
    query = query.eq("user_id", params.userId);
  }
  const { data: course, error: readError } = await query.maybeSingle();
  if (readError) {
    throw new Error(`courses progress read failed: ${readError.message}`);
  }
  if (!course) {
    return;
  }

  const nextProgress = Math.max(
    typeof course.progress === "number" ? course.progress : 0,
    params.lessonIndex + 1,
  );
  const total =
    typeof course.total === "number" && course.total > 0
      ? course.total
      : params.totalLessons;
  const patch: { progress: number; status?: string } = {
    progress: nextProgress,
  };
  if (nextProgress >= total) {
    patch.status = "completed";
  }

  let update = admin.from("courses").update(patch).eq("id", params.courseId);
  if (params.userId) {
    update = update.eq("user_id", params.userId);
  }
  const { error: writeError } = await update;
  if (writeError) {
    throw new Error(`courses progress update failed: ${writeError.message}`);
  }
}

async function defaultLoadActivityDates(
  userId: string,
  admin: SupabaseClient,
): Promise<string[]> {
  const { data, error } = await admin
    .from("lesson_activity")
    .select("activity_date")
    .eq("user_id", userId);
  if (error) {
    throw new Error(`lesson_activity dates failed: ${error.message}`);
  }
  return (data ?? [])
    .map((row) => String(row.activity_date))
    .filter((d) => d.length > 0);
}

async function defaultCountPathsStillDue(
  userId: string,
  today: string,
  admin: SupabaseClient,
): Promise<number> {
  const { data: courses, error: coursesError } = await admin
    .from("courses")
    .select("id, progress, total")
    .eq("user_id", userId)
    .eq("status", "active");
  if (coursesError) {
    throw new Error(`courses due count failed: ${coursesError.message}`);
  }

  const { data: activity, error: activityError } = await admin
    .from("lesson_activity")
    .select("course_id")
    .eq("user_id", userId)
    .eq("activity_date", today);
  if (activityError) {
    throw new Error(`activity due count failed: ${activityError.message}`);
  }

  const doneToday = new Set(
    (activity ?? []).map((row) => String(row.course_id)),
  );
  return (courses ?? []).filter((c) => {
    const progress = typeof c.progress === "number" ? c.progress : 0;
    const total = typeof c.total === "number" ? c.total : 0;
    return progress < total && !doneToday.has(String(c.id));
  }).length;
}

function quizCacheKey(course: CourseContext, lessonIndex: number): string {
  return buildFingerprint({
    topicNormalized: normalizeTopic(course.topic),
    depth: course.depth,
    clarifications: clarificationsToMap(course.clarifications),
    cacheType: "quiz",
    lessonIndex,
    // Quiz keys ignore feel modifiers — always baseline (CONTENT-CACHE).
    difficultyModifier: "baseline",
  });
}

/**
 * Cache-first quiz for GET /api/courses/:id/lessons/:index/quiz.
 * Fingerprint excludes difficulty modifier (always baseline).
 */
export async function getQuiz(
  params: {
    courseId: string;
    lessonIndex: number;
    sessionId: string;
  },
  deps?: GetQuizDeps,
): Promise<GetQuizResult> {
  const resolveAdmin = () => deps?.admin ?? createAdminClient();
  const loadCourse =
    deps?.loadCourse ?? ((p) => defaultLoadCourse(p, resolveAdmin()));
  const lookup = deps?.lookup ?? lookupQuiz;
  const store = deps?.store ?? storeQuiz;
  const complete = deps?.complete ?? chatCompletion;
  const upsertQuizQuestions =
    deps?.upsertQuizQuestions ??
    ((p) => defaultUpsertQuizQuestions(p, resolveAdmin()));
  const loadBodySummary =
    deps?.loadBodySummary ??
    ((p) =>
      defaultLoadBodySummary(
        {
          courseId: params.courseId,
          course: p.course,
          lessonIndex: p.lessonIndex,
          lessonTitle: p.lessonTitle,
        },
        resolveAdmin(),
      ));

  const course = await loadCourse({
    courseId: params.courseId,
    sessionId: params.sessionId,
  });
  if (!course) {
    return { ok: false, code: "not_found", message: "Path not found" };
  }

  const lesson = course.lessons.find((l) => l.index === params.lessonIndex);
  if (!lesson) {
    return { ok: false, code: "not_found", message: "Lesson not found" };
  }

  if (isShelvedLessonBlocked(course, params.lessonIndex)) {
    return { ok: false, code: "locked", message: SHELVED_LOCK_MESSAGE };
  }

  const cacheKey = quizCacheKey(course, params.lessonIndex);
  const hit = await lookup(cacheKey);
  if (hit?.payload?.questions?.length) {
    if (course.kind === "member") {
      await upsertQuizQuestions({
        courseId: params.courseId,
        lessonIndex: params.lessonIndex,
        questions: hit.payload.questions,
        cacheKey,
      });
    }
    return { ok: true, data: toQuizResponse(hit.payload.questions) };
  }

  const bodySummary = await loadBodySummary({
    course,
    lessonIndex: params.lessonIndex,
    lessonTitle: lesson.title,
  });

  const result = await complete({
    model: quizModel(),
    messages: buildQuizMessages({
      topic: course.topic,
      depth: course.depth,
      clarifications: course.clarifications,
      lessonIndex: params.lessonIndex,
      lessonTitle: lesson.title,
      bodySummary,
    }),
    temperature: 0.3,
    max_tokens: 2000,
  });

  const payload = parseQuizJson(result.content);
  if (!payload) {
    throw new QuizGenerationError();
  }

  const sources = normalizeSources(result.sources as PerplexitySource[]);

  await store({
    cacheKey,
    topicNormalized: normalizeTopic(course.topic),
    depth: course.depth,
    lessonIndex: params.lessonIndex,
    payload,
    sources,
  });

  if (course.kind === "member") {
    await upsertQuizQuestions({
      courseId: params.courseId,
      lessonIndex: params.lessonIndex,
      questions: payload.questions,
      cacheKey,
    });
  }

  return { ok: true, data: toQuizResponse(payload.questions) };
}

/**
 * Score quiz + persist lesson feel. Idempotent for member activity unique key.
 */
export async function submitQuiz(
  params: {
    courseId: string;
    lessonIndex: number;
    sessionId: string;
    request: QuizSubmitRequest;
  },
  deps?: SubmitQuizDeps,
): Promise<SubmitQuizResult> {
  const resolveAdmin = () => deps?.admin ?? createAdminClient();
  const loadCourse =
    deps?.loadCourse ?? ((p) => defaultLoadCourse(p, resolveAdmin()));
  const lookup = deps?.lookup ?? lookupQuiz;
  const persistFeel =
    deps?.persistFeel ?? ((p) => defaultPersistFeel(p, resolveAdmin()));
  const bumpProgress =
    deps?.bumpProgress ?? ((p) => defaultBumpProgress(p, resolveAdmin()));
  const loadActivityDates =
    deps?.loadActivityDates ??
    ((userId) => defaultLoadActivityDates(userId, resolveAdmin()));
  const countPathsStillDue =
    deps?.countPathsStillDue ??
    ((userId, day) => defaultCountPathsStillDue(userId, day, resolveAdmin()));

  const course = await loadCourse({
    courseId: params.courseId,
    sessionId: params.sessionId,
  });
  if (!course) {
    return { ok: false, code: "not_found", message: "Path not found" };
  }

  const lesson: CourseLessonRef | undefined = course.lessons.find(
    (l) => l.index === params.lessonIndex,
  );
  if (!lesson) {
    return { ok: false, code: "not_found", message: "Lesson not found" };
  }

  if (isShelvedLessonBlocked(course, params.lessonIndex)) {
    return { ok: false, code: "locked", message: SHELVED_LOCK_MESSAGE };
  }

  const cacheKey = quizCacheKey(course, params.lessonIndex);
  const hit = await lookup(cacheKey);
  if (!hit?.payload?.questions?.length) {
    return { ok: false, code: "not_found", message: "Quiz not found" };
  }

  const feedback = hit.payload.questions.map((q) => {
    const answer = params.request.answers.find((a) => a.questionId === q.id);
    const selectedIndex = answer?.selectedIndex ?? -1;
    return {
      questionId: q.id,
      correct: selectedIndex === q.correctIndex,
      explanation: q.explanation,
      correctIndex: q.correctIndex,
    };
  });

  const persistResult = await persistFeel({
    course,
    courseId: params.courseId,
    lessonIndex: params.lessonIndex,
    lessonFeel: params.request.lessonFeel,
    sessionId: params.sessionId,
  });

  if (persistResult.blockedByDayLimit) {
    return {
      ok: false,
      code: "already_done_today",
      message: "This path already has a lesson completed today",
    };
  }

  if (course.kind === "member" && persistResult.isNew) {
    await bumpProgress({
      courseId: params.courseId,
      lessonIndex: params.lessonIndex,
      totalLessons: course.lessons.length,
      userId: course.userId,
    });
  }

  const nextProgress = Math.max(
    course.kind === "member" ? params.lessonIndex + 1 : 0,
    params.lessonIndex + 1,
  );
  const pathMastered =
    persistResult.isNew && nextProgress >= course.lessons.length;

  const response: QuizSubmitResponse = {
    feedback,
    complete: true,
    pathMastered,
  };

  if (course.kind === "member" && course.userId) {
    const dates = await loadActivityDates(course.userId);
    response.streak = computeStreak(dates);
    const today =
      deps?.today?.() ??
      todayInTimezone(await loadUserTimezone(course.userId, resolveAdmin()));
    response.pathsStillDue = await countPathsStillDue(course.userId, today);
  }

  return { ok: true, data: response };
}
