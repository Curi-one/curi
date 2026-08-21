import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * A GET must not change state: mail scanners, corporate link-rewriters and
 * browser prefetchers follow every URL in an email, which would silently
 * unsubscribe users who never clicked. GET renders a confirmation form;
 * POST performs the opt-out (and doubles as the RFC 8058 One-Click target).
 */

function page(title: string, body: string, form?: string): NextResponse {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title></head><body style="font-family:'Plus Jakarta Sans',system-ui,sans-serif;padding:40px;max-width:480px;margin:auto;"><h1 style="font-family:'Fraunces',Georgia,serif;font-weight:300;">${title}</h1><p>${body}</p>${form ?? ""}</body></html>`;
  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function tokenFrom(url: string): string | null {
  const token = new URL(url).searchParams.get("token")?.trim();
  return token && token.length > 0 ? token : null;
}

export async function GET(request: Request) {
  const token = tokenFrom(request.url);
  if (!token) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const escaped = token.replace(/"/g, "&quot;");
  return page(
    "Turn off daily lessons?",
    "Confirm below and we'll stop sending your daily lesson email. You can re-enable it anytime in Profile → Email.",
    `<form method="post" action="/api/email/unsubscribe"><input type="hidden" name="token" value="${escaped}"><button type="submit" style="margin-top:16px;padding:12px 20px;border:1px solid #1a1a1a;background:#1a1a1a;color:#fff;font-size:15px;cursor:pointer;">Unsubscribe</button></form>`,
  );
}

export async function POST(request: Request) {
  // One-Click (RFC 8058) posts form-encoded; our own form posts the same way.
  let token = tokenFrom(request.url);
  if (!token) {
    try {
      const form = await request.formData();
      const value = form.get("token");
      token = typeof value === "string" && value.trim() ? value.trim() : null;
    } catch {
      token = null;
    }
  }

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

  return page(
    "Unsubscribed",
    "Daily lesson emails are turned off. You can re-enable them anytime in Profile → Email.",
  );
}
