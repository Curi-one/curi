import { describe, expect, it } from "vitest";
import { resolveUseMockApi } from "@/lib/env";

describe("resolveUseMockApi", () => {
  it("defaults to on only for local when unset", () => {
    expect(resolveUseMockApi("local", undefined)).toBe(true);
    expect(resolveUseMockApi("staging", undefined)).toBe(false);
    expect(resolveUseMockApi("production", undefined)).toBe(false);
  });

  it("honours an explicit value outside production", () => {
    expect(resolveUseMockApi("staging", "true")).toBe(true);
    expect(resolveUseMockApi("staging", "false")).toBe(false);
    expect(resolveUseMockApi("local", "false")).toBe(false);
  });

  it("never enables the mock store in production", () => {
    // Mock mode has no real authentication — a stray env var must not be
    // able to switch it on for real users.
    expect(resolveUseMockApi("production", "true")).toBe(false);
  });
});
