import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isMemberOnlyPath, memberSignInPath } from "@/lib/auth/member-gate";
import { getEnv } from "@/lib/env";

/** Path + query, so sign-in returns the user exactly where they asked to go. */
function requestedPath(request: NextRequest): string {
  return `${request.nextUrl.pathname}${request.nextUrl.search}`;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The callback consumes the auth code and sets its own cookies.
  if (pathname.startsWith("/auth/callback")) {
    return NextResponse.next({ request });
  }

  const gated = isMemberOnlyPath(pathname);

  // Mock mode keeps its session in the in-memory store, not in Supabase
  // cookies, so there is nothing here to check. It is forced off in
  // production (lib/env.ts), so this cannot weaken the real gate.
  if (getEnv().USE_MOCK_API) {
    return NextResponse.next({ request });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    // Fail closed: without Supabase configured we cannot prove a session,
    // so member-only pages go to sign-in rather than rendering signed-out.
    if (gated) {
      return NextResponse.redirect(
        new URL(memberSignInPath(requestedPath(request)), request.url),
      );
    }
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && gated) {
    return NextResponse.redirect(
      new URL(memberSignInPath(requestedPath(request)), request.url),
    );
  }

  return response;
}

export const config = {
  // Pages only. Route Handlers authenticate themselves (they must return JSON
  // 401s, not redirects) and skipping them avoids a getUser() round trip on
  // every API call.
  matcher: [
    "/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
