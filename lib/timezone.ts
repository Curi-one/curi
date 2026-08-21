/** ISO calendar date (YYYY-MM-DD) in the user's IANA timezone. */
export function todayInTimezone(timezone: string, now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Local hour (0–23) in the user's IANA timezone. */
export function hourInTimezone(timezone: string, now = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    hour12: false,
  }).formatToParts(now);
  const hour = parts.find((p) => p.type === "hour")?.value ?? "0";
  return Number.parseInt(hour, 10);
}

/** Day of week: 0 = Sunday … 6 = Saturday, in user timezone. */
export function dayOfWeekInTimezone(timezone: string, now = new Date()): number {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
  }).format(now);
  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return map[weekday] ?? 0;
}

export const DEFAULT_TIMEZONE = "Australia/Sydney";
