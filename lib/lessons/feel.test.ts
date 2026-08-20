import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildFingerprint } from "@/lib/cache/fingerprint";
import {
  clarificationsToMap,
  normalizeTopic,
} from "@/lib/courses/outline";
import {
  getLessonBody,
  modifierFromFeel,
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

describe("modifierFromFeel", () => {
  it("aliases feel → next-lesson difficulty modifier", () => {
    expect(modifierFromFeel("too_hard")).toBe("easier");
    expect(modifierFromFeel("too_easy")).toBe("deeper");
  });
});

describe("too_hard on L1 → L2 uses easier fingerprint", () => {
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

  it("member: prior too_hard maps L2 lookup to easier", async () => {
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
      payload: { body: ["Easier L2."] },
      sources: [],
    });

    await getLessonBody(
      { courseId: "c1", lessonIndex: 1, sessionId: "sess" },
      baseDeps,
    );

    expect(lookup).toHaveBeenCalledWith(fingerprintFor(1, "easier"));
  });

  it("guest: lesson_feels too_hard on L1 → L2 lookup uses easier", async () => {
    loadCourse.mockResolvedValueOnce({
      kind: "pending",
      topic: TOPIC,
      depth: DEPTH,
      clarifications: CLARIFICATIONS,
      lessons: LESSONS,
      lessonFeels: { 0: "too_hard" },
    });
    lookup.mockResolvedValueOnce({
      payload: { body: ["Guest easier L2."] },
      sources: [],
    });

    await getLessonBody(
      { courseId: "c1", lessonIndex: 1, sessionId: "anon-1" },
      baseDeps,
    );

    expect(loadPriorFeel).not.toHaveBeenCalled();
    expect(lookup).toHaveBeenCalledWith(fingerprintFor(1, "easier"));
  });
});
