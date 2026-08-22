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
import {
  DepthSlugSchema,
  LessonFeelSchema,
  SourceSchema,
} from "@/lib/api/schemas";
import { buildFingerprint } from "@/lib/cache/fingerprint";
import {
  lookupLessonBody,
  storeLessonBody,
  type DifficultyModifier,
  type LessonBodyPayload,
  type StoreLessonBodyInput,
} from "@/lib/cache/content-cache";
import {
  LEARNER_DETAILS_KEY,
  resolveLearnerDetails,
} from "@/lib/clarify/details";
import { stripMarkdownFences } from "@/lib/clarify/generate";
import { clarificationsToMap, normalizeTopic } from "@/lib/courses/outline";
import { isLessonReadable } from "@/lib/courses/path-map";
import {
  DEFAULT_LEARNING_PROFILE,
  learningProfilePromptLines,
  type LearningProfile,
} from "@/lib/profile/learning-profile";
import { loadUserPreferencesForUserId } from "@/lib/profile/db-preferences";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthenticatedUserId } from "@/lib/auth/user-id";
import { DEFAULT_TIMEZONE, todayInTimezone } from "@/lib/timezone";

export type { DifficultyModifier };

const MODIFIER_HINTS: Record<DifficultyModifier, string> = {
  baseline: "Standard editorial depth for the depth band.",
  easier: "Shorter sentences, define terms, lighter assumed knowledge.",
  deeper: "More nuance, edge cases, less repetition.",
  clearer:
    "More concrete examples, explicit structure, and a short recap opening.",
};

const PerplexityVisualSchema = z.object({
  title: z.string().min(1),
  caption: z.string().min(1),
  equation: z.string().min(1).optional(),
  formulaNote: z.string().min(1).optional(),
  imageUrl: z.string().url().optional(),
});

const PerplexityShareableFactSchema = z.object({
  fact: z.string().min(1),
  reflection: z.string().min(1),
});

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
  takeaways: z.array(z.string().min(1)).min(3).max(3),
  shareableFact: PerplexityShareableFactSchema,
  visuals: z.array(PerplexityVisualSchema).max(3).optional().default([]),
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
  /** Member courses only — used for the unlock-tomorrow read gate below. */
  progress?: number;
  hasActivityToday?: boolean;
  /** Member courses only. Shelved paths are view-only (FLOWS F4). */
  status?: "active" | "completed" | "shelved";
};

/**
 * Shelving frees an active-path slot, so an ungated shelved path would be an
 * unlimited-paths loophole: shelve → start another → shelve → repeat, while
 * every shelved path still serves (and bills for) new AI lessons. Already-read
 * lessons stay readable; anything past `progress` does not.
 */
export function isShelvedLessonBlocked(
  course: CourseContext,
  lessonIndex: number,
): boolean {
  return (
    course.kind === "member" &&
    course.status === "shelved" &&
    lessonIndex >= (course.progress ?? 0)
  );
}

export const SHELVED_LOCK_MESSAGE =
  "This path is shelved. Restore it to continue.";

export type GetLessonBodySuccess = {
  ok: true;
  data: LessonResponse;
};

export type GetLessonBodyNotFound = {
  ok: false;
  code: "not_found";
  message: string;
};

export type GetLessonBodyLocked = {
  ok: false;
  code: "locked";
  message: string;
};

export type GetLessonBodyResult =
  GetLessonBodySuccess | GetLessonBodyNotFound | GetLessonBodyLocked;

