import { emailTimeToHour } from "@/lib/email/time-slots";
import {
  dayOfWeekInTimezone,
  hourInTimezone,
  todayInTimezone,
} from "@/lib/timezone";

export type DailyEmailPrefs = {
  emailEnabled: boolean;
  emailTime: string;
  emailWeekends: boolean;
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

export function isWeekendBlocked(
  emailWeekends: boolean,
  timezone: string,
  now: Date,
): boolean {
  if (emailWeekends) return false;
  const dow = dayOfWeekInTimezone(timezone, now);
  return dow === 0 || dow === 6;
}

export function isDeliveryHour(
  emailTime: string,
  timezone: string,
  now: Date,
): boolean {
  return hourInTimezone(timezone, now) === emailTimeToHour(emailTime);
}

export function shouldSendDailyEmail(
  prefs: DailyEmailPrefs,
  lastEmailSentAt: string | null | undefined,
  timezone: string,
  now: Date,
): boolean {
  if (!prefs.emailEnabled) return false;
  if (isWeekendBlocked(prefs.emailWeekends, timezone, now)) return false;
  if (alreadySentDailyEmail(lastEmailSentAt, timezone, now)) return false;
  return isDeliveryHour(prefs.emailTime, timezone, now);
}
