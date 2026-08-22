import { NextResponse } from "next/server";
import { emailPage, EMAIL_COLORS, escapeHtml } from "@/lib/email/brand-theme";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * A GET must not change state: mail scanners, corporate link-rewriters and
 * browser prefetchers follow every URL in an email, which would silently
 * unsubscribe users who never clicked. GET renders a confirmation form;
 * POST performs the opt-out (and doubles as the RFC 8058 One-Click target).
 */

function page(title: string, body: string, form?: string): NextResponse {
  const html = emailPage({
    title,
    heading: title,
    bodyHtml: body,
    actionHtml: form,
  });
  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function unsubscribeButton(token: string): string {
  const escaped = escapeHtml(token);
  return `<form method="post" action="/api/email/unsubscribe"><input type="hidden" name="token" value="${escaped}"><button type="submit" style="display:inline-block;background:${EMAIL_COLORS.ink};color:${EMAIL_COLORS.white};font-family:'Plus Jakarta Sans','Helvetica Neue',Arial,sans-serif;font-size:13px;font-weight:600;letter-spacing:0.04em;padding:14px 28px;border:none;border-bottom:3px solid ${EMAIL_COLORS.accent};cursor:pointer;">Unsubscribe</button></form>`;
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

  return page(
    "Turn off daily lessons?",
    "<p>Confirm below and we'll stop sending your daily lesson email. You can re-enable it anytime in Profile → Email.</p>",
    unsubscribeButton(token),
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
    "<p>Daily lesson emails are turned off. You can re-enable them anytime in Profile → Email.</p>",
  );
}
