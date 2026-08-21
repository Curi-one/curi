import { describe, expect, it } from "vitest";
import { memberSignInPath } from "@/lib/auth/member-gate";

describe("memberSignInPath", () => {
  it("points at sign-in with returnTo Today by default", () => {
    expect(memberSignInPath()).toBe(
      "/auth?intent=signin&returnTo=%2Ftoday",
    );
  });

  it("encodes a custom return path", () => {
    expect(memberSignInPath("/library")).toBe(
      "/auth?intent=signin&returnTo=%2Flibrary",
    );
  });

  it("falls back to /today for unsafe returnTo values", () => {
    expect(memberSignInPath("https://evil.example")).toBe(
      "/auth?intent=signin&returnTo=%2Ftoday",
    );
  });
});
