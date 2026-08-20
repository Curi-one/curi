import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  lookupPathOutline,
  storePathOutline,
  type PathOutlinePayload,
} from "@/lib/cache/content-cache";

const SAMPLE_PAYLOAD: PathOutlinePayload = {
  total: 6,
  lessons: [
    { index: 0, title: "Intro" },
    { index: 1, title: "Core" },
    { index: 2, title: "Practice" },
    { index: 3, title: "Edge cases" },
    { index: 4, title: "Review" },
    { index: 5, title: "Apply" },
  ],
};

function createMockAdmin(handlers: {
  selectResult?: { data: unknown; error: unknown };
  updateResult?: { data: unknown; error: unknown };
  upsertResult?: { data: unknown; error: unknown };
}) {
  const updateEq = vi.fn().mockResolvedValue(handlers.updateResult ?? { data: null, error: null });
  const update = vi.fn().mockReturnValue({ eq: updateEq });

  const maybeSingle = vi
    .fn()
    .mockResolvedValue(handlers.selectResult ?? { data: null, error: null });
  const eqCacheType = vi.fn().mockReturnValue({ maybeSingle });
  const eqCacheKey = vi.fn().mockReturnValue({ eq: eqCacheType });
  const select = vi.fn().mockReturnValue({ eq: eqCacheKey });

  const upsert = vi
    .fn()
    .mockResolvedValue(handlers.upsertResult ?? { data: null, error: null });

  const from = vi.fn().mockReturnValue({ select, update, upsert });

  return {
    client: { from } as unknown as SupabaseClient,
    from,
    select,
    eqCacheKey,
    eqCacheType,
    maybeSingle,
    update,
    updateEq,
    upsert,
  };
}

describe("lookupPathOutline", () => {
  it("returns null on cache miss", async () => {
    const mock = createMockAdmin({
      selectResult: { data: null, error: null },
    });

    const result = await lookupPathOutline("abc", { admin: mock.client });

    expect(result).toBeNull();
    expect(mock.from).toHaveBeenCalledWith("content_cache");
    expect(mock.update).not.toHaveBeenCalled();
  });

  it("returns payload and increments hit_count on hit", async () => {
    const mock = createMockAdmin({
      selectResult: {
        data: {
          id: "row-1",
          payload: SAMPLE_PAYLOAD,
          sources: [{ title: "A", url: "https://example.com" }],
          hit_count: 2,
        },
        error: null,
      },
    });

    const result = await lookupPathOutline("fp-hit", { admin: mock.client });

    expect(result).toEqual({
      payload: SAMPLE_PAYLOAD,
      sources: [{ title: "A", url: "https://example.com" }],
    });
    expect(mock.update).toHaveBeenCalledWith({ hit_count: 3 });
    expect(mock.updateEq).toHaveBeenCalledWith("id", "row-1");
  });
});

describe("storePathOutline", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("upserts path_outline row", async () => {
    const mock = createMockAdmin({});

    await storePathOutline(
      {
        cacheKey: "fp-1",
        topicNormalized: "term sheets",
        depth: "essentials",
        payload: SAMPLE_PAYLOAD,
        sources: [],
      },
      { admin: mock.client },
    );

    expect(mock.from).toHaveBeenCalledWith("content_cache");
    expect(mock.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        cache_key: "fp-1",
        cache_type: "path_outline",
        topic_normalized: "term sheets",
        depth: "essentials",
        payload: SAMPLE_PAYLOAD,
        sources: [],
      }),
      expect.objectContaining({ onConflict: "cache_key" }),
    );
  });
});
