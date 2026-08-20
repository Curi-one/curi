import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  chatCompletion,
  lessonBodyModel,
  type PerplexityMessage,
  type PerplexitySource,
} from "@/lib/ai/perplexity";
import type {
  DepthSlug,
  LessonFeel,
  LessonResponse,
  Source,
} from "@/lib/api/schemas";
import { DepthSlugSchema, LessonFeelSchema, SourceSchema } from "@/lib/api/schemas";
import { buildFingerprint } from "@/lib/cache/fingerprint";
import {
  lookupLessonBody,
  storeLessonBody,
  type DifficultyModifier,
  type LessonBodyPayload,
  type StoreLessonBodyInput,
} from "@/lib/cache/content-cache";
import { stripMarkdownFences } from "@/lib/clarify/generate";
import {
  clarificationsToMap,
  normalizeTopic,
} from "@/lib/courses/outline";
import { createAdminClient } from "@/lib/supabase/admin";

export type { DifficultyModifier };

const MODIFIER_HINTS: Record<DifficultyModifier, string> = {
  baseline: "Standard editorial depth for the depth band.",
  easier:
    "Shorter sentences, define terms, lighter assumed knowledge.",
  deeper: "More nuance, edge cases, less repetition.",
  clearer:
    "More concrete examples, explicit structure, and a short recap opening.",
};

const PerplexityLessonBodySchema = z.object({
  body: z.string().min(1),
  sources: z
    .array(
      z.object({
        title: z.string().optional(),
        url: z.string().optional(),
      }),
    )
    .optional(),
});

export type CourseLessonRef = {
  index: number;
  title: string;
};

export type ClarificationItem = {
  questionId: string;
  answer: string;
};

export type CourseContext = {
  kind: "pending" | "member";
  topic: string;
  depth: DepthSlug;
  clarifications: ClarificationItem[];
  lessons: CourseLessonRef[];
  userId?: string;
  /** Guest feels from pending_courses.lesson_feels (lesson index → feel). */
  lessonFeels?: Record<number, LessonFeel>;
};

export type GetLessonBodySuccess = {
  ok: true;
  data: LessonResponse;
};

export type GetLessonBodyNotFound = {
  ok: false;
  code: "not_found";
  message: string;
};

export type GetLessonBodyResult = GetLessonBodySuccess | GetLessonBodyNotFound;

export type GetLessonBodyDeps = {
  admin?: SupabaseClient;
  lookup?: typeof lookupLessonBody;
  store?: (input: StoreLessonBodyInput) => Promise<void>;
  complete?: typeof chatCompletion;
  loadCourse?: (
    params: { courseId: string; sessionId: string },
  ) => Promise<CourseContext | null>;
  loadPriorFeel?: (params: {
    courseId: string;
    priorLessonIndex: number;
    userId: string;
  }) => Promise<LessonFeel | null>;
  upsertLessonContent?: (params: {
    courseId: string;
    lessonIndex: number;
    body: string;
    sources: Source[];
    cacheKey: string;
  }) => Promise<void>;
};

export class LessonBodyGenerationError extends Error {
  constructor(message = "Failed to generate lesson body") {
    super(message);
    this.name = "LessonBodyGenerationError";
  }
}

/** Map prior lesson_feel → next lesson difficulty_modifier (CONTENT-CACHE). */
export function feelToDifficultyModifier(
  feel: LessonFeel,
): DifficultyModifier {
  switch (feel) {
    case "too_easy":
      return "deeper";
    case "just_right":
      return "baseline";
    case "too_hard":
      return "easier";
    case "confusing":
      return "clearer";
  }
}

/** Alias used by quiz / feel exit criteria. */
export const modifierFromFeel = feelToDifficultyModifier;

