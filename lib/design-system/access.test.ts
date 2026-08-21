import { describe, expect, it } from "vitest";
import { isDesignSystemEnabled } from "@/lib/design-system/access";

describe("isDesignSystemEnabled", () => {
  it("allows local and staging", () => {
    expect(isDesignSystemEnabled("local")).toBe(true);
    expect(isDesignSystemEnabled("staging")).toBe(true);
  });

  it("blocks production", () => {
    expect(isDesignSystemEnabled("production")).toBe(false);
  });
});
