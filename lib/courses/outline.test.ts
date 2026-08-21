import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ChatCompletionResult } from "@/lib/ai/perplexity";
import type { PathOutlinePayload } from "@/lib/cache/content-cache";
import { buildFingerprint } from "@/lib/cache/fingerprint";
import {
  clarificationsToMap,
  DEPTH_LESSON_BANDS,
  generatePathOutline,
  isTotalInDepthBand,
  normalizeTopic,
  PathOutlineGenerationError,
  PathOutlineInvalidBandError,
} from "@/lib/courses/outline";

vi.mock("@/lib/ai/perplexity", () => ({
  outlineModel: () => "sonar",
  chatCompletion: vi.fn(),
}));

import { chatCompletion } from "@/lib/ai/perplexity";

const ESSENTIALS_PAYLOAD: PathOutlinePayload = {
  total: 6,
  lessons: Array.from({ length: 6 }, (_, i) => ({
    index: i,
    title: `Lesson ${i}`,
  })),
};

function completion(content: string): ChatCompletionResult {
  return { content, sources: [{ title: "Src", url: "https://example.com" }] };
}

describe("normalizeTopic", () => {
  it("lowercases, trims, and collapses whitespace", () => {
    expect(normalizeTopic("  Term   Sheets ")).toBe("term sheets");
  });
});

describe("isTotalInDepthBand", () => {
  it("accepts totals inside each band", () => {
    expect(isTotalInDepthBand(5, "essentials")).toBe(true);
    expect(isTotalInDepthBand(9, "essentials")).toBe(true);
    expect(isTotalInDepthBand(10, "fluent")).toBe(true);
    expect(isTotalInDepthBand(18, "fluent")).toBe(true);
    expect(isTotalInDepthBand(19, "thorough")).toBe(true);
    expect(isTotalInDepthBand(35, "thorough")).toBe(true);
  });

  it("rejects totals outside band", () => {
    expect(isTotalInDepthBand(4, "essentials")).toBe(false);
    expect(isTotalInDepthBand(10, "essentials")).toBe(false);
    expect(isTotalInDepthBand(9, "fluent")).toBe(false);
    expect(isTotalInDepthBand(36, "thorough")).toBe(false);
  });

  it("exposes documented bands", () => {
    expect(DEPTH_LESSON_BANDS).toEqual({
      essentials: { min: 5, max: 9 },
      fluent: { min: 10, max: 18 },
      thorough: { min: 19, max: 35 },
    });
  });
});

describe("generatePathOutline", () => {
  const lookup = vi.fn();
  const store = vi.fn();

  beforeEach(() => {
    vi.mocked(chatCompletion).mockReset();
    lookup.mockReset();
    store.mockReset().mockResolvedValue(undefined);
  });

  it("returns cached payload on hit and skips Perplexity", async () => {
    lookup.mockResolvedValueOnce({
      payload: ESSENTIALS_PAYLOAD,
      sources: [],
    });

    const result = await generatePathOutline(
      {
        topic: "Term Sheets",
        depth: "essentials",
        clarifications: [{ questionId: "focus", answer: "Investor" }],
      },
      { lookup, store },
    );

    expect(result).toEqual(ESSENTIALS_PAYLOAD);
    expect(chatCompletion).not.toHaveBeenCalled();
    expect(store).not.toHaveBeenCalled();
    expect(lookup).toHaveBeenCalledTimes(1);
  });

  it("on miss calls Perplexity, stores, and returns outline", async () => {
    lookup.mockResolvedValueOnce(null);
    vi.mocked(chatCompletion).mockResolvedValueOnce(
      completion(JSON.stringify(ESSENTIALS_PAYLOAD)),
    );

    const result = await generatePathOutline(
      {
        topic: "Bayesian thinking",
        depth: "essentials",
        clarifications: [{ questionId: "focus", answer: "Curiosity" }],
      },
      { lookup, store },
    );

    expect(result).toEqual(ESSENTIALS_PAYLOAD);
    expect(chatCompletion).toHaveBeenCalledTimes(1);
    expect(chatCompletion).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "sonar",
        messages: expect.any(Array),
      }),
    );
    expect(store).toHaveBeenCalledWith(
      expect.objectContaining({
        topicNormalized: "bayesian thinking",
        depth: "essentials",
        payload: ESSENTIALS_PAYLOAD,
      }),
    );
  });

  it("rejects invalid total outside depth band", async () => {
    lookup.mockResolvedValueOnce(null);
    const bad = {
      total: 3,
      lessons: [
        { index: 0, title: "A" },
        { index: 1, title: "B" },
        { index: 2, title: "C" },
      ],
    };
    vi.mocked(chatCompletion)
      .mockResolvedValueOnce(completion(JSON.stringify(bad)))
      .mockResolvedValueOnce(completion(JSON.stringify(bad)));

    await expect(
      generatePathOutline(
        {
          topic: "too short",
          depth: "essentials",
          clarifications: [],
        },
        { lookup, store },
      ),
    ).rejects.toBeInstanceOf(PathOutlineInvalidBandError);

    expect(chatCompletion).toHaveBeenCalledTimes(2);
    expect(store).not.toHaveBeenCalled();
  });

  it("retries once then throws typed error on invalid JSON", async () => {
    lookup.mockResolvedValueOnce(null);
    vi.mocked(chatCompletion)
      .mockResolvedValueOnce(completion("not json"))
      .mockResolvedValueOnce(completion("{ broken"));

    await expect(
      generatePathOutline(
        { topic: "x", depth: "fluent", clarifications: [] },
        { lookup, store },
      ),
    ).rejects.toBeInstanceOf(PathOutlineGenerationError);

    expect(chatCompletion).toHaveBeenCalledTimes(2);
    expect(store).not.toHaveBeenCalled();
  });

  it("includes additional learner context in the user prompt when details set", async () => {
    lookup.mockResolvedValueOnce(null);
    vi.mocked(chatCompletion).mockResolvedValueOnce(
      completion(JSON.stringify(ESSENTIALS_PAYLOAD)),
    );

    await generatePathOutline(
      {
        topic: "Mandarin",
        depth: "essentials",
        clarifications: [{ questionId: "focus", answer: "Travel" }],
        details: "I need phrases for ordering food.",
      },
      { lookup, store },
    );

    const messages = vi.mocked(chatCompletion).mock.calls[0]?.[0]?.messages;
    const user = messages?.find((m) => m.role === "user")?.content ?? "";
    expect(user).toContain(
      "Additional learner context: I need phrases for ordering food.",
    );
  });

  it("changes path_outline fingerprint when details change", async () => {
    const base = {
      topicNormalized: "mandarin",
      depth: "essentials" as const,
      cacheType: "path_outline" as const,
    };
    const clarifications = [{ questionId: "focus", answer: "Travel" }];
    const without = buildFingerprint({
      ...base,
      clarifications: clarificationsToMap(clarifications),
    });
    const withDetails = buildFingerprint({
      ...base,
      clarifications: clarificationsToMap(
        clarifications,
        "I need phrases for ordering food.",
      ),
    });
    expect(withDetails).not.toBe(without);
    expect(clarificationsToMap(clarifications, "I need phrases")).toMatchObject(
      {
        focus: "Travel",
        learner_details: "I need phrases",
      },
    );
  });
});
