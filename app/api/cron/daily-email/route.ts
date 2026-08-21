import { NextResponse } from "next/server";
import { verifyCronAuth } from "@/lib/cron/verify-auth";
import { dispatchDailyLessonEmails } from "@/lib/email/dispatch-daily";

export async function GET(request: Request) {
  if (!verifyCronAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const force = url.searchParams.get("force") === "1";
  const onlyEmail = url.searchParams.get("email") ?? undefined;

  try {
    const result = await dispatchDailyLessonEmails({ force, onlyEmail });
    return NextResponse.json({ ok: true, force, onlyEmail: onlyEmail ?? null, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "dispatch_failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
