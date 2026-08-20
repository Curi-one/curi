import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { GET, POST } from "@/app/api/courses/[courseId]/lessons/[index]/quiz/route";
import { resetMockStore, SESSION_COOKIE } from "@/lib/mock/store";

const GUEST_SESSION = "quiz-route-guest";

describe("GET/POST /api/courses/:courseId/lessons/:index/quiz", () => {
  const previousUseMockApi = process.env.USE_MOCK_API;

  beforeEach(() => {
    process.env.USE_MOCK_API = "true";
    resetMockStore();
  });

  afterEach(() => {
    if (previousUseMockApi === undefined) {
      delete process.env.USE_MOCK_API;
    } else {
      process.env.USE_MOCK_API = previousUseMockApi;
    }
  });

  async function createCourse(): Promise<string> {
    const { POST: createCourse } = await import("@/app/api/courses/route");
    const createRes = await createCourse(
      new Request("http://localhost/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `${SESSION_COOKIE}=${GUEST_SESSION}`,
        },
        body: JSON.stringify({
          topic: "Fermi paradox",
          depth: "essentials",
          clarifications: [{ questionId: "focus", answer: "Curiosity" }],
        }),
      }),
    );
    expect(createRes.status).toBe(200);
    const { courseId } = (await createRes.json()) as { courseId: string };
    return courseId;
  }

  it("GET returns mock quiz with correctIndex when USE_MOCK_API=true", async () => {
    const courseId = await createCourse();
    const response = await GET(
      new Request(`http://localhost/api/courses/${courseId}/lessons/0/quiz`, {
        headers: { Cookie: `${SESSION_COOKIE}=${GUEST_SESSION}` },
      }),
      { params: Promise.resolve({ courseId, index: "0" }) },
    );
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data.questions)).toBe(true);
    expect(data.questions.length).toBeGreaterThan(0);
    expect(data.questions[0]).toMatchObject({
      id: expect.any(String),
      prompt: expect.any(String),
      options: expect.any(Array),
      correctIndex: expect.any(Number),
    });
  });

  it("POST requires lessonFeel", async () => {
    const courseId = await createCourse();
    const response = await POST(
      new Request(`http://localhost/api/courses/${courseId}/lessons/0/quiz`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `${SESSION_COOKIE}=${GUEST_SESSION}`,
        },
        body: JSON.stringify({
          answers: [{ questionId: "x", selectedIndex: 0 }],
        }),
      }),
      { params: Promise.resolve({ courseId, index: "0" }) },
    );
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.code).toBe("invalid_body");
  });

  it("POST with feel returns complete feedback", async () => {
    const courseId = await createCourse();
    const quizRes = await GET(
      new Request(`http://localhost/api/courses/${courseId}/lessons/0/quiz`, {
        headers: { Cookie: `${SESSION_COOKIE}=${GUEST_SESSION}` },
      }),
      { params: Promise.resolve({ courseId, index: "0" }) },
    );
    const quiz = (await quizRes.json()) as {
      questions: { id: string; correctIndex: number }[];
    };

    const response = await POST(
      new Request(`http://localhost/api/courses/${courseId}/lessons/0/quiz`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `${SESSION_COOKIE}=${GUEST_SESSION}`,
        },
        body: JSON.stringify({
          answers: quiz.questions.map((q) => ({
            questionId: q.id,
            selectedIndex: q.correctIndex,
          })),
          lessonFeel: "too_hard",
        }),
      }),
      { params: Promise.resolve({ courseId, index: "0" }) },
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.complete).toBe(true);
    expect(Array.isArray(data.feedback)).toBe(true);
    expect(data.feedback[0]).toMatchObject({
      questionId: expect.any(String),
      correct: true,
      explanation: expect.any(String),
      correctIndex: expect.any(Number),
    });
  });
});
