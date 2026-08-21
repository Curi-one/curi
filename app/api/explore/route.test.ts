import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { GET } from "@/app/api/explore/route";

describe("GET /api/explore", () => {
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

  it("returns catalogue paths and books", async () => {
    const res = await GET();
    const body = await res.json();
    expect(body.paths.length).toBeGreaterThan(0);
    expect(body.books.length).toBeGreaterThan(0);
  });
});
