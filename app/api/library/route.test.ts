import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { GET } from "@/app/api/library/route";

describe("GET /api/library (mock)", () => {
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

  it("returns empty library for guest", async () => {
    const res = await GET(
      new Request("http://localhost/api/library", {
        headers: { cookie: "curi_session=guest-lib-test" },
      }),
    );
    const body = await res.json();
    expect(body).toEqual({ exploring: [], mastered: [], shelved: [] });
  });

  it("returns exploring paths for default member", async () => {
    const res = await GET(
      new Request("http://localhost/api/library", {
        headers: { cookie: "curi_session=member-default" },
      }),
    );
    const body = await res.json();
    expect(body.exploring.length).toBe(2);
  });
});
