import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth/user-id";
import { buildDailyLessonEmailPayload } from "@/lib/email/build-daily-payload";
import {
  dailyLessonSubject,
  renderDailyLessonEmail,
} from "@/lib/email/daily-lesson-html";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_TIMEZONE } from "@/lib/timezone";

export async function GET() {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const admin = createAdminClient();
  const [{ data: user }, { data: prefs }] = await Promise.all([
    admin
      .from("users")
      .select("email, name, plan, timezone")
      .eq("id", userId)
      .maybeSingle(),
    admin
      .from("user_preferences")
      .select("email_format, unsubscribe_token")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  if (!user?.email) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const token =
    typeof prefs?.unsubscribe_token === "string"
      ? prefs.unsubscribe_token
      : "preview";

  const payload = await buildDailyLessonEmailPayload(
    {
      userId,
      email: user.email,
      name: user.name,
      plan: user.plan,
      timezone: user.timezone || DEFAULT_TIMEZONE,
      emailFormat: String(prefs?.email_format ?? "Full"),
      unsubscribeToken: token,
    },
    admin,
  );

  if (!payload) {
    return NextResponse.json(
      { error: "No lessons due today — nothing to preview" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    subject: dailyLessonSubject(payload),
    html: renderDailyLessonEmail(payload),
  });
}
