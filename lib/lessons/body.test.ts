import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ChatCompletionResult } from "@/lib/ai/perplexity";
import { buildFingerprint } from "@/lib/cache/fingerprint";
import {
  clarificationsToMap,
  normalizeTopic,
} from "@/lib/courses/outline";
import {
  feelToDifficultyModifier,
  getLessonBody,
  markdownToParagraphs,
  type GetLessonBodyDeps,
} from "@/lib/lessons/body";

vi.mock("@/lib/ai/perplexity", () => ({
  lessonBodyModel: () => "sonar-pro",
  chatCompletion: vi.fn(),
}));

import { chatCompletion } from "@/lib/ai/perplexity";

const TOPIC = "Term Sheets";
const DEPTH = "essentials" as const;
const CLARIFICATIONS = [{ questionId: "focus", answer: "Investor" }];
const LESSONS = [
  { index: 0, title: "What is a term sheet?" },
  { index: 1, title: "Key economic terms" },
];

function completion(content: string): ChatCompletionResult {
  return {
    content,
    sources: [{ title: "API Source", url: "https://example.com/api" }],
  };
}

function fingerprintFor(
  lessonIndex: number,
  difficultyModifier: string,
): string {
  return buildFingerprint({
    topicNormalized: normalizeTopic(TOPIC),
    depth: DEPTH,
    clarifications: clarificationsToMap(CLARIFICATIONS),
    cacheType: "lesson_body",
    lessonIndex,
    difficultyModifier,
  });
}

describe("feelToDifficultyModifier", () => {
  it("maps lesson feel to next-lesson cache modifier", () => {
    expect(feelToDifficultyModifier("too_easy")).toBe("deeper");
    expect(feelToDifficultyModifier("just_right")).toBe("baseline");
    expect(feelToDifficultyModifier("too_hard")).toBe("easier");
    expect(feelToDifficultyModifier("confusing")).toBe("clearer");
  });
});

describe("markdownToParagraphs", () => {
  it("splits markdown on blank lines", () => {
    expect(markdownToParagraphs("One.\n\nTwo.\n\nThree.")).toEqual([
      "One.",
      "Two.",
      "Three.",
    ]);
  });
});

