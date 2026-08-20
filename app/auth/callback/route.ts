import { NextRequest, NextResponse } from "next/server";
import {
  completeEmailLink,
  failureRedirectPath,
  postSignInRedirectPath,
  shouldCollectName,
} from "@/lib/auth/callback";
import { sanitizeReturnTo } from "@/lib/auth/intent";
import { loadMemberSession } from "@/lib/auth/otp";
import { createClientForResponse } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const code = request.nextUrl.searchParams.get("code");
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  const returnTo = sanitizeReturnTo(request.nextUrl.searchParams.get("next"));

  const success = NextResponse.redirect(
    new URL(postSignInRedirectPath(returnTo, true), origin),
  );

  try {
    const supabase = createClientForResponse(request, success);
    await completeEmailLink(
      { code, tokenHash, type },
      {
        exchangeCodeForSession: (value) =>
          supabase.auth.exchangeCodeForSession(value),
        verifyOtp: (params) => supabase.auth.verifyOtp(params),
      },
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const session = await loadMemberSession(user.id, user.email ?? undefined);
      if (!shouldCollectName(session)) {
        return NextResponse.redirect(
          new URL(postSignInRedirectPath(returnTo, false), origin),
        );
      }
    }

    return NextResponse.redirect(
      new URL(postSignInRedirectPath(returnTo, true), origin),
    );
  } catch {
    return NextResponse.redirect(new URL(failureRedirectPath(returnTo), origin));
  }
}
