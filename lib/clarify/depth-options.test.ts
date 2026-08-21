import { describe, expect, it } from "vitest";
import { fallbackDepthOptions } from "@/lib/clarify/depth-options";
import { DEPTH_OPTIONS } from "@/lib/ui/constants";

describe("fallbackDepthOptions", () => {
  it("returns default DEPTH_OPTIONS for conceptual topics", () => {
    expect(fallbackDepthOptions("term sheets")).toEqual(DEPTH_OPTIONS);
    expect(fallbackDepthOptions("Bayesian thinking")).toEqual(DEPTH_OPTIONS);
  });

  it("uses realistic language labels for Mandarin (not Fluent)", () => {
    const options = fallbackDepthOptions("Mandarin");
    expect(options).toHaveLength(3);
    expect(options.map((o) => o.slug)).toEqual([
      "essentials",
      "fluent",
      "thorough",
    ]);
    const fluent = options.find((o) => o.slug === "fluent");
    expect(fluent?.label).toBe("Conversational basics");
    expect(fluent?.label).not.toMatch(/fluent/i);
    expect(options[0]?.label).toMatch(/survival/i);
  });

  it("uses realistic language labels for Spanish", () => {
    const options = fallbackDepthOptions("Spanish");
    const fluent = options.find((o) => o.slug === "fluent");
    expect(fluent?.label).toBe("Conversational basics");
    expect(fluent?.label).not.toBe("Fluent");
  });

  it("detects learn-X language patterns", () => {
    const options = fallbackDepthOptions("Learn Japanese");
    expect(options.find((o) => o.slug === "fluent")?.label).toBe(
      "Conversational basics",
    );
  });
});
