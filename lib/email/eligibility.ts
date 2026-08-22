import { FIXED_EMAIL_DELIVERY_HOUR } from "@/lib/email/time-slots";
import {
  dayOfWeekInTimezone,
  hourInTimezone,
  todayInTimezone,
} from "@/lib/timezone";

export type DailyEmailPrefs = {
  emailEnabled: boolean;
  /** Ignored — delivery is always 7 AM local. Kept for call-site compatibility. */
  emailTime?: string;
  /** Ignored — weekends always allowed. Kept for call-site compatibility. */
  emailWeekends?: boolean;
};

export function alreadySentDailyEmail(
  lastEmailSentAt: string | null | undefined,
  timezone: string,
  now: Date,
): boolean {
  if (!lastEmailSentAt) return false;
  const sentDay = todayInTimezone(timezone, new Date(lastEmailSentAt));
  const today = todayInTimezone(timezone, now);
  return sentDay === today;
}

/** @deprecated Weekends are always allowed; kept for older tests/callers. */
export function isWeekendBlocked(
  emailWeekends: boolean,
  timezone: string,
  now: Date,
): boolean {
  if (emailWeekends) return false;
  const dow = dayOfWeekInTimezone(timezone, now);
  return dow === 0 || dow === 6;
}

export function isDeliveryHour(timezone: string, now: Date): boolean {
  return hourInTimezone(timezone, now) === FIXED_EMAIL_DELIVERY_HOUR;
}

/**
 * Send when enabled, not already sent today, and local hour is 7.
 * Ignores legacy email_time / email_weekends prefs.
 */
export function shouldSendDailyEmail(
  prefs: DailyEmailPrefs,
  lastEmailSentAt: string | null | undefined,
  timezone: string,
  now: Date,
): boolean {
  if (!prefs.emailEnabled) return false;
  if (alreadySentDailyEmail(lastEmailSentAt, timezone, now)) return false;
  return isDeliveryHour(timezone, now);
}
