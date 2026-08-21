import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ChatCompletionResult } from "@/lib/ai/perplexity";
import { buildFingerprint } from "@/lib/cache/fingerprint";
import { clarificationsToMap, normalizeTopic } from "@/lib/courses/outline";
import {
  feelToDifficultyModifier,
  getLessonBody,
  markdownToParagraphs,
  type GetLessonBodyDeps,
} from "@/lib/lessons/body";
import { DEFAULT_LEARNING_PROFILE } from "@/lib/profile/learning-profile";

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
  learningProfile?: {
    seq: string;
    anchor: string;
    length: string;
    rigor: string;
    jargon: string;
  },
): string {
  return buildFingerprint({
    topicNormalized: normalizeTopic(TOPIC),
    depth: DEPTH,
    clarifications: clarificationsToMap(CLARIFICATIONS),
    cacheType: "lesson_body",
    lessonIndex,
    difficultyModifier,
    learningProfile,
  });
}

function sampleLessonJson(overrides?: Record<string, unknown>): string {
  return JSON.stringify({
    body: "Para one.\n\nPara two.",
    sources: [{ title: "JSON", url: "https://example.com/json" }],
    takeaways: [
      "Takeaway one about term sheets.",
      "Takeaway two about negotiation.",
      "Takeaway three about ownership.",
    ],
    shareableFact: {
      fact: "The option pool is often cut from the pre-money.",
      reflection: "Headline valuation is not the whole deal.",
    },
    visuals: [
      {
        title: "Deal stack",
        caption: "Economics, control, and future flexibility trade off.",
        equation: "Deal = Economics + Control",
      },
    ],
    ...overrides,
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
  const loadLearningProfile = vi.fn();
  const upsertLessonContent = vi.fn();

  const baseDeps: GetLessonBodyDeps = {
    lookup,
    store,
    loadCourse,
    loadPriorFeel,
    loadLearningProfile,
    upsertLessonContent,
    complete: chatCompletion,
  };

  beforeEach(() => {
    vi.mocked(chatCompletion).mockReset();
    lookup.mockReset();
    store.mockReset().mockResolvedValue(undefined);
    loadCourse.mockReset();
    loadPriorFeel.mockReset().mockResolvedValue(null);
    loadLearningProfile.mockReset().mockResolvedValue(DEFAULT_LEARNING_PROFILE);
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
      completion(sampleLessonJson()),
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
      takeaways: [
        "Takeaway one about term sheets.",
        "Takeaway two about negotiation.",
        "Takeaway three about ownership.",
      ],
      shareableFact: {
        fact: "The option pool is often cut from the pre-money.",
        reflection: "Headline valuation is not the whole deal.",
      },
      visuals: [
        {
          title: "Deal stack",
          caption: "Economics, control, and future flexibility trade off.",
          equation: "Deal = Economics + Control",
        },
      ],
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
        payload: expect.objectContaining({
          body: ["Para one.", "Para two."],
          takeaways: expect.any(Array),
          shareableFact: expect.objectContaining({
            fact: expect.any(String),
          }),
        }),
      }),
    );
  });

  it("returns cached body with enrichment on hit and skips Perplexity", async () => {
    loadCourse.mockResolvedValueOnce({
      kind: "pending",
      topic: TOPIC,
      depth: DEPTH,
      clarifications: CLARIFICATIONS,
      lessons: LESSONS,
    });
    lookup.mockResolvedValueOnce({
      payload: {
        body: ["Cached paragraph."],
        takeaways: ["A", "B", "C"],
        shareableFact: { fact: "Cached fact", reflection: "Cached note" },
        visuals: [{ title: "V", caption: "C" }],
      },
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
        takeaways: ["A", "B", "C"],
        shareableFact: { fact: "Cached fact", reflection: "Cached note" },
        visuals: [{ title: "V", caption: "C" }],
      },
    });
    expect(chatCompletion).not.toHaveBeenCalled();
    expect(store).not.toHaveBeenCalled();
  });

  it("rejects Perplexity JSON missing takeaways or shareableFact", async () => {
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
          body: "Only body.",
          sources: [],
        }),
      ),
    );

    await expect(
      getLessonBody(
        { courseId: "c1", lessonIndex: 0, sessionId: "anon-1" },
        baseDeps,
      ),
    ).rejects.toThrow(/Failed to generate lesson body/);
  });

  it("includes member learning profile in Perplexity prompt and cache key", async () => {
    loadCourse.mockResolvedValueOnce({
      kind: "member",
      topic: TOPIC,
      depth: DEPTH,
      clarifications: CLARIFICATIONS,
      lessons: LESSONS,
      userId: "user-1",
      progress: 1,
      hasActivityToday: false,
    });
    loadLearningProfile.mockResolvedValueOnce({
      seq: "broad",
      anchor: "data",
      length: "long",
      rigor: "edges",
      jargon: "skip",
    });
    lookup.mockResolvedValueOnce(null);
    vi.mocked(chatCompletion).mockResolvedValueOnce(
      completion(sampleLessonJson()),
    );

    await getLessonBody(
      { courseId: "c1", lessonIndex: 0, sessionId: "sess" },
      baseDeps,
    );

    expect(loadLearningProfile).toHaveBeenCalledWith({ userId: "user-1" });
    const call = vi.mocked(chatCompletion).mock.calls[0]?.[0];
    const userMessage = call?.messages.find((m) => m.role === "user")?.content;
    expect(userMessage).toContain("broad picture");
    expect(userMessage).toContain("~10 minute");

    const expectedKey = buildFingerprint({
      topicNormalized: normalizeTopic(TOPIC),
      depth: DEPTH,
      clarifications: clarificationsToMap(CLARIFICATIONS),
      cacheType: "lesson_body",
      lessonIndex: 0,
      difficultyModifier: "baseline",
      learningProfile: {
        seq: "broad",
        anchor: "data",
        length: "long",
        rigor: "edges",
        jargon: "skip",
      },
    });
    expect(lookup).toHaveBeenCalledWith(expectedKey);
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
    expect(lookup).toHaveBeenCalledWith(
      fingerprintFor(1, "easier", {
        seq: DEFAULT_LEARNING_PROFILE.seq,
        anchor: DEFAULT_LEARNING_PROFILE.anchor,
        length: DEFAULT_LEARNING_PROFILE.length,
        rigor: DEFAULT_LEARNING_PROFILE.rigor,
        jargon: DEFAULT_LEARNING_PROFILE.jargon,
      }),
    );
  });

  it("uses baseline for guests on lesson index > 0 when no feel stored", async () => {
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

  it("locks a member lesson ahead of progress", async () => {
    loadCourse.mockResolvedValueOnce({
      kind: "member",
      topic: TOPIC,
      depth: DEPTH,
      clarifications: CLARIFICATIONS,
      lessons: LESSONS,
      userId: "user-1",
      progress: 0,
      hasActivityToday: false,
    });

    const result = await getLessonBody(
      { courseId: "c1", lessonIndex: 1, sessionId: "sess" },
      baseDeps,
    );

    expect(result).toEqual({
      ok: false,
      code: "locked",
      message: "This lesson unlocks tomorrow",
    });
    expect(lookup).not.toHaveBeenCalled();
  });

  it("locks the next lesson once activity already happened today", async () => {
    loadCourse.mockResolvedValueOnce({
      kind: "member",
      topic: TOPIC,
      depth: DEPTH,
      clarifications: CLARIFICATIONS,
      lessons: LESSONS,
      userId: "user-1",
      progress: 1,
      hasActivityToday: true,
    });

    const result = await getLessonBody(
      { courseId: "c1", lessonIndex: 1, sessionId: "sess" },
      baseDeps,
    );

    expect(result).toEqual({
      ok: false,
      code: "locked",
      message: "This lesson unlocks tomorrow",
    });
  });

  it("allows re-reading a completed member lesson even with activity today", async () => {
    loadCourse.mockResolvedValueOnce({
      kind: "member",
      topic: TOPIC,
      depth: DEPTH,
      clarifications: CLARIFICATIONS,
      lessons: LESSONS,
      userId: "user-1",
      progress: 1,
      hasActivityToday: true,
    });
    lookup.mockResolvedValueOnce({
      payload: { body: ["Re-read body."] },
      sources: [],
    });

    const result = await getLessonBody(
      { courseId: "c1", lessonIndex: 0, sessionId: "sess" },
      baseDeps,
    );

    expect(result.ok).toBe(true);
  });

  it("allows the current due lesson when no activity has happened today", async () => {
    loadCourse.mockResolvedValueOnce({
      kind: "member",
      topic: TOPIC,
      depth: DEPTH,
      clarifications: CLARIFICATIONS,
      lessons: LESSONS,
      userId: "user-1",
      progress: 1,
      hasActivityToday: false,
    });
    lookup.mockResolvedValueOnce({
      payload: { body: ["Due lesson body."] },
      sources: [],
    });

    const result = await getLessonBody(
      { courseId: "c1", lessonIndex: 1, sessionId: "sess" },
      baseDeps,
    );

    expect(result.ok).toBe(true);
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
