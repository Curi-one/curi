import { describe, expect, it } from "vitest";
import {
  alreadySentDailyEmail,
  isDeliveryHour,
  shouldSendDailyEmail,
} from "@/lib/email/eligibility";

describe("daily email eligibility", () => {
  const prefs = {
    emailEnabled: true,
  };

  it("blocks when email is disabled", () => {
    expect(
      shouldSendDailyEmail(
        { emailEnabled: false },
        null,
        "UTC",
        new Date("2026-08-21T07:00:00Z"),
      ),
    ).toBe(false);
  });

  it("allows weekend delivery at 7 AM (weekends always on)", () => {
    // 2026-08-22 is Saturday in UTC
    expect(
      shouldSendDailyEmail(
        prefs,
        null,
        "UTC",
        new Date("2026-08-22T07:00:00Z"),
      ),
    ).toBe(true);
  });

  it("allows delivery at fixed 7 AM hour regardless of legacy emailTime", () => {
    expect(isDeliveryHour("UTC", new Date("2026-08-21T07:00:00Z"))).toBe(true);
    expect(isDeliveryHour("UTC", new Date("2026-08-21T08:00:00Z"))).toBe(false);
    expect(
      shouldSendDailyEmail(
        { ...prefs, emailTime: "evening", emailWeekends: false },
        null,
        "UTC",
        new Date("2026-08-21T07:00:00Z"),
      ),
    ).toBe(true);
    expect(
      shouldSendDailyEmail(
        prefs,
        null,
        "UTC",
        new Date("2026-08-21T08:00:00Z"),
      ),
    ).toBe(false);
  });

  it("skips when already sent today in user timezone", () => {
    expect(
      alreadySentDailyEmail(
        "2026-08-21T06:30:00Z",
        "UTC",
        new Date("2026-08-21T07:00:00Z"),
      ),
    ).toBe(true);
  });
});
