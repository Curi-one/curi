import { beforeEach, describe, expect, it } from "vitest";
import { POST } from "@/app/api/courses/route";
import { DEFAULT_MEMBER } from "@/lib/mock/fixtures";
import { resetMockStore, SESSION_COOKIE } from "@/lib/mock/store";

describe("POST /api/courses", () => {
  beforeEach(() => {
    resetMockStore();
  });

  function courseRequest(
    body: unknown,
    sessionId = DEFAULT_MEMBER.sessionId,
  ): Request {
    return new Request("http://localhost/api/courses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `${SESSION_COOKIE}=${sessionId}`,
      },
      body: JSON.stringify(body),
    });
  }

  it("creates a course outline for a valid request", async () => {
    const response = await POST(
      courseRequest({
        topic: "Bayesian thinking",
        depth: "essentials",
        clarifications: [{ questionId: "focus", answer: "Curiosity" }],
      }, "new-guest"),
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.courseId).toBeTruthy();
    expect(data.outline.length).toBeGreaterThanOrEqual(5);
    expect(data.outline.length).toBeLessThanOrEqual(9);
    expect(data.outline[0]).toMatchObject({ index: 0, title: expect.any(String) });
  });

  it("returns 403 when free member exceeds active path limit", async () => {
    const response = await POST(
      courseRequest({
        topic: "Third path attempt",
        depth: "fluent",
        clarifications: [],
      }),
    );

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.code).toBe("plan_limit");
  });

  it("returns 400 for invalid body", async () => {
    const response = await POST(
      courseRequest({ topic: "", depth: "essentials", clarifications: [] }),
    );

    expect(response.status).toBe(400);
  });
});
