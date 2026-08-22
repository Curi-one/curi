import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { GET } from "./route";
import { getMockStore } from "@/lib/mock/store";

describe("GET /api/courses/[courseId]/certificate", () => {
  const previousUseMockApi = process.env.USE_MOCK_API;

  beforeEach(() => {
    process.env.USE_MOCK_API = "true";
  });

  afterEach(() => {
    if (previousUseMockApi === undefined) {
      delete process.env.USE_MOCK_API;
    } else {
      process.env.USE_MOCK_API = previousUseMockApi;
    }
  });
  it("returns certificate for a mastered path", async () => {
    const store = getMockStore();
    store.reset();
    const sessionId = "member-default";
    store.setPersona(sessionId, "member");

    const lib = store.getLibrary(sessionId);
    const mastered = lib.mastered.find((p) => p.id === "mock-path-mastered");
    expect(mastered).toBeDefined();

    const req = new Request(
      `http://localhost/api/courses/${mastered!.id}/certificate`,
      {
        headers: { cookie: `curi_session=${sessionId}` },
      },
    );

    const res = await GET(req, {
      params: Promise.resolve({ courseId: mastered!.id }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.certificate.topic).toBe(mastered!.topic);
    expect(body.certificate.certificateId).toMatch(/^CUR-/);
  });

  it("returns 403 when the path is not mastered", async () => {
    const store = getMockStore();
    store.reset();
    const sessionId = "member-default";
    store.setPersona(sessionId, "member");
    const exploring = store
      .getLibrary(sessionId)
      .exploring.find((p) => p.id === "mock-path-1");
    expect(exploring).toBeDefined();

    const req = new Request(
      `http://localhost/api/courses/${exploring!.id}/certificate`,
      {
        headers: { cookie: `curi_session=${sessionId}` },
      },
    );

    const res = await GET(req, {
      params: Promise.resolve({ courseId: exploring!.id }),
    });
    expect(res.status).toBe(403);
  });
});
