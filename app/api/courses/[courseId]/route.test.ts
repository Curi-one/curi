import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { PATCH } from "@/app/api/courses/[courseId]/route";

describe("PATCH /api/courses/:id (mock shelve)", () => {
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

  it("shelves an active path for member", async () => {
    const res = await PATCH(
      new Request("http://localhost/api/courses/mock-path-1", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          cookie: "curi_session=member-default",
        },
        body: JSON.stringify({ action: "shelve" }),
      }),
      { params: Promise.resolve({ courseId: "mock-path-1" }) },
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ ok: true, courseId: "mock-path-1" });
  });
});
