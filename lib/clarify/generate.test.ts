import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ChatCompletionResult } from "@/lib/ai/perplexity";

vi.mock("@/lib/ai/perplexity", () => ({
  clarifyModel: () => "sonar",
  chatCompletion: vi.fn(),
}));

import { chatCompletion } from "@/lib/ai/perplexity";
import {
  fallbackClarifyQuestions,
  generateClarifyQuestions,
  parseClarifyJson,
  stripMarkdownFences,
} from "@/lib/clarify/generate";

const VALID_PAYLOAD = {
  questions: [
    {
      id: "use-case",
      prompt: "What will you use this knowledge for?",
      options: [
        "Personal decisions",
        "Work projects",
        "Teaching others",
        "General curiosity",
      ],
    },
  ],
};

function completion(content: string): ChatCompletionResult {
  return { content, sources: [] };
}

describe("stripMarkdownFences", () => {
  it("removes json fences", () => {
    expect(stripMarkdownFences('```json\n{"a":1}\n```')).toBe('{"a":1}');
  });

  it("returns trimmed content when no fences", () => {
    expect(stripMarkdownFences('  {"a":1}  ')).toBe('{"a":1}');
  });
});

describe("parseClarifyJson", () => {
  it("parses valid JSON content", () => {
    expect(parseClarifyJson(JSON.stringify(VALID_PAYLOAD))).toEqual(
      VALID_PAYLOAD,
    );
  });

  it("parses fenced JSON", () => {
    const fenced = `\`\`\`json\n${JSON.stringify(VALID_PAYLOAD)}\n\`\`\``;
    expect(parseClarifyJson(fenced)).toEqual(VALID_PAYLOAD);
  });

  it("returns null for invalid JSON", () => {
    expect(parseClarifyJson("not json")).toBeNull();
  });

  it("returns null when schema validation fails", () => {
    expect(parseClarifyJson(JSON.stringify({ questions: [] }))).toBeNull();
  });
});

describe("fallbackClarifyQuestions", () => {
  it("returns a single focus question for the topic", () => {
    expect(fallbackClarifyQuestions("term sheets")).toEqual({
      questions: [
        {
          id: "fallback-focus",
          prompt:
            "What do you most want to get from learning about term sheets?",
          options: [
            "Core ideas & vocabulary",
            "Practical decisions",
            "Deep technical detail",
            "Teaching or explaining it",
          ],
        },
      ],
    });
  });
});

describe("generateClarifyQuestions", () => {
  beforeEach(() => {
    vi.mocked(chatCompletion).mockReset();
  });

  it("returns parsed questions on success", async () => {
    vi.mocked(chatCompletion).mockResolvedValueOnce(
      completion(JSON.stringify(VALID_PAYLOAD)),
    );

    const result = await generateClarifyQuestions({ topic: "term sheets" });

    expect(result).toEqual(VALID_PAYLOAD);
    expect(chatCompletion).toHaveBeenCalledTimes(1);
    expect(chatCompletion).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "sonar",
        messages: expect.any(Array),
      }),
    );
  });

  it("retries once then succeeds", async () => {
    vi.mocked(chatCompletion)
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce(completion(JSON.stringify(VALID_PAYLOAD)));

    const result = await generateClarifyQuestions({ topic: "stoicism" });

    expect(result).toEqual(VALID_PAYLOAD);
    expect(chatCompletion).toHaveBeenCalledTimes(2);
  });

  it("returns fallback after double failure", async () => {
    vi.mocked(chatCompletion)
      .mockRejectedValueOnce(new Error("fail-1"))
      .mockRejectedValueOnce(new Error("fail-2"));

    const result = await generateClarifyQuestions({ topic: "climate" });

    expect(result).toEqual(fallbackClarifyQuestions("climate"));
    expect(chatCompletion).toHaveBeenCalledTimes(2);
  });

  it("retries on invalid JSON then falls back", async () => {
    vi.mocked(chatCompletion)
      .mockResolvedValueOnce(completion("not json at all"))
      .mockResolvedValueOnce(completion("{ broken"));

    const result = await generateClarifyQuestions({
      topic: "LLMs",
      previousAnswers: [{ questionId: "focus", answer: "Work" }],
    });

    expect(result).toEqual(fallbackClarifyQuestions("LLMs"));
    expect(chatCompletion).toHaveBeenCalledTimes(2);
  });

  it("does not call live Perplexity (chatCompletion is mocked)", async () => {
    vi.mocked(chatCompletion).mockResolvedValueOnce(
      completion(JSON.stringify(VALID_PAYLOAD)),
    );

    await generateClarifyQuestions({ topic: "test" });

    expect(vi.isMockFunction(chatCompletion)).toBe(true);
  });
});
