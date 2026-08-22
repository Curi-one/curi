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

  it("returns deduped category lists for browse filter chips", async () => {
    const res = await GET();
    const body = await res.json();
    expect(body.pathCategories.length).toBeGreaterThanOrEqual(2);
    expect(body.bookCategories.length).toBeGreaterThanOrEqual(2);
    expect(
      body.paths.every((p: { category?: string }) => Boolean(p.category)),
    ).toBe(true);
    expect(
      body.books.every((b: { category?: string }) => Boolean(b.category)),
    ).toBe(true);
  });

  it("returns category taxonomy with subcategories", async () => {
    const res = await GET();
    const body = await res.json();
    expect(body.pathTaxonomy.length).toBeGreaterThanOrEqual(2);
    expect(body.bookTaxonomy.length).toBeGreaterThanOrEqual(2);
    expect(body.pathTaxonomy[0]?.subcategories.length).toBeGreaterThan(0);
  });
});
