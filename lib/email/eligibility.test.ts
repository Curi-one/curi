import { describe, expect, it } from "vitest";
import {
  alreadySentDailyEmail,
  isDeliveryHour,
  isWeekendBlocked,
  shouldSendDailyEmail,
} from "@/lib/email/eligibility";

describe("daily email eligibility", () => {
  const prefs = {
    emailEnabled: true,
    emailTime: "morning",
    emailWeekends: false,
  };

  it("blocks when email is disabled", () => {
    expect(
      shouldSendDailyEmail(
        { ...prefs, emailEnabled: false },
        null,
        "UTC",
        new Date("2026-08-21T08:00:00Z"),
      ),
    ).toBe(false);
  });

  it("blocks weekend delivery when weekends are off", () => {
    // 2026-08-22 is Saturday in UTC
    expect(
      isWeekendBlocked(false, "UTC", new Date("2026-08-22T08:00:00Z")),
    ).toBe(true);
    expect(
      shouldSendDailyEmail(
        prefs,
        null,
        "UTC",
        new Date("2026-08-22T08:00:00Z"),
      ),
    ).toBe(false);
  });

  it("allows delivery on weekday at preferred hour", () => {
    expect(
      isDeliveryHour("morning", "UTC", new Date("2026-08-21T08:00:00Z")),
    ).toBe(true);
    expect(
      shouldSendDailyEmail(
        prefs,
        null,
        "UTC",
        new Date("2026-08-21T08:00:00Z"),
      ),
    ).toBe(true);
  });

  it("skips when already sent today in user timezone", () => {
    expect(
      alreadySentDailyEmail(
        "2026-08-21T07:30:00Z",
        "UTC",
        new Date("2026-08-21T08:00:00Z"),
      ),
    ).toBe(true);
  });
});
