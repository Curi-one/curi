import { NextRequest, NextResponse } from "next/server";
import {
  completeEmailLink,
  failureRedirectPath,
  successRedirectPath,
} from "@/lib/auth/callback";
import { createClientForResponse } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const code = request.nextUrl.searchParams.get("code");
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");

  const success = NextResponse.redirect(new URL(successRedirectPath(), origin));

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
    return success;
  } catch {
    return NextResponse.redirect(new URL(failureRedirectPath(), origin));
  }
}
