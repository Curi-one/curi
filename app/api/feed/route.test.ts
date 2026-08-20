import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { GET } from "@/app/api/feed/route";

describe("GET /api/feed (mock)", () => {
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

  it("returns empty feed for guest session", async () => {
    const res = await GET(
      new Request("http://localhost/api/feed", {
        headers: { cookie: "curi_session=guest-feed-test" },
      }),
    );
    const body = await res.json();
    expect(body).toEqual({ due: [], done: [], groups: [] });
  });

  it("returns due and done for default member persona", async () => {
    const res = await GET(
      new Request("http://localhost/api/feed", {
        headers: { cookie: "curi_session=member-default" },
      }),
    );
    const body = await res.json();
    expect(body.due.some((p: { id: string }) => p.id === "mock-path-1")).toBe(
      true,
    );
    expect(body.done.some((p: { id: string }) => p.id === "mock-path-2")).toBe(
      true,
    );
  });
});
