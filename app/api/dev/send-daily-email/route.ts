import { NextResponse } from "next/server";
import { dispatchDailyLessonEmails } from "@/lib/email/dispatch-daily";
import { getEnv } from "@/lib/env";

/**
 * POST /api/dev/send-daily-email — staging QA send (no CRON_SECRET required).
 * Only sends to opted-in users; use ?force=1 to bypass delivery-hour gates.
 */
export async function POST(request: Request) {
  const env = getEnv();
  if (env.APP_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (env.APP_ENV !== "staging") {
    return NextResponse.json(
      { error: "Only available on staging" },
      { status: 403 },
    );
  }
  if (!env.RESEND_API_KEY.trim()) {
    return NextResponse.json(
      { error: "RESEND_API_KEY not configured" },
      { status: 503 },
    );
  }

  const url = new URL(request.url);
  const force = url.searchParams.get("force") !== "0";
  const sample = url.searchParams.get("sample") === "1";
  let onlyEmail = url.searchParams.get("email") ?? undefined;
  if (!onlyEmail) {
    try {
      const body = (await request.json()) as { email?: string };
      onlyEmail = body.email;
    } catch {
      // query param only
    }
  }

  try {
    const result = await dispatchDailyLessonEmails({
      force,
      onlyEmail,
      sample,
    });
    return NextResponse.json({
      ok: true,
      force,
      sample,
      onlyEmail: onlyEmail ?? null,
      ...result,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "send_failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return POST(request);
}
