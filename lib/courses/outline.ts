import { z } from "zod";
import {
  chatCompletion,
  outlineModel,
  type PerplexityMessage,
  type PerplexitySource,
} from "@/lib/ai/perplexity";
import type { CourseCreateRequest, DepthSlug } from "@/lib/api/schemas";
import { buildFingerprint } from "@/lib/cache/fingerprint";
import {
  lookupPathOutline,
  storePathOutline,
  type PathOutlinePayload,
  type StorePathOutlineInput,
} from "@/lib/cache/content-cache";
import { stripMarkdownFences } from "@/lib/clarify/generate";

export const DEPTH_LESSON_BANDS: Record<
  DepthSlug,
  { min: number; max: number }
> = {
  essentials: { min: 5, max: 9 },
  fluent: { min: 10, max: 18 },
  thorough: { min: 19, max: 35 },
};

export class PathOutlineGenerationError extends Error {
  constructor(message = "Failed to generate path outline") {
    super(message);
    this.name = "PathOutlineGenerationError";
  }
}

export class PathOutlineInvalidBandError extends PathOutlineGenerationError {
  constructor(depth: DepthSlug, total: number) {
    const band = DEPTH_LESSON_BANDS[depth];
    super(
      `Outline total ${total} is outside ${depth} band ${band.min}–${band.max}`,
    );
    this.name = "PathOutlineInvalidBandError";
  }
}

const PathOutlinePayloadSchema = z
  .object({
    total: z.number().int().positive(),
    lessons: z
      .array(
        z.object({
          index: z.number().int().nonnegative(),
          title: z.string().min(1),
        }),
      )
      .min(1),
  })
  .superRefine((data, ctx) => {
    if (data.total !== data.lessons.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "total must equal lessons.length",
      });
    }
  });

export type GeneratePathOutlineDeps = {
  lookup?: typeof lookupPathOutline;
  store?: (input: StorePathOutlineInput) => Promise<void>;
  complete?: typeof chatCompletion;
};

type AttemptOk = {
  ok: true;
  payload: PathOutlinePayload;
  sources: PerplexitySource[];
};

type AttemptFail = {
  ok: false;
  reason: "parse" | "error" | "band";
  total?: number;
};

type AttemptResult = AttemptOk | AttemptFail;

/** Lowercase, trim, collapse whitespace — CONTENT-CACHE normalization. */
export function normalizeTopic(topic: string): string {
  return topic.trim().toLowerCase().replace(/\s+/g, " ");
}

export function isTotalInDepthBand(total: number, depth: DepthSlug): boolean {
  const band = DEPTH_LESSON_BANDS[depth];
  return total >= band.min && total <= band.max;
}

/** Build clarifications map keyed by questionId (v1 fingerprint). */
export function clarificationsToMap(
  clarifications: CourseCreateRequest["clarifications"],
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const item of clarifications) {
    map[item.questionId] = item.answer;
  }
  return map;
}

export function parsePathOutlineJson(
  content: string,
): PathOutlinePayload | null {
  try {
    const raw = JSON.parse(stripMarkdownFences(content)) as unknown;
    const parsed = PathOutlinePayloadSchema.safeParse(raw);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

const SYSTEM_PROMPT = `You create learning path outlines for Curi micro-lessons.
Return ONLY valid JSON (no markdown, no commentary) matching:
{"total":number,"lessons":[{"index":number,"title":string}]}

Rules:
- total MUST equal lessons.length.
- index is 0-based (0, 1, 2, ...).
- Titles are short, concrete lesson titles in a sensible learning order.
- Stay within the requested depth band for total lesson count.`;

function buildMessages(input: {
  topic: string;
  depth: DepthSlug;
  clarifications: CourseCreateRequest["clarifications"];
}): PerplexityMessage[] {
  const band = DEPTH_LESSON_BANDS[input.depth];
  const lines = [
    `Topic: ${input.topic}`,
    `Depth: ${input.depth} (total lessons must be between ${band.min} and ${band.max} inclusive)`,
    "Generate a path outline as JSON.",
  ];

  if (input.clarifications.length > 0) {
    lines.push("Learner clarifications:");
    for (const item of input.clarifications) {
      lines.push(`- ${item.questionId}: ${item.answer}`);
    }
  }

  return [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: lines.join("\n") },
  ];
}

async function attemptGenerate(
  input: CourseCreateRequest,
  complete: typeof chatCompletion,
): Promise<AttemptResult> {
  try {
    const result = await complete({
      model: outlineModel(),
      messages: buildMessages(input),
      temperature: 0.2,
      max_tokens: 1200,
    });
    const parsed = parsePathOutlineJson(result.content);
    if (!parsed) {
      return { ok: false, reason: "parse" };
    }
    if (!isTotalInDepthBand(parsed.total, input.depth)) {
      return { ok: false, reason: "band", total: parsed.total };
    }
    return { ok: true, payload: parsed, sources: result.sources };
  } catch {
    return { ok: false, reason: "error" };
  }
}

/**
 * Cache-first path outline generation.
 * HIT → return payload; MISS → Perplexity → validate → store → return.
 */
export async function generatePathOutline(
  input: CourseCreateRequest,
  deps?: GeneratePathOutlineDeps,
): Promise<PathOutlinePayload> {
  const topicNormalized = normalizeTopic(input.topic);
  const clarifications = clarificationsToMap(input.clarifications);
  const cacheKey = buildFingerprint({
    topicNormalized,
    depth: input.depth,
    clarifications,
    cacheType: "path_outline",
  });

  const lookup = deps?.lookup ?? lookupPathOutline;
  const store = deps?.store ?? storePathOutline;
  const complete = deps?.complete ?? chatCompletion;

  const hit = await lookup(cacheKey);
  if (hit) {
    return hit.payload;
  }

  const first = await attemptGenerate(input, complete);
  if (first.ok) {
    await store({
      cacheKey,
      topicNormalized,
      depth: input.depth,
      payload: first.payload,
      sources: first.sources,
    });
    return first.payload;
  }

  const second = await attemptGenerate(input, complete);
  if (second.ok) {
    await store({
      cacheKey,
      topicNormalized,
      depth: input.depth,
      payload: second.payload,
      sources: second.sources,
    });
    return second.payload;
  }

  const bandTotal =
    first.reason === "band"
      ? first.total
      : second.reason === "band"
        ? second.total
        : undefined;
  if (bandTotal !== undefined) {
    throw new PathOutlineInvalidBandError(input.depth, bandTotal);
  }

  throw new PathOutlineGenerationError();
}