export type GetLessonBodyDeps = {
  admin?: SupabaseClient;
  lookup?: typeof lookupLessonBody;
  store?: (input: StoreLessonBodyInput) => Promise<void>;
  complete?: typeof chatCompletion;
  loadCourse?: (params: {
    courseId: string;
    sessionId: string;
  }) => Promise<CourseContext | null>;
  loadPriorFeel?: (params: {
    courseId: string;
    priorLessonIndex: number;
    userId: string;
  }) => Promise<LessonFeel | null>;
  loadLearningProfile?: (params: {
    userId: string;
  }) => Promise<LearningProfile>;
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
export function feelToDifficultyModifier(feel: LessonFeel): DifficultyModifier {
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
  params: { courseId: string; sessionId: string; userId?: string | null },
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

  const userId =
    params.userId !== undefined
      ? params.userId
      : await getAuthenticatedUserId();
  if (!userId) {
    return null;
  }

  const { data: course, error: courseError } = await admin
    .from("courses")
    .select("id, user_id, topic, depth, clarifications, progress, status")
    .eq("id", params.courseId)
    .eq("user_id", userId)
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

  const memberUserId = String(course.user_id);
  const hasActivityToday = await defaultLoadHasActivityToday(
    { courseId: params.courseId, userId: memberUserId },
    admin,
  );

  const statusRaw = String(course.status);
  const status =
    statusRaw === "shelved" || statusRaw === "completed" ? statusRaw : "active";

  return {
    kind: "member",
    topic: String(course.topic),
    depth: depthParsed.data,
    clarifications: parseClarifications(course.clarifications),
    lessons: parseOutlineLessons(lessonRows ?? []),
    userId: memberUserId,
    progress: typeof course.progress === "number" ? course.progress : 0,
    hasActivityToday,
    status,
  };
}

/** Whether the member already has lesson_activity today for this course (unlock-tomorrow gate). */
export async function defaultLoadHasActivityToday(
  params: { courseId: string; userId: string },
  admin: SupabaseClient,
): Promise<boolean> {
  const { data: userRow } = await admin
    .from("users")
    .select("timezone")
    .eq("id", params.userId)
    .maybeSingle();
  const tz = userRow?.timezone;
  const timezone =
    typeof tz === "string" && tz.length > 0 ? tz : DEFAULT_TIMEZONE;
  const today = todayInTimezone(timezone);

  const { data, error } = await admin
    .from("lesson_activity")
    .select("id")
    .eq("course_id", params.courseId)
    .eq("user_id", params.userId)
    .eq("activity_date", today)
    .maybeSingle();

  if (error) {
    throw new Error(`lesson_activity lookup failed: ${error.message}`);
  }
  return Boolean(data);
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

function pathProgressionHint(
  lessonIndex: number,
  totalLessons: number,
): string {
  const total = Math.max(totalLessons, 1);
  const position = lessonIndex / Math.max(total - 1, 1);
  const step = `Lesson ${lessonIndex + 1} of ${total}.`;
  if (total === 1 || position <= 0.34) {
    return `${step} Early path — foundations, definitions, and intuition. Make the learner feel oriented.`;
  }
  if (position <= 0.67) {
    return `${step} Mid path — mechanisms, connections, and worked examples. Make the learner feel more capable than the previous lesson.`;
  }
  return `${step} Late path — synthesis, edge cases, and “you can now…” mastery tone. Make the learner feel ready to use this knowledge.`;
}

function buildMessages(input: {
  topic: string;
  depth: DepthSlug;
  clarifications: ClarificationItem[];
  lessonIndex: number;
  lessonTitle: string;
  totalLessons: number;
  modifier: DifficultyModifier;
  learningProfile: LearningProfile;
}): PerplexityMessage[] {
  const lengthHint = {
    short: "Target ~2 minute read (one opening + one core paragraph in body).",
    medium: "Target ~5 minute read (opening + two substantive paragraphs in body).",
    long: "Target ~10 minute read (opening + three paragraphs with deeper follow-through in body).",
  }[input.learningProfile.length];

  const lines = [
    `Path topic (broader context): ${input.topic}`,
    `Depth band: ${input.depth}`,
    `Lesson index: ${input.lessonIndex} (0-based)`,
    `Lesson title: ${input.lessonTitle}`,
    `Path length: ${input.totalLessons} lessons`,
    pathProgressionHint(input.lessonIndex, input.totalLessons),
    `Difficulty modifier: ${input.modifier}`,
    `Modifier instruction: ${MODIFIER_HINTS[input.modifier]}`,
    lengthHint,
    ...learningProfilePromptLines(input.learningProfile),
    "Write the lesson body as proper markdown (paragraphs separated by blank lines; short ##/### headings sparingly; lists when useful; inline $...$ and block $$...$$ for equations when helpful).",
    "Always end the markdown body with a ## Summary section (2–4 sentences) that synthesizes what the learner should now understand — even for short lessons. Takeaways stay in the separate JSON field (not inside body).",
    "Prefer 1–2 visuals when a diagram, chart, map, formula figure, or concrete image clarifies the concept (not decorative). Do not emit caption-only visuals with no equation and no imageUrl.",
    "Also return exactly 3 takeaways and 1 shareableFact: a surprising fun fact tied to the broader path topic and/or this lesson — conversation-worthy, not generic motivation copy.",
    "Return ONLY valid JSON matching the schema in the system message.",
  ];

  const topicClarifications = input.clarifications.filter(
    (item) => item.questionId !== LEARNER_DETAILS_KEY,
  );
  if (topicClarifications.length > 0) {
    lines.push("Learner clarifications:");
    for (const item of topicClarifications) {
      lines.push(`- ${item.questionId}: ${item.answer}`);
    }
  }

  const learnerDetails = resolveLearnerDetails(input.clarifications);
  if (learnerDetails) {
    lines.push(`Additional learner context: ${learnerDetails}`);
  }

  return [
    {
      role: "system",
      content: `You write cited micro-lesson payloads for Curi.
Return ONLY valid JSON (no markdown fences, no commentary) matching:
{
  "body":"markdown string",
  "sources":[{"title":string,"url":string}],
  "takeaways":[string,string,string],
  "shareableFact":{"fact":string,"reflection":string},
  "visuals":[{"title":string,"caption":string,"equation"?:string,"formulaNote"?:string,"imageUrl"?:string}]
}

Rules:
- body is the teaching content: proper markdown. Use short ## / ### headings sparingly, lists when useful, and inline $...$ / block $$...$$ for equations when helpful (in addition to visuals[].equation). Separate short paragraphs with blank lines. The app renders markdown (GFM + math). Do not put takeaways inside body.
- body MUST end with a ## Summary section (2–4 sentences) synthesizing what the learner should now understand. Always include Summary, even for short lessons.
- Escalate depth across the path: early = foundations/definitions/intuition; mid = mechanisms/connections/worked examples; late = synthesis/edge cases/mastery (“you can now…”). Each lesson should make the reader feel more capable than the previous one. Feel modifiers still apply on top.
- Stay on the lesson title; use the path topic for broader context only.
- takeaways: exactly 3 memorable, concrete insights from THIS lesson (not generic advice). Keep them in the JSON field only.
- shareableFact: one surprising fun fact about the path topic or a memorable hook from this lesson — the kind you'd share at dinner. fact = punchy hook (max ~2 sentences), clearly about the path topic or lesson subject; reflection = one playful line on why it's interesting or what it connects to. Not a lesson summary.
- visuals: prefer 1–2 when a diagram, chart, map, formula figure, or concrete image clarifies a concept. Omit or [] when text alone is enough. Never emit a visual that is only title/caption with no equation and no imageUrl (those become empty visual notes). For formulas use visuals[].equation (bare TeX only, e.g. \\frac{a}{b} or E=mc^2 — do NOT wrap in \\[ \\], \\( \\), or $ delimiters) and/or body math; those render as equation blocks, not fake images. imageUrl only if a real public https URL that depicts the concept (never invent broken URLs; omit imageUrl rather than fake).
- Prefer accurate, source-backed claims.`,
    },
    { role: "user", content: lines.join("\n") },
  ];
}

function enrichmentFromPayload(
  payload: LessonBodyPayload,
): Pick<LessonResponse, "takeaways" | "shareableFact" | "visuals"> {
  return {
    ...(payload.takeaways && payload.takeaways.length > 0
      ? { takeaways: payload.takeaways }
      : {}),
    ...(payload.shareableFact ? { shareableFact: payload.shareableFact } : {}),
    ...(payload.visuals && payload.visuals.length > 0
      ? { visuals: payload.visuals }
      : {}),
  };
}

function sourcesFromCache(raw: unknown): Source[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return normalizeSources(raw as Array<{ title?: string; url?: string }>);
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
    deps?.loadCourse ?? ((p) => defaultLoadCourse(p, resolveAdmin()));
  const loadPriorFeel =
    deps?.loadPriorFeel ?? ((p) => defaultLoadPriorFeel(p, resolveAdmin()));
  const loadLearningProfile =
    deps?.loadLearningProfile ??
    ((p) => loadUserPreferencesForUserId(p.userId, resolveAdmin()));
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

  if (isShelvedLessonBlocked(course, params.lessonIndex)) {
    return { ok: false, code: "locked", message: SHELVED_LOCK_MESSAGE };
  }

  if (
    course.kind === "member" &&
    typeof course.progress === "number" &&
    !isLessonReadable({
      index: params.lessonIndex,
      progress: course.progress,
      hasActivityToday: course.hasActivityToday ?? false,
    })
  ) {
    return {
      ok: false,
      code: "locked",
      message: "This lesson unlocks tomorrow",
    };
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

  let learningProfile: LearningProfile = { ...DEFAULT_LEARNING_PROFILE };
  if (course.kind === "member" && course.userId) {
    learningProfile = await loadLearningProfile({ userId: course.userId });
  }

  const topicNormalized = normalizeTopic(course.topic);
  const cacheKey = buildFingerprint({
    topicNormalized,
    depth: course.depth,
    clarifications: clarificationsToMap(course.clarifications),
    cacheType: "lesson_body",
    lessonIndex: params.lessonIndex,
    difficultyModifier: modifier,
    learningProfile:
      course.kind === "member"
        ? {
            seq: learningProfile.seq,
            anchor: learningProfile.anchor,
            length: learningProfile.length,
            rigor: learningProfile.rigor,
            jargon: learningProfile.jargon,
          }
        : undefined,
  });

  const hit = await lookup(cacheKey);
  if (hit) {
    const body = bodyParagraphsFromPayload(hit.payload);
    const sources = sourcesFromCache(hit.sources);
    const enrichment = enrichmentFromPayload(hit.payload);
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
        ...enrichment,
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
      totalLessons: course.lessons.length,
      modifier,
      learningProfile,
    }),
    temperature: 0.3,
    max_tokens: 3200,
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

  const visuals = (parsed.visuals ?? []).map((v) => ({
    title: v.title,
    caption: v.caption,
    ...(v.equation ? { equation: v.equation } : {}),
    ...(v.formulaNote ? { formulaNote: v.formulaNote } : {}),
    ...(v.imageUrl ? { imageUrl: v.imageUrl } : {}),
  }));

  const payload: LessonBodyPayload = {
    body,
    takeaways: parsed.takeaways,
    shareableFact: parsed.shareableFact,
    ...(visuals.length > 0 ? { visuals } : {}),
  };
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
      takeaways: parsed.takeaways,
      shareableFact: parsed.shareableFact,
      ...(visuals.length > 0 ? { visuals } : {}),
    },
  };
}
