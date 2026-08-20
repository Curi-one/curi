import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ChatCompletionResult } from "@/lib/ai/perplexity";
import { buildFingerprint } from "@/lib/cache/fingerprint";
import {
  clarificationsToMap,
  normalizeTopic,
} from "@/lib/courses/outline";
import { getQuiz, submitQuiz } from "@/lib/lessons/quiz";

vi.mock("@/lib/ai/perplexity", () => ({
  quizModel: () => "sonar",
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

const QUIZ_JSON = JSON.stringify({
  questions: [
    {
      id: "q1",
      prompt: "What is a term sheet?",
      options: ["A", "B", "C", "D"],
      correctIndex: 1,
      explanation: "B is right because…",
    },
    {
      id: "q2",
      prompt: "Who signs first?",
      options: ["A", "B", "C"],
      correctIndex: 0,
      explanation: "A is conventional.",
    },
    {
      id: "q3",
      prompt: "What is valuation?",
      options: ["A", "B", "C", "D"],
      correctIndex: 2,
      explanation: "C describes valuation.",
    },
  ],
});

function completion(content: string): ChatCompletionResult {
  return { content, sources: [] };
}

function quizFingerprint(lessonIndex: number): string {
  return buildFingerprint({
    topicNormalized: normalizeTopic(TOPIC),
    depth: DEPTH,
    clarifications: clarificationsToMap(CLARIFICATIONS),
    cacheType: "quiz",
    lessonIndex,
    difficultyModifier: "baseline",
  });
}

const CACHED_QUESTIONS = [
  {
    id: "q1",
    prompt: "Cached Q1",
    options: ["A", "B"],
    correctIndex: 0,
    explanation: "Because A.",
  },
  {
    id: "q2",
    prompt: "Cached Q2",
    options: ["A", "B", "C"],
    correctIndex: 1,
    explanation: "Because B.",
  },
  {
    id: "q3",
    prompt: "Cached Q3",
    options: ["A", "B"],
    correctIndex: 1,
    explanation: "Because B again.",
  },
];

describe("getQuiz", () => {
  const lookup = vi.fn();
  const store = vi.fn();
  const loadCourse = vi.fn();
  const upsertQuizQuestions = vi.fn();
  const loadBodySummary = vi.fn();

  beforeEach(() => {
    vi.mocked(chatCompletion).mockReset();
    lookup.mockReset();
    store.mockReset().mockResolvedValue(undefined);
    loadCourse.mockReset();
    upsertQuizQuestions.mockReset().mockResolvedValue(undefined);
    loadBodySummary.mockReset().mockResolvedValue("Body summary");
  });

  it("returns cached quiz on hit and skips Perplexity", async () => {
    loadCourse.mockResolvedValueOnce({
      kind: "pending",
      topic: TOPIC,
      depth: DEPTH,
      clarifications: CLARIFICATIONS,
      lessons: LESSONS,
    });
    lookup.mockResolvedValueOnce({
      payload: { questions: CACHED_QUESTIONS },
      sources: [],
    });

    const result = await getQuiz(
      { courseId: "c1", lessonIndex: 0, sessionId: "anon-1" },
      {
        lookup,
        store,
        loadCourse,
        upsertQuizQuestions,
        loadBodySummary,
        complete: chatCompletion,
      },
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.questions).toHaveLength(3);
    expect(result.data.questions[0]).toMatchObject({
      id: "q1",
      correctIndex: 0,
      explanation: "Because A.",
    });
    expect(lookup).toHaveBeenCalledWith(quizFingerprint(0));
    expect(chatCompletion).not.toHaveBeenCalled();
    expect(store).not.toHaveBeenCalled();
  });

  it("generates and stores quiz on cache miss", async () => {
    loadCourse.mockResolvedValueOnce({
      kind: "member",
      topic: TOPIC,
      depth: DEPTH,
      clarifications: CLARIFICATIONS,
      lessons: LESSONS,
      userId: "user-1",
    });
    lookup.mockResolvedValueOnce(null);
    vi.mocked(chatCompletion).mockResolvedValueOnce(completion(QUIZ_JSON));

    const result = await getQuiz(
      { courseId: "c1", lessonIndex: 0, sessionId: "sess" },
      {
        lookup,
        store,
        loadCourse,
        upsertQuizQuestions,
        loadBodySummary,
        complete: chatCompletion,
      },
    );

    expect(result.ok).toBe(true);
    expect(chatCompletion).toHaveBeenCalledWith(
      expect.objectContaining({ model: "sonar" }),
    );
    expect(store).toHaveBeenCalledWith(
      expect.objectContaining({
        cacheKey: quizFingerprint(0),
        lessonIndex: 0,
      }),
    );
    expect(upsertQuizQuestions).toHaveBeenCalled();
  });
});

describe("submitQuiz", () => {
  const lookup = vi.fn();
  const loadCourse = vi.fn();
  const persistFeel = vi.fn();
  const bumpProgress = vi.fn();
  const loadActivityDates = vi.fn();
  const countPathsStillDue = vi.fn();

  beforeEach(() => {
    lookup.mockReset();
    loadCourse.mockReset();
    persistFeel.mockReset().mockResolvedValue({ isNew: true });
    bumpProgress.mockReset().mockResolvedValue(undefined);
    loadActivityDates.mockReset().mockResolvedValue(["2026-08-20"]);
    countPathsStillDue.mockReset().mockResolvedValue(1);
  });

  it("requires lessonFeel via caller schema — rejects missing feel at route; scores with feel", async () => {
    loadCourse.mockResolvedValueOnce({
      kind: "pending",
      topic: TOPIC,
      depth: DEPTH,
      clarifications: CLARIFICATIONS,
      lessons: LESSONS,
    });
    lookup.mockResolvedValueOnce({
      payload: { questions: CACHED_QUESTIONS },
      sources: [],
    });

    const result = await submitQuiz(
      {
        courseId: "c1",
        lessonIndex: 0,
        sessionId: "anon-1",
        request: {
          answers: [
            { questionId: "q1", selectedIndex: 0 },
            { questionId: "q2", selectedIndex: 0 },
            { questionId: "q3", selectedIndex: 1 },
          ],
          lessonFeel: "too_hard",
        },
      },
      {
        lookup,
        loadCourse,
        persistFeel,
        bumpProgress,
        loadActivityDates,
        countPathsStillDue,
        today: () => "2026-08-20",
      },
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.complete).toBe(true);
    expect(result.data.feedback[0]).toEqual({
      questionId: "q1",
      correct: true,
      explanation: "Because A.",
      correctIndex: 0,
    });
    expect(result.data.feedback[1].correct).toBe(false);
    expect(persistFeel).toHaveBeenCalledWith(
      expect.objectContaining({
        lessonFeel: "too_hard",
        lessonIndex: 0,
      }),
    );
    expect(bumpProgress).not.toHaveBeenCalled();
  });

  it("bumps progress for new member activity and returns streak", async () => {
    loadCourse.mockResolvedValueOnce({
      kind: "member",
      topic: TOPIC,
      depth: DEPTH,
      clarifications: CLARIFICATIONS,
      lessons: LESSONS,
      userId: "user-1",
    });
    lookup.mockResolvedValueOnce({
      payload: { questions: CACHED_QUESTIONS },
      sources: [],
    });

    const result = await submitQuiz(
      {
        courseId: "c1",
        lessonIndex: 0,
        sessionId: "sess",
        request: {
          answers: [{ questionId: "q1", selectedIndex: 0 }],
          lessonFeel: "just_right",
        },
      },
      {
        lookup,
        loadCourse,
        persistFeel,
        bumpProgress,
        loadActivityDates,
        countPathsStillDue,
        today: () => "2026-08-20",
      },
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(bumpProgress).toHaveBeenCalledWith({
      courseId: "c1",
      lessonIndex: 0,
      totalLessons: 2,
    });
    expect(result.data.streak).toBe(1);
    expect(result.data.pathsStillDue).toBe(1);
  });

  it("is idempotent — duplicate member POST does not bump progress again", async () => {
    persistFeel.mockResolvedValueOnce({ isNew: false });
    loadCourse.mockResolvedValueOnce({
      kind: "member",
      topic: TOPIC,
      depth: DEPTH,
      clarifications: CLARIFICATIONS,
      lessons: LESSONS,
      userId: "user-1",
    });
    lookup.mockResolvedValueOnce({
      payload: { questions: CACHED_QUESTIONS },
      sources: [],
    });

    const result = await submitQuiz(
      {
        courseId: "c1",
        lessonIndex: 0,
        sessionId: "sess",
        request: {
          answers: [],
          lessonFeel: "just_right",
        },
      },
      {
        lookup,
        loadCourse,
        persistFeel,
        bumpProgress,
        loadActivityDates,
        countPathsStillDue,
      },
    );

    expect(result.ok).toBe(true);
    expect(bumpProgress).not.toHaveBeenCalled();
  });
});
