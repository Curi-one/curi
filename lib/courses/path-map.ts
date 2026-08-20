export type PathMapNode = {
  index: number;
  title: string;
  status: "read" | "today" | "locked";
};

export type PathMapInput = {
  progress: number;
  status: "active" | "completed" | "shelved";
  lessons: { index: number; title: string }[];
  /**
   * True when the user already completed a lesson on this path today.
   * Per the unlock-tomorrow rule, the current progress index is then
   * `locked` (not `today`) — the next lesson opens tomorrow. progress-1
   * remains `read`, unaffected.
   */
  hasActivityToday?: boolean;
};

/** Path map node states per FLOWS F4 — read · today · locked. */
export function buildPathMapNodes(input: PathMapInput): PathMapNode[] {
  return input.lessons.map((lesson) => {
    let status: PathMapNode["status"] = "locked";
    if (lesson.index < input.progress) {
      status = "read";
    } else if (
      lesson.index === input.progress &&
      input.status === "active" &&
      !input.hasActivityToday
    ) {
      status = "today";
    }
    return {
      index: lesson.index,
      title: lesson.title,
      status,
    };
  });
}

export type LessonAccessInput = {
  index: number;
  progress: number;
  hasActivityToday: boolean;
};

/**
 * Unlock-tomorrow rule (FLOWS F2 / one lesson per path per day):
 * readable indices are all `index < progress` (re-read) or
 * `index === progress` only when no activity happened today yet.
 */
export function isLessonReadable(input: LessonAccessInput): boolean {
  if (input.index < input.progress) {
    return true;
  }
  return input.index === input.progress && !input.hasActivityToday;
}
