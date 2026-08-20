import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  chatCompletion,
  clarifyModel,
  lessonBodyModel,
  outlineModel,
  PerplexityEmptyContentError,
  PerplexityHttpError,
  PerplexityMissingKeyError,
  quizModel,
} from "@/lib/ai/perplexity";

const SUCCESS_FIXTURE = {
  id: "cmpl-test",
  model: "sonar",
  choices: [
    {
      index: 0,
      message: {
        role: "assistant",
        content: "Term sheets set the key economic terms of a round.",
      },
      finish_reason: "stop",
    },
  ],
  search_results: [
    {
      title: "Term Sheet Basics",
      url: "https://example.com/term-sheets",
      snippet:
        "A term sheet outlines valuation, liquidation preference, and control.",
    },
    {
      url: "https://example.com/no-title",
    },
  ],
};

describe("model helpers", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses cheap sonar for every task outside production", () => {
    vi.stubEnv("APP_ENV", "staging");
    expect(clarifyModel()).toBe("sonar");
    expect(outlineModel()).toBe("sonar");
    expect(quizModel()).toBe("sonar");
    expect(lessonBodyModel()).toBe("sonar");
  });

  it("uses sonar-pro for lesson bodies in production", () => {
    vi.stubEnv("APP_ENV", "production");
    expect(lessonBodyModel()).toBe("sonar-pro");
  });
});

describe("chatCompletion", () => {
  const originalKey = process.env.PERPLEXITY_API_KEY;

  beforeEach(() => {
    process.env.PERPLEXITY_API_KEY = "test-key";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => SUCCESS_FIXTURE,
      }),
    );
  });

  afterEach(() => {
    if (originalKey === undefined) {
      delete process.env.PERPLEXITY_API_KEY;
    } else {
      process.env.PERPLEXITY_API_KEY = originalKey;
    }
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("POSTs to Perplexity chat completions and parses content + sources", async () => {
    const result = await chatCompletion({
      model: "sonar",
      messages: [{ role: "user", content: "Explain term sheets briefly." }],
    });

    expect(result).toEqual({
      content: "Term sheets set the key economic terms of a round.",
      sources: [
        {
          title: "Term Sheet Basics",
          url: "https://example.com/term-sheets",
          snippet:
            "A term sheet outlines valuation, liquidation preference, and control.",
        },
        {
          url: "https://example.com/no-title",
        },
      ],
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      "https://api.perplexity.ai/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-key",
          "Content-Type": "application/json",
        }),
      }),
    );

    const [, init] = vi.mocked(fetch).mock.calls[0]!;
    const body = JSON.parse(String(init?.body));
    expect(body).toEqual({
      model: "sonar",
      messages: [{ role: "user", content: "Explain term sheets briefly." }],
    });
  });

  it("forwards optional generation params", async () => {
    await chatCompletion({
      model: "sonar-pro",
      messages: [{ role: "user", content: "hi" }],
      temperature: 0.2,
      max_tokens: 128,
    });

    const [, init] = vi.mocked(fetch).mock.calls[0]!;
    const body = JSON.parse(String(init?.body));
    expect(body).toMatchObject({
      model: "sonar-pro",
      temperature: 0.2,
      max_tokens: 128,
    });
  });

  it("throws PerplexityMissingKeyError when API key is empty", async () => {
    process.env.PERPLEXITY_API_KEY = "";

    await expect(
      chatCompletion({
        model: "sonar",
        messages: [{ role: "user", content: "hi" }],
      }),
    ).rejects.toBeInstanceOf(PerplexityMissingKeyError);

    expect(fetch).not.toHaveBeenCalled();
  });

  it("throws PerplexityHttpError on non-OK responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        text: async () => "invalid api key",
      }),
    );

    const error = await chatCompletion({
      model: "sonar",
      messages: [{ role: "user", content: "hi" }],
    }).catch((err: unknown) => err);

    expect(error).toBeInstanceOf(PerplexityHttpError);
    expect(error).toMatchObject({
      name: "PerplexityHttpError",
      status: 401,
    });
  });

  it("throws PerplexityEmptyContentError when content is missing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          choices: [{ message: { role: "assistant", content: "  " } }],
          search_results: [],
        }),
      }),
    );

    await expect(
      chatCompletion({
        model: "sonar",
        messages: [{ role: "user", content: "hi" }],
      }),
    ).rejects.toBeInstanceOf(PerplexityEmptyContentError);
  });

  it("never hits the real network (fetch is mocked)", async () => {
    await chatCompletion({
      model: "sonar",
      messages: [{ role: "user", content: "hi" }],
    });

    expect(vi.isMockFunction(fetch)).toBe(true);
    expect(vi.mocked(fetch).mock.calls[0]?.[0]).toBe(
      "https://api.perplexity.ai/chat/completions",
    );
  });
});
