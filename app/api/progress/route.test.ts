import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { GET } from "@/app/api/progress/route";

describe("GET /api/progress (mock)", () => {
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

  it("returns streak data for default member", async () => {
    const res = await GET(
      new Request("http://localhost/api/progress", {
        headers: { cookie: "curi_session=member-default" },
      }),
    );
    const body = await res.json();
    expect(body.streak).toBeGreaterThan(0);
    expect(Array.isArray(body.heatmap)).toBe(true);
    expect(body.activePaths).toBe(2);
  });
});