describe("getLessonBody", () => {
  const lookup = vi.fn();
  const store = vi.fn();
  const loadCourse = vi.fn();
  const loadPriorFeel = vi.fn();
  const upsertLessonContent = vi.fn();

  const baseDeps: GetLessonBodyDeps = {
    lookup,
    store,
    loadCourse,
    loadPriorFeel,
    upsertLessonContent,
    complete: chatCompletion,
  };

  beforeEach(() => {
    vi.mocked(chatCompletion).mockReset();
    lookup.mockReset();
    store.mockReset().mockResolvedValue(undefined);
    loadCourse.mockReset();
    loadPriorFeel.mockReset().mockResolvedValue(null);
    upsertLessonContent.mockReset().mockResolvedValue(undefined);
  });

  it("uses baseline difficulty modifier in fingerprint for lesson 1", async () => {
    loadCourse.mockResolvedValueOnce({
      kind: "pending",
      topic: TOPIC,
      depth: DEPTH,
      clarifications: CLARIFICATIONS,
      lessons: LESSONS,
    });
    lookup.mockResolvedValueOnce(null);
    vi.mocked(chatCompletion).mockResolvedValueOnce(
      completion(
        JSON.stringify({
          body: "Para one.\n\nPara two.",
          sources: [{ title: "JSON", url: "https://example.com/json" }],
        }),
      ),
    );

    const result = await getLessonBody(
      { courseId: "c1", lessonIndex: 0, sessionId: "anon-1" },
      baseDeps,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(lookup).toHaveBeenCalledWith(fingerprintFor(0, "baseline"));
    expect(loadPriorFeel).not.toHaveBeenCalled();
    expect(result.data).toEqual({
      title: "What is a term sheet?",
      body: ["Para one.", "Para two."],
      sources: expect.arrayContaining([
        { title: "JSON", url: "https://example.com/json" },
        { title: "API Source", url: "https://example.com/api" },
      ]),
    });
    expect(chatCompletion).toHaveBeenCalledWith(
      expect.objectContaining({ model: "sonar-pro" }),
    );
    expect(store).toHaveBeenCalledWith(
      expect.objectContaining({
        cacheKey: fingerprintFor(0, "baseline"),
        difficultyModifier: "baseline",
        lessonIndex: 0,
        topicNormalized: "term sheets",
      }),
    );
  });

  it("returns cached body on hit and skips Perplexity", async () => {
    loadCourse.mockResolvedValueOnce({
      kind: "pending",
      topic: TOPIC,
      depth: DEPTH,
      clarifications: CLARIFICATIONS,
      lessons: LESSONS,
    });
    lookup.mockResolvedValueOnce({
      payload: { body: ["Cached paragraph."] },
      sources: [{ title: "Cached", url: "https://example.com/cached" }],
    });

    const result = await getLessonBody(
      { courseId: "c1", lessonIndex: 0, sessionId: "anon-1" },
      baseDeps,
    );

    expect(result).toEqual({
      ok: true,
      data: {
        title: "What is a term sheet?",
        body: ["Cached paragraph."],
        sources: [{ title: "Cached", url: "https://example.com/cached" }],
      },
    });
    expect(chatCompletion).not.toHaveBeenCalled();
    expect(store).not.toHaveBeenCalled();
  });

  it("maps prior too_hard feel to easier modifier for lesson 2", async () => {
    loadCourse.mockResolvedValueOnce({
      kind: "member",
      topic: TOPIC,
      depth: DEPTH,
      clarifications: CLARIFICATIONS,
      lessons: LESSONS,
      userId: "user-1",
    });
    loadPriorFeel.mockResolvedValueOnce("too_hard");
    lookup.mockResolvedValueOnce({
      payload: { body: ["Easier body."] },
      sources: [],
    });

    const result = await getLessonBody(
      { courseId: "c1", lessonIndex: 1, sessionId: "sess" },
      baseDeps,
    );

    expect(result.ok).toBe(true);
    expect(loadPriorFeel).toHaveBeenCalledWith({
      courseId: "c1",
      priorLessonIndex: 0,
      userId: "user-1",
    });
    expect(lookup).toHaveBeenCalledWith(fingerprintFor(1, "easier"));
  });

  it("uses baseline for guests on lesson index > 0 (no activity)", async () => {
    loadCourse.mockResolvedValueOnce({
      kind: "pending",
      topic: TOPIC,
      depth: DEPTH,
      clarifications: CLARIFICATIONS,
      lessons: LESSONS,
    });
    lookup.mockResolvedValueOnce({
      payload: { body: ["L2 guest."] },
      sources: [],
    });

    await getLessonBody(
      { courseId: "c1", lessonIndex: 1, sessionId: "anon-1" },
      baseDeps,
    );

    expect(loadPriorFeel).not.toHaveBeenCalled();
    expect(lookup).toHaveBeenCalledWith(fingerprintFor(1, "baseline"));
  });

  it("returns not_found when course is missing", async () => {
    loadCourse.mockResolvedValueOnce(null);

    const result = await getLessonBody(
      { courseId: "missing", lessonIndex: 0, sessionId: "anon-1" },
      baseDeps,
    );

    expect(result).toEqual({
      ok: false,
      code: "not_found",
      message: "Path not found",
    });
    expect(lookup).not.toHaveBeenCalled();
  });

  it("returns not_found when lesson index is out of bounds", async () => {
    loadCourse.mockResolvedValueOnce({
      kind: "pending",
      topic: TOPIC,
      depth: DEPTH,
      clarifications: CLARIFICATIONS,
      lessons: LESSONS,
    });

    const result = await getLessonBody(
      { courseId: "c1", lessonIndex: 99, sessionId: "anon-1" },
      baseDeps,
    );

    expect(result).toEqual({
      ok: false,
      code: "not_found",
      message: "Lesson not found",
    });
  });
});
