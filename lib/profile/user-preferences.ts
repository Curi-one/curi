import {
  DEFAULT_LEARNING_PROFILE,
  type LearningProfile,
} from "@/lib/profile/learning-profile";

export type EmailPreferences = {
  emailEnabled: boolean;
  emailTime: string;
  emailFormat: string;
  emailWeekends: boolean;
  emailWeeklyDigest: boolean;
};

export type UserPreferences = LearningProfile & EmailPreferences;

/** Opt-in email defaults; learning profile matches prototype starters. */
export const DEFAULT_EMAIL_PREFERENCES: EmailPreferences = {
  emailEnabled: false,
  emailTime: "morning",
  emailFormat: "Full",
  emailWeekends: false,
  emailWeeklyDigest: false,
};

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  ...DEFAULT_LEARNING_PROFILE,
  ...DEFAULT_EMAIL_PREFERENCES,
};

/** Alias used by Profile UI. */
export type ProfilePreferences = UserPreferences;

export const DEFAULT_PREFERENCES: ProfilePreferences = DEFAULT_USER_PREFERENCES;