/** Split markdown body into paragraph strings for LessonResponse. */
export function markdownToParagraphs(markdown: string): string[] {
  return markdown
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizeSources(
  ...groups: Array<Array<{ title?: string; url?: string }> | undefined>
): Source[] {
  const byUrl = new Map<string, Source>();
  for (const group of groups) {
    if (!group) continue;
    for (const item of group) {
      if (
        typeof item.title === "string" &&
        item.title.length > 0 &&
        typeof item.url === "string" &&
        isValidUrl(item.url)
      ) {
        const parsed = SourceSchema.safeParse({
          title: item.title,
          url: item.url,
        });
        if (parsed.success) {
          byUrl.set(parsed.data.url, parsed.data);
        }
      }
    }
  }
  return [...byUrl.values()];
}

function parseOutlineLessons(raw: unknown): CourseLessonRef[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const lessons: CourseLessonRef[] = [];
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

function parseClarifications(raw: unknown): ClarificationItem[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const items: ClarificationItem[] = [];
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

export function parseLessonFeels(raw: unknown): Record<number, LessonFeel> {
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

export async function defaultLoadCourse(
  params: { courseId: string; sessionId: string },
  admin: SupabaseClient,
): Promise<CourseContext | null> {
  const { data: pending, error: pendingError } = await admin
    .from("pending_courses")
    .select(
      "id, topic, depth, clarifications, outline, expires_at, lesson_feels",
    )
    .eq("id", params.courseId)
    .eq("anonymous_id", params.sessionId)
    .maybeSingle();

  if (pendingError) {
    throw new Error(`pending_courses lookup failed: ${pendingError.message}`);
  }

  if (pending) {
    const expiresAt = pending.expires_at
      ? Date.parse(String(pending.expires_at))
      : NaN;
    if (Number.isFinite(expiresAt) && expiresAt < Date.now()) {
      return null;
    }

    const depthParsed = DepthSlugSchema.safeParse(pending.depth);
    if (!depthParsed.success) {
      return null;
    }

    return {
      kind: "pending",
      topic: String(pending.topic),
      depth: depthParsed.data,
      clarifications: parseClarifications(pending.clarifications),
      lessons: parseOutlineLessons(pending.outline),
      lessonFeels: parseLessonFeels(pending.lesson_feels),
    };
  }

  const { data: course, error: courseError } = await admin
    .from("courses")
    .select("id, user_id, topic, depth, clarifications")
    .eq("id", params.courseId)
    .maybeSingle();

  if (courseError) {
    throw new Error(`courses lookup failed: ${courseError.message}`);
  }
  if (!course) {
    return null;
  }

  const depthParsed = DepthSlugSchema.safeParse(course.depth);
  if (!depthParsed.success) {
    return null;
  }

  const { data: lessonRows, error: lessonsError } = await admin
    .from("course_lessons")
    .select("index, title")
    .eq("course_id", params.courseId)
    .order("index", { ascending: true });

  if (lessonsError) {
    throw new Error(`course_lessons lookup failed: ${lessonsError.message}`);
  }

  return {
    kind: "member",
    topic: String(course.topic),
    depth: depthParsed.data,
    clarifications: parseClarifications(course.clarifications),
    lessons: parseOutlineLessons(lessonRows ?? []),
    userId: String(course.user_id),
  };
}

export async function defaultLoadPriorFeel(
  params: {
    courseId: string;
    priorLessonIndex: number;
    userId: string;
  },
  admin: SupabaseClient,
): Promise<LessonFeel | null> {
  const { data, error } = await admin
    .from("lesson_activity")
    .select("lesson_feel")
    .eq("course_id", params.courseId)
    .eq("user_id", params.userId)
    .eq("lesson_index", params.priorLessonIndex)
    .maybeSingle();

  if (error) {
    throw new Error(`lesson_activity lookup failed: ${error.message}`);
  }
  if (!data?.lesson_feel) {
    return null;
  }
  const parsed = LessonFeelSchema.safeParse(data.lesson_feel);
  return parsed.success ? parsed.data : null;
}

async function defaultUpsertLessonContent(
  params: {
    courseId: string;
    lessonIndex: number;
    body: string;
    sources: Source[];
    cacheKey: string;
  },
  admin: SupabaseClient,
): Promise<void> {
  const { error } = await admin.from("lesson_content").upsert(
    {
      course_id: params.courseId,
      lesson_index: params.lessonIndex,
      body: params.body,
      sources: params.sources,
      cache_key: params.cacheKey,
    },
    { onConflict: "course_id,lesson_index" },
  );

  if (error) {
    throw new Error(`lesson_content upsert failed: ${error.message}`);
  }
}

function parseLessonBodyJson(
  content: string,
): z.infer<typeof PerplexityLessonBodySchema> | null {
  try {
    const raw = JSON.parse(stripMarkdownFences(content)) as unknown;
    const parsed = PerplexityLessonBodySchema.safeParse(raw);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

function buildMessages(input: {
  topic: string;
  depth: DepthSlug;
  clarifications: ClarificationItem[];
  lessonIndex: number;
  lessonTitle: string;
  modifier: DifficultyModifier;
}): PerplexityMessage[] {
  const lines = [
    `Topic: ${input.topic}`,
    `Depth band: ${input.depth}`,
    `Lesson index: ${input.lessonIndex} (0-based)`,
    `Lesson title: ${input.lessonTitle}`,
    `Difficulty modifier: ${input.modifier}`,
    `Modifier instruction: ${MODIFIER_HINTS[input.modifier]}`,
    "Write the lesson body as markdown paragraphs suitable for a 3–5 minute micro-lesson.",
    'Return ONLY valid JSON: {"body":"markdown string","sources":[{"title":"...","url":"https://..."}]}',
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
      content: `You write cited micro-lesson bodies for Curi.
Return ONLY valid JSON (no markdown fences, no commentary) matching:
{"body":"markdown","sources":[{"title":string,"url":string}]}

Rules:
- body is markdown with short paragraphs separated by blank lines.
- Stay on the lesson title; do not cover the whole path.
- Include concrete examples where helpful.
- Prefer accurate, source-backed claims.`,
    },
    { role: "user", content: lines.join("\n") },
  ];
}

function sourcesFromCache(raw: unknown): Source[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return normalizeSources(
    raw as Array<{ title?: string; url?: string }>,
  );
}

function bodyParagraphsFromPayload(payload: LessonBodyPayload): string[] {
  if (Array.isArray(payload.body)) {
    return payload.body.filter(
      (p): p is string => typeof p === "string" && p.trim().length > 0,
    );
  }
  return [];
}

/**
 * Cache-first lesson body for GET /api/courses/:id/lessons/:index.
 * Lesson 1 always baseline; guests always baseline until quiz/activity exists.
 */
export async function getLessonBody(
  params: {
    courseId: string;
    lessonIndex: number;
    sessionId: string;
  },
  deps?: GetLessonBodyDeps,
): Promise<GetLessonBodyResult> {
  const resolveAdmin = () => deps?.admin ?? createAdminClient();
  const loadCourse =
    deps?.loadCourse ??
    ((p) => defaultLoadCourse(p, resolveAdmin()));
  const loadPriorFeel =
    deps?.loadPriorFeel ??
    ((p) => defaultLoadPriorFeel(p, resolveAdmin()));
  const lookup = deps?.lookup ?? lookupLessonBody;
  const store = deps?.store ?? storeLessonBody;
  const complete = deps?.complete ?? chatCompletion;
  const upsertLessonContent =
    deps?.upsertLessonContent ??
    ((p) => defaultUpsertLessonContent(p, resolveAdmin()));

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

  let modifier: DifficultyModifier = "baseline";
  if (params.lessonIndex > 0) {
    let priorFeel: LessonFeel | null = null;
    if (course.kind === "member" && course.userId) {
      priorFeel = await loadPriorFeel({
        courseId: params.courseId,
        priorLessonIndex: params.lessonIndex - 1,
        userId: course.userId,
      });
    } else if (course.kind === "pending" && course.lessonFeels) {
      priorFeel = course.lessonFeels[params.lessonIndex - 1] ?? null;
    }
    if (priorFeel) {
      modifier = feelToDifficultyModifier(priorFeel);
    }
  }

  const topicNormalized = normalizeTopic(course.topic);
  const cacheKey = buildFingerprint({
    topicNormalized,
    depth: course.depth,
    clarifications: clarificationsToMap(course.clarifications),
    cacheType: "lesson_body",
    lessonIndex: params.lessonIndex,
    difficultyModifier: modifier,
  });

  const hit = await lookup(cacheKey);
  if (hit) {
    const body = bodyParagraphsFromPayload(hit.payload);
    const sources = sourcesFromCache(hit.sources);
    if (course.kind === "member") {
      await upsertLessonContent({
        courseId: params.courseId,
        lessonIndex: params.lessonIndex,
        body: body.join("\n\n"),
        sources,
        cacheKey,
      });
    }
    return {
      ok: true,
      data: {
        title: lesson.title,
        body,
        sources,
      },
    };
  }

  const result = await complete({
    model: lessonBodyModel(),
    messages: buildMessages({
      topic: course.topic,
      depth: course.depth,
      clarifications: course.clarifications,
      lessonIndex: params.lessonIndex,
      lessonTitle: lesson.title,
      modifier,
    }),
    temperature: 0.3,
    max_tokens: 2000,
  });

  const parsed = parseLessonBodyJson(result.content);
  if (!parsed) {
    throw new LessonBodyGenerationError();
  }

  const body = markdownToParagraphs(parsed.body);
  if (body.length === 0) {
    throw new LessonBodyGenerationError("Lesson body was empty");
  }

  const sources = normalizeSources(
    parsed.sources,
    result.sources as PerplexitySource[],
  );

  const payload: LessonBodyPayload = { body };
  await store({
    cacheKey,
    topicNormalized,
    depth: course.depth,
    lessonIndex: params.lessonIndex,
    difficultyModifier: modifier,
    payload,
    sources,
  });

  if (course.kind === "member") {
    await upsertLessonContent({
      courseId: params.courseId,
      lessonIndex: params.lessonIndex,
      body: body.join("\n\n"),
      sources,
      cacheKey,
    });
  }

  return {
    ok: true,
    data: {
      title: lesson.title,
      body,
      sources,
    },
  };
}
