import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildSignedEmailOpenUrl,
  lessonPagePath,
  parseSignedEmailOpenUrl,
} from "@/lib/email/signed-open-link";

describe("signed email open links", () => {
  beforeEach(() => {
    process.env.APP_ENV = "staging";
    process.env.CRON_SECRET = "test-secret";
  });

  it("builds a signed open URL for a lesson path", () => {
    const now = new Date("2026-08-21T12:00:00Z");
    const url = buildSignedEmailOpenUrl(
      "learner@example.com",
      lessonPagePath("course-1", 2),
      now,
    );
    expect(url).toContain("https://stage.curi.one/api/email/open?");
    expect(url).toContain("p=");
    expect(url).toContain("s=");
  });

  it("round-trips payload verification", () => {
    const now = new Date("2026-08-21T12:00:00Z");
    const returnTo = lessonPagePath("course-1", 2);
    const url = new URL(
      buildSignedEmailOpenUrl("learner@example.com", returnTo, now),
    );
    const parsed = parseSignedEmailOpenUrl(
      url.searchParams.get("p"),
      url.searchParams.get("s"),
      now,
    );
    expect(parsed).toEqual({
      email: "learner@example.com",
      to: returnTo,
      exp: Math.floor(now.getTime() / 1000) + 72 * 60 * 60,
    });
  });

  it("rejects tampered signatures", () => {
    const now = new Date("2026-08-21T12:00:00Z");
    const url = new URL(
      buildSignedEmailOpenUrl("learner@example.com", "/today", now),
    );
    expect(
      parseSignedEmailOpenUrl(
        url.searchParams.get("p"),
        "deadbeef",
        now,
      ),
    ).toBeNull();
  });

  it("falls back to direct lesson URL when no signing secret", () => {
    delete process.env.CRON_SECRET;
    process.env.SUPABASE_SERVICE_ROLE_KEY = "";
    const path = lessonPagePath("course-1", 0);
    expect(buildSignedEmailOpenUrl("learner@example.com", path)).toBe(
      `https://stage.curi.one${path}`,
    );
  });
});
