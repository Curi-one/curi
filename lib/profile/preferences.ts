import { normalizeLearningProfile } from "@/lib/profile/learning-profile";
import {
  DEFAULT_USER_PREFERENCES,
  type UserPreferences,
} from "@/lib/profile/user-preferences";

export type {
  AnchorStyle,
  JargonHandling,
  LearningProfile,
  LessonLength,
  Rigor,
  SeqOpen,
} from "@/lib/profile/learning-profile";
export {
  DEFAULT_LEARNING_PROFILE,
  learningProfilePromptLines,
  learningProfileStance,
  normalizeLearningProfile,
} from "@/lib/profile/learning-profile";

export type {
  EmailPreferences,
  ProfilePreferences,
  UserPreferences,
} from "@/lib/profile/user-preferences";
export {
  DEFAULT_EMAIL_PREFERENCES,
  DEFAULT_PREFERENCES,
  DEFAULT_USER_PREFERENCES,
} from "@/lib/profile/user-preferences";

function storageKey(userKey: string): string {
  return `curi-prefs:${userKey}`;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergeWithDefaults(raw: unknown): UserPreferences {
  if (!isPlainObject(raw)) return { ...DEFAULT_USER_PREFERENCES };

  const learning = normalizeLearningProfile(raw);
  return {
    ...learning,
    emailEnabled:
      typeof raw.emailEnabled === "boolean"
        ? raw.emailEnabled
        : DEFAULT_USER_PREFERENCES.emailEnabled,
    emailTime:
      typeof raw.emailTime === "string"
        ? raw.emailTime
        : DEFAULT_USER_PREFERENCES.emailTime,
    emailFormat:
      typeof raw.emailFormat === "string"
        ? raw.emailFormat
        : DEFAULT_USER_PREFERENCES.emailFormat,
    emailWeekends:
      typeof raw.emailWeekends === "boolean"
        ? raw.emailWeekends
        : DEFAULT_USER_PREFERENCES.emailWeekends,
    emailWeeklyDigest:
      typeof raw.emailWeeklyDigest === "boolean"
        ? raw.emailWeeklyDigest
        : DEFAULT_USER_PREFERENCES.emailWeeklyDigest,
  };
}

/** Local fallback — prefer GET/PATCH /api/me/preferences for members. */
export function loadPreferences(userKey: string): UserPreferences {
  if (typeof localStorage === "undefined") {
    return { ...DEFAULT_USER_PREFERENCES };
  }
  try {
    const raw = localStorage.getItem(storageKey(userKey));
    if (!raw) return { ...DEFAULT_USER_PREFERENCES };
    return mergeWithDefaults(JSON.parse(raw) as unknown);
  } catch {
    return { ...DEFAULT_USER_PREFERENCES };
  }
}

export function savePreferences(
  userKey: string,
  prefs: UserPreferences,
): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(storageKey(userKey), JSON.stringify(prefs));
}
