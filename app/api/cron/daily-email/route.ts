import { NextResponse } from "next/server";
import { verifyCronAuth } from "@/lib/cron/verify-auth";
import { dispatchDailyLessonEmails } from "@/lib/email/dispatch-daily";

export async function GET(request: Request) {
  if (!verifyCronAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await dispatchDailyLessonEmails();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "dispatch_failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
