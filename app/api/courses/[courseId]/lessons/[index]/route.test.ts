import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { GET } from "@/app/api/courses/[courseId]/lessons/[index]/route";
import { resetMockStore, SESSION_COOKIE } from "@/lib/mock/store";

const GUEST_SESSION = "lesson-route-guest";

describe("GET /api/courses/:courseId/lessons/:index", () => {
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

  function lessonRequest(
    courseId: string,
    index: string,
    sessionId = GUEST_SESSION,
  ): Request {
    return new Request(
      `http://localhost/api/courses/${courseId}/lessons/${index}`,
      {
        method: "GET",
        headers: {
          Cookie: `${SESSION_COOKIE}=${sessionId}`,
        },
      },
    );
  }

  it("returns mock lesson body when USE_MOCK_API=true", async () => {
    const { POST } = await import("@/app/api/courses/route");
    const createRes = await POST(
      new Request("http://localhost/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `${SESSION_COOKIE}=${GUEST_SESSION}`,
        },
        body: JSON.stringify({
          topic: "Bayesian thinking",
          depth: "essentials",
          clarifications: [{ questionId: "focus", answer: "Curiosity" }],
        }),
      }),
    );
    expect(createRes.status).toBe(200);
    const { courseId } = (await createRes.json()) as { courseId: string };

    const response = await GET(lessonRequest(courseId, "0"), {
      params: Promise.resolve({ courseId, index: "0" }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.title).toEqual(expect.any(String));
    expect(Array.isArray(data.body)).toBe(true);
    expect(data.body.length).toBeGreaterThan(0);
    expect(Array.isArray(data.sources)).toBe(true);
  });

  it("returns 404 for unknown course in mock mode", async () => {
    const response = await GET(lessonRequest("missing-course", "0"), {
      params: Promise.resolve({ courseId: "missing-course", index: "0" }),
    });

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.code).toBe("not_found");
  });

  it("returns 403 locked when reading past the member's progress", async () => {
    const { getMockStore } = await import("@/lib/mock/store");
    const store = getMockStore();
    store.setPersona(GUEST_SESSION, "member");

    const response = await GET(
      lessonRequest("mock-path-1", "1", GUEST_SESSION),
      { params: Promise.resolve({ courseId: "mock-path-1", index: "1" }) },
    );

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.code).toBe("locked");
  });

  it("returns 400 for invalid index", async () => {
    const response = await GET(lessonRequest("any", "nope"), {
      params: Promise.resolve({ courseId: "any", index: "nope" }),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.code).toBe("invalid_index");
  });
});
