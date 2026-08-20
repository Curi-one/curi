/** ISO calendar date (YYYY-MM-DD) in the user's IANA timezone. */
export function todayInTimezone(timezone: string, now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export const DEFAULT_TIMEZONE = "Australia/Sydney";
