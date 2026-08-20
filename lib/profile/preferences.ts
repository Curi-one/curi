export type LessonLength = "Short" | "Medium" | "Long";

export type LearningPreferences = {
  goal: string;
  curiosityContext: string;
  lessonDepth: LessonLength;
  learningStyle: string;
};

export type EmailPreferences = {
  emailEnabled: boolean;
  emailTime: string;
  emailFormat: string;
  emailWeekends: boolean;
  emailWeeklyDigest: boolean;
};

export type ProfilePreferences = LearningPreferences & EmailPreferences;

/** Opt-in email defaults; learning chips match prototype sensible starters. */
export const DEFAULT_PREFERENCES: ProfilePreferences = {
  goal: "",
  curiosityContext: "For work or a project",
  lessonDepth: "Medium",
  learningStyle: "With real examples",
  emailEnabled: false,
  emailTime: "morning",
  emailFormat: "Full",
  emailWeekends: false,
  emailWeeklyDigest: false,
};

function storageKey(userKey: string): string {
  return `curi-prefs:${userKey}`;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const LESSON_LENGTH_VALUES: LessonLength[] = ["Short", "Medium", "Long"];

/** Legacy Quick/Standard/Deep labels migrate to Short/Medium/Long. */
const LEGACY_LESSON_DEPTH_MIGRATIONS: Record<string, LessonLength> = {
  Quick: "Short",
  Standard: "Medium",
  Deep: "Long",
};

function normalizeLessonDepth(value: unknown): LessonLength {
  if (typeof value !== "string") {
    return DEFAULT_PREFERENCES.lessonDepth;
  }
  const migrated = LEGACY_LESSON_DEPTH_MIGRATIONS[value];
  if (migrated) return migrated;
  if (LESSON_LENGTH_VALUES.includes(value as LessonLength)) {
    return value as LessonLength;
  }
  return DEFAULT_PREFERENCES.lessonDepth;
}

function mergeWithDefaults(raw: unknown): ProfilePreferences {
  if (!isPlainObject(raw)) return { ...DEFAULT_PREFERENCES };

  return {
    goal:
      typeof raw.goal === "string" ? raw.goal : DEFAULT_PREFERENCES.goal,
    curiosityContext:
      typeof raw.curiosityContext === "string"
        ? raw.curiosityContext
        : DEFAULT_PREFERENCES.curiosityContext,
    lessonDepth: normalizeLessonDepth(raw.lessonDepth),
    learningStyle:
      typeof raw.learningStyle === "string"
        ? raw.learningStyle
        : DEFAULT_PREFERENCES.learningStyle,
    emailEnabled:
      typeof raw.emailEnabled === "boolean"
        ? raw.emailEnabled
        : DEFAULT_PREFERENCES.emailEnabled,
    emailTime:
      typeof raw.emailTime === "string"
        ? raw.emailTime
        : DEFAULT_PREFERENCES.emailTime,
    emailFormat:
      typeof raw.emailFormat === "string"
        ? raw.emailFormat
        : DEFAULT_PREFERENCES.emailFormat,
    emailWeekends:
      typeof raw.emailWeekends === "boolean"
        ? raw.emailWeekends
        : DEFAULT_PREFERENCES.emailWeekends,
    emailWeeklyDigest:
      typeof raw.emailWeeklyDigest === "boolean"
        ? raw.emailWeeklyDigest
        : DEFAULT_PREFERENCES.emailWeeklyDigest,
  };
}

export function loadPreferences(userKey: string): ProfilePreferences {
  if (typeof localStorage === "undefined") {
    return { ...DEFAULT_PREFERENCES };
  }
  try {
    const raw = localStorage.getItem(storageKey(userKey));
    if (!raw) return { ...DEFAULT_PREFERENCES };
    return mergeWithDefaults(JSON.parse(raw) as unknown);
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

export function savePreferences(
  userKey: string,
  prefs: ProfilePreferences,
): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(storageKey(userKey), JSON.stringify(prefs));
}
