import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildDailyLessonEmailPayload } from "@/lib/email/build-daily-payload";
import {
  CURIOSITY_EMAIL_FORMAT,
  dailyLessonSubject,
  renderDailyLessonEmail,
} from "@/lib/email/daily-lesson-html";
import { shouldSendDailyEmail } from "@/lib/email/eligibility";
import { sendEmail } from "@/lib/email/send-email";
import { DEFAULT_TIMEZONE } from "@/lib/timezone";

export type DailyEmailDispatchResult = {
  scanned: number;
  eligible: number;
  sent: number;
  skipped: number;
  errors: string[];
};

type PreferenceRow = {
  user_id: string;
  email_enabled: boolean;
  email_time: string;
  email_format: string;
  email_weekends: boolean;
  last_email_sent_at: string | null;
  unsubscribe_token: string | null;
};

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  timezone: string;
};

export type DailyEmailDispatchDeps = {
  admin?: SupabaseClient;
  now?: () => Date;
  send?: typeof sendEmail;
  /** Manual test: skip hour and already-sent-today gates. */
  force?: boolean;
  /** Manual test: send only to this address (case-insensitive). */
  onlyEmail?: string;
  /** QA sample: build payload even when all paths are done for today. */
  sample?: boolean;
};

export async function dispatchDailyLessonEmails(
  deps?: DailyEmailDispatchDeps,
): Promise<DailyEmailDispatchResult> {
  const admin = deps?.admin ?? createAdminClient();
  const now = deps?.now?.() ?? new Date();
  const send = deps?.send ?? sendEmail;

  const result: DailyEmailDispatchResult = {
    scanned: 0,
    eligible: 0,
    sent: 0,
    skipped: 0,
    errors: [],
  };

  const { data: prefsRows, error } = await admin
    .from("user_preferences")
    .select(
      "user_id, email_enabled, email_time, email_format, email_weekends, last_email_sent_at, unsubscribe_token",
    )
    .eq("email_enabled", true);

  if (error) {
    throw new Error(`user_preferences load failed: ${error.message}`);
  }

  const prefs = (prefsRows ?? []) as PreferenceRow[];
  if (prefs.length === 0) {
    return result;
  }

  const userIds = prefs.map((row) => row.user_id);
  const { data: userRows, error: usersError } = await admin
    .from("users")
    .select("id, email, name, plan, timezone")
    .in("id", userIds);

  if (usersError) {
    throw new Error(`users load failed: ${usersError.message}`);
  }

  const usersById = new Map(
    (userRows ?? []).map((row) => [String(row.id), row as UserRow]),
  );

  const onlyEmail = deps?.onlyEmail?.trim().toLowerCase();

  for (const pref of prefs) {
    result.scanned++;
    const user = usersById.get(pref.user_id);
    if (!user?.email) {
      result.skipped++;
      continue;
    }

    if (onlyEmail && user.email.toLowerCase() !== onlyEmail) {
      result.skipped++;
      continue;
    }

    const timezone =
      typeof user.timezone === "string" && user.timezone.length > 0
        ? user.timezone
        : DEFAULT_TIMEZONE;

    // email_time / email_weekends columns are ignored — fixed 7 AM local, every day.
    const eligibleNow =
      deps?.force === true ||
      shouldSendDailyEmail(
        { emailEnabled: pref.email_enabled },
        pref.last_email_sent_at,
        timezone,
        now,
      );

    if (!eligibleNow) {
      result.skipped++;
      continue;
    }

    result.eligible++;

    const token = pref.unsubscribe_token;
    if (!token) {
      result.errors.push(`${user.email}: missing unsubscribe token`);
      continue;
    }

    try {
      const payload = await buildDailyLessonEmailPayload(
        {
          userId: pref.user_id,
          email: user.email,
          name: user.name,
          plan: user.plan,
          timezone,
          emailFormat: CURIOSITY_EMAIL_FORMAT,
          unsubscribeToken: token,
        },
        admin,
        now,
        deps?.sample === true,
      );

      if (!payload) {
        result.skipped++;
        continue;
      }

      const sendResult = await send({
        to: payload.to,
        subject: dailyLessonSubject(payload),
        html: renderDailyLessonEmail(payload),
        headers: {
          // RFC 8058: mail clients POST here, so the opt-out never depends on
          // a state-changing GET.
          "List-Unsubscribe": `<${payload.unsubscribeUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      });

      if (!sendResult.ok) {
        result.errors.push(`${user.email}: ${sendResult.message}`);
        continue;
      }

      const { error: updateError } = await admin
        .from("user_preferences")
        .update({ last_email_sent_at: now.toISOString() })
        .eq("user_id", pref.user_id);

      if (updateError) {
        result.errors.push(`${user.email}: ${updateError.message}`);
        continue;
      }

      result.sent++;
    } catch (err) {
      const message = err instanceof Error ? err.message : "send_failed";
      result.errors.push(`${user.email}: ${message}`);
    }
  }

  return result;
}
