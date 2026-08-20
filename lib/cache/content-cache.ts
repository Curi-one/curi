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

export type ContentCacheDeps = {
  admin?: SupabaseClient;
};

function resolveAdmin(deps?: ContentCacheDeps): SupabaseClient {
  return deps?.admin ?? createAdminClient();
}

/** Lookup path_outline by fingerprint; increments hit_count on hit. */
export async function lookupPathOutline(
  fingerprint: string,
  deps?: ContentCacheDeps,
): Promise<PathOutlineCacheHit | null> {
  const admin = resolveAdmin(deps);

  const { data, error } = await admin
    .from("content_cache")
    .select("id, payload, sources, hit_count")
    .eq("cache_key", fingerprint)
    .eq("cache_type", "path_outline")
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
    payload: data.payload as PathOutlinePayload,
    sources: data.sources ?? [],
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
