import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token")?.trim();
  if (!token) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("user_preferences")
    .update({ email_enabled: false })
    .eq("unsubscribe_token", token)
    .select("user_id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const html = `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:40px;max-width:480px;margin:auto;"><h1 style="font-weight:500;">Unsubscribed</h1><p>Daily lesson emails are turned off. You can re-enable them anytime in Profile → Email.</p></body></html>`;
  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
