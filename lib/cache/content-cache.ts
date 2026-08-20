import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

export type PathOutlineLesson = {
  index: number;
  title: string;
};

export type PathOutlinePayload = {
  total: number;
  lessons: PathOutlineLesson[];
};

export type PathOutlineCacheHit = {
  payload: PathOutlinePayload;
  sources: unknown;
};

export type LessonBodyPayload = {
  body: string[];
};

export type LessonBodyCacheHit = {
  payload: LessonBodyPayload;
  sources: unknown;
};

export type DifficultyModifier =
  | "baseline"
  | "easier"
  | "deeper"
  | "clearer";

export type ContentCacheDeps = {
  admin?: SupabaseClient;
};

function resolveAdmin(deps?: ContentCacheDeps): SupabaseClient {
  return deps?.admin ?? createAdminClient();
}

async function lookupCacheRow(
  fingerprint: string,
  cacheType: "path_outline" | "lesson_body",
  deps?: ContentCacheDeps,
): Promise<{ id: string; payload: unknown; sources: unknown } | null> {
  const admin = resolveAdmin(deps);

  const { data, error } = await admin
    .from("content_cache")
    .select("id, payload, sources, hit_count")
    .eq("cache_key", fingerprint)
    .eq("cache_type", cacheType)
    .maybeSingle();

  if (error) {
    throw new Error(`content_cache lookup failed: ${error.message}`);
  }
  if (!data) {
    return null;
  }

  const hitCount =
    typeof data.hit_count === "number" && Number.isFinite(data.hit_count)
      ? data.hit_count
      : 0;

  const { error: updateError } = await admin
    .from("content_cache")
    .update({ hit_count: hitCount + 1 })
    .eq("id", data.id);

  if (updateError) {
    throw new Error(`content_cache hit_count update failed: ${updateError.message}`);
  }

  return {
    id: data.id,
    payload: data.payload,
    sources: data.sources ?? [],
  };
}

/** Lookup path_outline by fingerprint; increments hit_count on hit. */
export async function lookupPathOutline(
  fingerprint: string,
  deps?: ContentCacheDeps,
): Promise<PathOutlineCacheHit | null> {
  const row = await lookupCacheRow(fingerprint, "path_outline", deps);
  if (!row) {
    return null;
  }
  return {
    payload: row.payload as PathOutlinePayload,
    sources: row.sources,
  };
}

/** Lookup lesson_body by fingerprint; increments hit_count on hit. */
export async function lookupLessonBody(
  fingerprint: string,
  deps?: ContentCacheDeps,
): Promise<LessonBodyCacheHit | null> {
  const row = await lookupCacheRow(fingerprint, "lesson_body", deps);
  if (!row) {
    return null;
  }
  return {
    payload: row.payload as LessonBodyPayload,
    sources: row.sources,
  };
}

export type StorePathOutlineInput = {
  cacheKey: string;
  topicNormalized: string;
  depth: string;
  payload: PathOutlinePayload;
  sources: unknown;
};

/** Insert or upsert a path_outline cache row. */
export async function storePathOutline(
  input: StorePathOutlineInput,
  deps?: ContentCacheDeps,
): Promise<void> {
  const admin = resolveAdmin(deps);

  const { error } = await admin.from("content_cache").upsert(
    {
      cache_key: input.cacheKey,
      cache_type: "path_outline",
      topic_normalized: input.topicNormalized,
      depth: input.depth,
      payload: input.payload,
      sources: input.sources,
      difficulty_modifier: "baseline",
      hit_count: 0,
    },
    { onConflict: "cache_key" },
  );

  if (error) {
    throw new Error(`content_cache store failed: ${error.message}`);
  }
}

export type StoreLessonBodyInput = {
  cacheKey: string;
  topicNormalized: string;
  depth: string;
  lessonIndex: number;
  difficultyModifier: DifficultyModifier;
  payload: LessonBodyPayload;
  sources: unknown;
};

/** Insert or upsert a lesson_body cache row. */
export async function storeLessonBody(
  input: StoreLessonBodyInput,
  deps?: ContentCacheDeps,
): Promise<void> {
  const admin = resolveAdmin(deps);

  const { error } = await admin.from("content_cache").upsert(
    {
      cache_key: input.cacheKey,
      cache_type: "lesson_body",
      topic_normalized: input.topicNormalized,
      depth: input.depth,
      lesson_index: input.lessonIndex,
      difficulty_modifier: input.difficultyModifier,
      payload: input.payload,
      sources: input.sources,
      hit_count: 0,
    },
    { onConflict: "cache_key" },
  );

  if (error) {
    throw new Error(`content_cache store failed: ${error.message}`);
  }
}
