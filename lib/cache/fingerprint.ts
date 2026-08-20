import { createHash } from "node:crypto";

export type FingerprintInput = {
  topicNormalized: string;
  depth: string;
  clarifications: Record<string, string>;
  cacheType: "path_outline" | "lesson_body" | "quiz";
  lessonIndex?: number;
  difficultyModifier?: string;
};

/** Stub: SHA-256 hex fingerprint for content_cache lookup (see docs/CONTENT-CACHE.md). */
export function buildFingerprint(input: FingerprintInput): string {
  const canonical = JSON.stringify({
    topic: input.topicNormalized.trim().toLowerCase(),
    depth: input.depth,
    clarifications: Object.keys(input.clarifications)
      .sort()
      .reduce<Record<string, string>>((acc, key) => {
        acc[key] = input.clarifications[key];
        return acc;
      }, {}),
    cacheType: input.cacheType,
    lessonIndex: input.lessonIndex ?? null,
    difficultyModifier: input.difficultyModifier ?? "baseline",
  });
  return createHash("sha256").update(canonical).digest("hex");
}
