import { beforeEach, describe, expect, it } from "vitest";
import {
  buildSignedEmailOpenUrl,
  lessonPagePath,
  parseSignedEmailOpenUrl,
} from "@/lib/email/signed-open-link";

describe("signed email open links", () => {
  beforeEach(() => {
    process.env.APP_ENV = "staging";
    process.env.CRON_SECRET = "test-secret";
    delete process.env.EMAIL_LINK_SECRET;
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
      exp: Math.floor(now.getTime() / 1000) + 24 * 60 * 60,
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

  it("prefers EMAIL_LINK_SECRET over CRON_SECRET", () => {
    const now = new Date("2026-08-21T12:00:00Z");
    const signedWithCron = buildSignedEmailOpenUrl(
      "learner@example.com",
      "/today",
      now,
    );

    process.env.EMAIL_LINK_SECRET = "dedicated-secret";
    const signedWithDedicated = buildSignedEmailOpenUrl(
      "learner@example.com",
      "/today",
      now,
    );

    expect(signedWithDedicated).not.toBe(signedWithCron);

    // A link signed with the old key must not verify under the new one.
    const stale = new URL(signedWithCron);
    expect(
      parseSignedEmailOpenUrl(
        stale.searchParams.get("p"),
        stale.searchParams.get("s"),
        now,
      ),
    ).toBeNull();
  });

  it("never falls back to the service-role key for signing", () => {
    delete process.env.CRON_SECRET;
    delete process.env.EMAIL_LINK_SECRET;
    process.env.SUPABASE_SERVICE_ROLE_KEY = "super-secret-service-role-key";
    const path = lessonPagePath("course-1", 0);
    // No signing key configured → plain URL, not one signed with the
    // highest-privilege secret in the system.
    expect(buildSignedEmailOpenUrl("learner@example.com", path)).toBe(
      `https://stage.curi.one${path}`,
    );
  });

  it("rejects an expired link", () => {
    const now = new Date("2026-08-21T12:00:00Z");
    const url = new URL(
      buildSignedEmailOpenUrl("learner@example.com", "/today", now),
    );
    const later = new Date(now.getTime() + 25 * 60 * 60 * 1000);
    expect(
      parseSignedEmailOpenUrl(
        url.searchParams.get("p"),
        url.searchParams.get("s"),
        later,
      ),
    ).toBeNull();
  });
});
