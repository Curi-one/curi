import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { PATCH } from "@/app/api/courses/[courseId]/route";
import { getMockStore, resetMockStore } from "@/lib/mock/store";

describe("PATCH /api/courses/:id (mock shelve / restore)", () => {
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

  it("restores a shelved path", async () => {
    const store = getMockStore();
    store.shelvePath("member-default", "mock-path-1");

    const res = await PATCH(
      new Request("http://localhost/api/courses/mock-path-1", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          cookie: "curi_session=member-default",
        },
        body: JSON.stringify({ action: "restore" }),
      }),
      { params: Promise.resolve({ courseId: "mock-path-1" }) },
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ ok: true, courseId: "mock-path-1" });

    const map = store.getCourseMap("member-default", "mock-path-1");
    expect(map.ok).toBe(true);
    if (map.ok) {
      expect(map.data.status).toBe("active");
    }
  });

  it("returns path_limit when free member is at active cap", async () => {
    const store = getMockStore();
    // Default free member has 2 active paths. Shelve one, fill the slot,
    // then restoring would exceed the free cap.
    store.shelvePath("member-default", "mock-path-1");
    const created = store.createCourse("member-default", {
      topic: "Extra active path",
      depth: "essentials",
      clarifications: [],
    });
    expect(created.ok).toBe(true);

    const res = await PATCH(
      new Request("http://localhost/api/courses/mock-path-1", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          cookie: "curi_session=member-default",
        },
        body: JSON.stringify({ action: "restore" }),
      }),
      { params: Promise.resolve({ courseId: "mock-path-1" }) },
    );
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.code).toBe("path_limit");
  });
});
