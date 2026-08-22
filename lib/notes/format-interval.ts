/** Human-readable interval for review rating buttons. */
export function formatReviewDays(days: number): string {
  if (days <= 0) return "now";
  if (days === 1) return "1d";
  return `${days}d`;
}
