import { describe, expect, it } from "vitest";
import { buildFingerprint } from "@/lib/cache/fingerprint";

describe("buildFingerprint", () => {
  it("returns the same hex hash for identical clarify answers", () => {
    const input = {
      topicNormalized: "term sheets",
      depth: "essentials",
      clarifications: { goal: "Investor", stage: "Seed" },
      cacheType: "path_outline" as const,
    };
    expect(buildFingerprint(input)).toBe(buildFingerprint(input));
    expect(buildFingerprint(input)).toMatch(/^[a-f0-9]{64}$/);
  });
});
