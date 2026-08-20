export type LearningPreferences = {
  goal: string;
  curiosityContext: string;
  lessonDepth: string;
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
  lessonDepth: "Standard",
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

function mergeWithDefaults(raw: unknown): ProfilePreferences {
  if (!isPlainObject(raw)) return { ...DEFAULT_PREFERENCES };

  return {
    goal:
      typeof raw.goal === "string" ? raw.goal : DEFAULT_PREFERENCES.goal,
    curiosityContext:
      typeof raw.curiosityContext === "string"
        ? raw.curiosityContext
        : DEFAULT_PREFERENCES.curiosityContext,
    lessonDepth:
      typeof raw.lessonDepth === "string"
        ? raw.lessonDepth
        : DEFAULT_PREFERENCES.lessonDepth,
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
