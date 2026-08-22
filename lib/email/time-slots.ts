/**
 * Daily lesson email delivery is fixed at 7:00 AM in the learner's timezone.
 * Legacy `email_time` chip values are ignored by the send path (DB columns kept
 * for back-compat).
 */
export const FIXED_EMAIL_DELIVERY_HOUR = 7;

/** @deprecated Prefer FIXED_EMAIL_DELIVERY_HOUR — send path ignores per-user chips. */
export const DEFAULT_EMAIL_DELIVERY_HOUR = FIXED_EMAIL_DELIVERY_HOUR;

/** @deprecated Profile no longer edits delivery time; kept for old stored values. */
export const EMAIL_TIME_HOURS: Record<string, number> = {
  "early-morning": 6,
  morning: 8,
  midday: 12,
  afternoon: 15,
  evening: 18,
  night: 21,
};

/** Always returns the fixed 7 AM hour; chip labels are ignored. */
export function emailTimeToHour(_emailTime?: string): number {
  return FIXED_EMAIL_DELIVERY_HOUR;
}
