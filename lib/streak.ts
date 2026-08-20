function parseDate(isoDate: string): Date {
  return new Date(`${isoDate}T12:00:00`);
}

function dayDiff(later: string, earlier: string): number {
  const ms = parseDate(later).getTime() - parseDate(earlier).getTime();
  return Math.round(ms / (24 * 60 * 60 * 1000));
}

/** Consecutive calendar days with activity, ending on the most recent activity day. */
export function computeStreak(activityDates: string[]): number {
  if (activityDates.length === 0) {
    return 0;
  }
  const uniqueDays = [...new Set(activityDates)].sort();
  let streak = 1;
  for (let i = uniqueDays.length - 2; i >= 0; i--) {
    if (dayDiff(uniqueDays[i + 1], uniqueDays[i]) === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

/** Whether completing a lesson today should increment the streak counter. */
export function shouldIncrementStreak(
  activityDates: string[],
  today: string,
): boolean {
  return !activityDates.includes(today);
}
