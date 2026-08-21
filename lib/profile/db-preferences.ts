import type { SupabaseClient } from "@supabase/supabase-js";
import { getAuthenticatedUserId } from "@/lib/auth/user-id";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  DEFAULT_LEARNING_PROFILE,
  type LearningProfile,
  normalizeLearningProfile,
} from "@/lib/profile/learning-profile";
import {
  DEFAULT_USER_PREFERENCES,
  type UserPreferences,
} from "@/lib/profile/user-preferences";

export type { EmailPreferences, UserPreferences } from "@/lib/profile/user-preferences";
export {
  DEFAULT_EMAIL_PREFERENCES,
  DEFAULT_USER_PREFERENCES,
} from "@/lib/profile/user-preferences";

type PreferencesRow = {
  seq_open: string;
  anchor_style: string;
  lesson_length: string;
  rigor: string;
  jargon_handling: string;
  email_enabled: boolean;
  email_time: string;
  email_format: string;
  email_weekends: boolean;
  email_weekly_digest: boolean;
};

function rowToPreferences(row: PreferencesRow): UserPreferences {
  const learning = normalizeLearningProfile({
    seq: row.seq_open,
    anchor: row.anchor_style,
    length: row.lesson_length,
    rigor: row.rigor,
    jargon: row.jargon_handling,
  });
  return {
    ...learning,
    emailEnabled: row.email_enabled,
    emailTime: row.email_time,
    emailFormat: row.email_format,
    emailWeekends: row.email_weekends,
    emailWeeklyDigest: row.email_weekly_digest,
  };
}

function preferencesToRow(
  patch: Partial<UserPreferences>,
): Partial<PreferencesRow> {
  const row: Partial<PreferencesRow> = {};
  if (patch.seq !== undefined) row.seq_open = patch.seq;
  if (patch.anchor !== undefined) row.anchor_style = patch.anchor;
  if (patch.length !== undefined) row.lesson_length = patch.length;
  if (patch.rigor !== undefined) row.rigor = patch.rigor;
  if (patch.jargon !== undefined) row.jargon_handling = patch.jargon;
  if (patch.emailEnabled !== undefined) row.email_enabled = patch.emailEnabled;
  if (patch.emailTime !== undefined) row.email_time = patch.emailTime;
  if (patch.emailFormat !== undefined) row.email_format = patch.emailFormat;
  if (patch.emailWeekends !== undefined) row.email_weekends = patch.emailWeekends;
  if (patch.emailWeeklyDigest !== undefined) {
    row.email_weekly_digest = patch.emailWeeklyDigest;
  }
  return row;
}

export type PreferencesResult =
  | { ok: true; preferences: UserPreferences }
  | { ok: false; code: "unauthorized"; message: string };

export type PreferencesUpdateResult =
  | { ok: true; preferences: UserPreferences }
  | { ok: false; code: "unauthorized" | "invalid"; message: string };

export type PreferencesDeps = {
  admin?: SupabaseClient;
  getUserId?: () => Promise<string | null>;
};

export async function loadUserPreferences(
  deps?: PreferencesDeps,
): Promise<PreferencesResult> {
  const getUserId = deps?.getUserId ?? getAuthenticatedUserId;
  const userId = await getUserId();
  if (!userId) {
    return { ok: false, code: "unauthorized", message: "Sign in required" };
  }

  const admin = deps?.admin ?? createAdminClient();
  const { data, error } = await admin
    .from("user_preferences")
    .select(
      "seq_open, anchor_style, lesson_length, rigor, jargon_handling, email_enabled, email_time, email_format, email_weekends, email_weekly_digest",
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`user_preferences lookup failed: ${error.message}`);
  }

  if (!data) {
    const { error: insertError } = await admin
      .from("user_preferences")
      .insert({ user_id: userId });
    if (insertError) {
      throw new Error(
        `user_preferences insert failed: ${insertError.message}`,
      );
    }
    return { ok: true, preferences: { ...DEFAULT_USER_PREFERENCES } };
  }

  return {
    ok: true,
    preferences: rowToPreferences(data as PreferencesRow),
  };
}

export async function updateUserPreferences(
  patch: Partial<UserPreferences>,
  deps?: PreferencesDeps,
): Promise<PreferencesUpdateResult> {
  const getUserId = deps?.getUserId ?? getAuthenticatedUserId;
  const userId = await getUserId();
  if (!userId) {
    return { ok: false, code: "unauthorized", message: "Sign in required" };
  }

  const rowPatch = preferencesToRow(patch);
  if (Object.keys(rowPatch).length === 0) {
    return { ok: false, code: "invalid", message: "Nothing to update" };
  }

  const admin = deps?.admin ?? createAdminClient();
  const { data, error } = await admin
    .from("user_preferences")
    .update({ ...rowPatch, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .select(
      "seq_open, anchor_style, lesson_length, rigor, jargon_handling, email_enabled, email_time, email_format, email_weekends, email_weekly_digest",
    )
    .maybeSingle();

  if (error) {
    throw new Error(`user_preferences update failed: ${error.message}`);
  }

  if (!data) {
    const { data: inserted, error: insertError } = await admin
      .from("user_preferences")
      .insert({ user_id: userId, ...rowPatch })
      .select(
        "seq_open, anchor_style, lesson_length, rigor, jargon_handling, email_enabled, email_time, email_format, email_weekends, email_weekly_digest",
      )
      .single();
    if (insertError) {
      throw new Error(
        `user_preferences insert failed: ${insertError.message}`,
      );
    }
    return {
      ok: true,
      preferences: rowToPreferences(inserted as PreferencesRow),
    };
  }

  return {
    ok: true,
    preferences: rowToPreferences(data as PreferencesRow),
  };
}

/** Service-role load for lesson generation (no auth cookie required). */
export async function loadUserPreferencesForUserId(
  userId: string,
  admin: SupabaseClient = createAdminClient(),
): Promise<LearningProfile> {
  const { data, error } = await admin
    .from("user_preferences")
    .select("seq_open, anchor_style, lesson_length, rigor, jargon_handling")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`user_preferences lookup failed: ${error.message}`);
  }

  if (!data) {
    return { ...DEFAULT_LEARNING_PROFILE };
  }

  return normalizeLearningProfile({
    seq: data.seq_open,
    anchor: data.anchor_style,
    length: data.lesson_length,
    rigor: data.rigor,
    jargon: data.jargon_handling,
  });
}
