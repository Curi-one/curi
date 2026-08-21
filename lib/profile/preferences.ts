import {
  DEFAULT_USER_PREFERENCES,
  type UserPreferences,
} from "@/lib/profile/db-preferences";
import { normalizeLearningProfile } from "@/lib/profile/learning-profile";

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
  UserPreferences,
} from "@/lib/profile/db-preferences";
export { DEFAULT_EMAIL_PREFERENCES } from "@/lib/profile/db-preferences";

/** Profile preferences = learning profile + email schedule. */
export type ProfilePreferences = UserPreferences;

export const DEFAULT_PREFERENCES: ProfilePreferences = DEFAULT_USER_PREFERENCES;

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
