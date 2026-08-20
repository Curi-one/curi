export function startOfLocalDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function addLocalDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/** YYYY-MM-DD in local time */
export function localDateKey(d = new Date()) {
  const x = startOfLocalDay(d);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, "0");
  const day = String(x.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Synthetic history for demo: streak days + scattered extras up to lessonsCompleted */
export function buildLessonActivitySeed(streak, lessonsCompleted) {
  const map = {};
  const end = startOfLocalDay(new Date());
  const safeStreak = Math.max(0, Math.min(streak, 370, lessonsCompleted || streak));
  for (let s = 0; s < safeStreak; s++) {
    const k = localDateKey(addLocalDays(end, -s));
    map[k] = 1;
  }
  let remaining = Math.max(0, lessonsCompleted - safeStreak);
  for (let r = 0; r < remaining; r++) {
    const off = safeStreak + 1 + Math.floor((r * 397) % 320);
    const k = localDateKey(addLocalDays(end, -off));
    map[k] = (map[k] || 0) + 1;
  }
  return map;
}

/**
 * Count total lessons completed.
 * @param {Array} courses - active courses array
 * @param {Array} completedCourses - completed courses array
 */
export function totalLessonsCompletedTally(courses, completedCourses = []) {
  const activeSum = courses.reduce((t, c) => t + (c.progress || 0), 0);
  return activeSum + completedCourses.length * 14;
}

export function lessonContributionLevel(count) {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count <= 4) return 3;
  return 4;
}

export const CONTRIBUTION_WEEKS = 26;
export const CONTRIBUTION_ROWS = 7;
