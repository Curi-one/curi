import { describe, expect, it } from "vitest";
import {
  isGuestAllowedPath,
  isMemberOnlyPath,
  isUngatedPath,
  memberSignInPath,
} from "@/lib/auth/member-gate";

describe("memberSignInPath", () => {
  it("points at sign-in with returnTo Today by default", () => {
    expect(memberSignInPath()).toBe("/auth?intent=signin&returnTo=%2Ftoday");
  });

  it("encodes a custom return path", () => {
    expect(memberSignInPath("/library")).toBe(
      "/auth?intent=signin&returnTo=%2Flibrary",
    );
  });

  it("preserves the query string of the requested page", () => {
    expect(memberSignInPath("/library?tab=shelved")).toBe(
      "/auth?intent=signin&returnTo=%2Flibrary%3Ftab%3Dshelved",
    );
  });

  it("falls back to /today for unsafe returnTo values", () => {
    expect(memberSignInPath("https://evil.example")).toBe(
      "/auth?intent=signin&returnTo=%2Ftoday",
    );
  });
});

describe("route access policy", () => {
  it.each([
    "/",
    "/auth",
    "/clarify",
    "/generating",
    "/explore",
    "/courses/abc/lessons/0",
    "/courses/abc/lessons/0/quiz",
    "/auth/callback",
  ])("allows guests on %s", (path) => {
    expect(isGuestAllowedPath(path)).toBe(true);
    expect(isMemberOnlyPath(path)).toBe(false);
  });

  it.each([
    "/today",
    "/library",
    "/library/abc",
    "/progress",
    "/profile",
    "/new",
    "/upgrade",
    "/email-preview",
  ])("gates %s behind sign-in", (path) => {
    expect(isMemberOnlyPath(path)).toBe(true);
  });

  it("defaults unknown routes to member-only", () => {
    expect(isMemberOnlyPath("/some-future-page")).toBe(true);
    expect(isMemberOnlyPath("/admin")).toBe(true);
  });

  it("ignores a trailing slash", () => {
    expect(isMemberOnlyPath("/explore/")).toBe(false);
    expect(isMemberOnlyPath("/today/")).toBe(true);
  });

  it("does not let a guest prefix match a member route", () => {
    // "/explore" is allowed; "/exploreadmin" must not inherit that.
    expect(isMemberOnlyPath("/exploreadmin")).toBe(true);
  });

  it("leaves infrastructure paths ungated", () => {
    expect(isUngatedPath("/api/courses")).toBe(true);
    expect(isUngatedPath("/_next/static/chunk.js")).toBe(true);
    expect(isUngatedPath("/today")).toBe(false);
  });
});
