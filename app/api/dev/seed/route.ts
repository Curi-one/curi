import { NextResponse } from "next/server";
import { getEnv } from "@/lib/env";
import { seedStagingMember } from "@/lib/seed/staging-member";

/**
 * POST /api/dev/seed — staging demo member with 3 paths (2 due, 1 done today).
 * Blocked in production. Requires Bearer CRON_SECRET outside local.
 */
export async function POST(request: Request) {
  const env = getEnv();

  if (env.APP_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Local may omit CRON_SECRET; staging/production require Bearer.
  const cronSecret = env.CRON_SECRET.trim();
  if (env.APP_ENV !== "local") {
    if (!cronSecret) {
      return NextResponse.json(
        { error: "CRON_SECRET not configured" },
        { status: 503 },
      );
    }
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else if (cronSecret.length > 0) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await seedStagingMember();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "seed_failed";
    if (/SUPABASE_SERVICE_ROLE_KEY|NEXT_PUBLIC_SUPABASE_URL/i.test(message)) {
      return NextResponse.json(
        { ok: false, error: "supabase_not_configured" },
        { status: 503 },
      );
    }
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
