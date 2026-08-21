import { describe, expect, it } from "vitest";
import { DETAILS_MAX_CHARS, normalizeDetails } from "@/lib/clarify/details";

describe("normalizeDetails", () => {
  it("exports a 500-character max", () => {
    expect(DETAILS_MAX_CHARS).toBe(500);
  });

  it("trims whitespace", () => {
    expect(normalizeDetails("  hello world  ")).toBe("hello world");
  });

  it("returns empty string for whitespace-only input", () => {
    expect(normalizeDetails("   \n\t  ")).toBe("");
  });

  it("truncates to DETAILS_MAX_CHARS", () => {
    const raw = "x".repeat(DETAILS_MAX_CHARS + 40);
    const normalized = normalizeDetails(raw);
    expect(normalized).toHaveLength(DETAILS_MAX_CHARS);
    expect(normalized).toBe("x".repeat(DETAILS_MAX_CHARS));
  });

  it("preserves content at exactly the max length", () => {
    const raw = "a".repeat(DETAILS_MAX_CHARS);
    expect(normalizeDetails(raw)).toBe(raw);
  });
});
