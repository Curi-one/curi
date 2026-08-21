/** Profile email-time chip → local delivery hour (24h). */
export const EMAIL_TIME_HOURS: Record<string, number> = {
  "early-morning": 6,
  morning: 8,
  midday: 12,
  afternoon: 15,
  evening: 18,
  night: 21,
};

export const DEFAULT_EMAIL_DELIVERY_HOUR = 8;

export function emailTimeToHour(emailTime: string): number {
  return EMAIL_TIME_HOURS[emailTime] ?? DEFAULT_EMAIL_DELIVERY_HOUR;
}
