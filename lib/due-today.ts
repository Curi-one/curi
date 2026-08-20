export type PathTodayState = {
  progress: number;
  totalLessons: number;
  hasActivityToday: boolean;
};

/** Whether an active path should appear in Today's due list. */
export function isPathDueToday(state: PathTodayState): boolean {
  if (state.progress >= state.totalLessons) {
    return false;
  }
  return !state.hasActivityToday;
}
