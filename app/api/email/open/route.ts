import { NextResponse } from "next/server";
import { establishSessionForEmail } from "@/lib/auth/establish-session";
import { sanitizeReturnTo } from "@/lib/auth/intent";
import { parseSignedEmailOpenUrl } from "@/lib/email/signed-open-link";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const payload = parseSignedEmailOpenUrl(
    params.get("p"),
    params.get("s"),
  );

  if (!payload) {
    const fail = new URL("/auth", new URL(request.url).origin);
    fail.searchParams.set("error", "link");
    fail.searchParams.set("intent", "signin");
    return NextResponse.redirect(fail);
  }

  const returnTo = sanitizeReturnTo(payload.to);

  try {
    await establishSessionForEmail(payload.email, returnTo);
    return NextResponse.redirect(new URL(returnTo, new URL(request.url).origin));
  } catch {
    const fail = new URL("/auth", new URL(request.url).origin);
    fail.searchParams.set("error", "link");
    fail.searchParams.set("intent", "signin");
    fail.searchParams.set("returnTo", returnTo);
    return NextResponse.redirect(fail);
  }
}
