import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, type NextResponse } from "next/server";

function requirePublicSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required",
    );
  }

  return { url, anonKey };
}

/**
 * Copy cookies/headers without cloning a locked body.
 * `new NextRequest(url, request)` throws after `request.json()`.
 */
export function requestFromIncoming(request: Request): NextRequest {
  return new NextRequest(request.url, {
    method: request.method,
    headers: request.headers,
  });
}

/** Server Supabase client with cookie session (Next.js App Router). */
export async function createClient() {
  const { url, anonKey } = requirePublicSupabase();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component where cookies are read-only.
          // Middleware can refresh the session instead.
        }
      },
    },
  });
}

/** Writes session cookies onto a redirect/JSON response (auth callback). */
export function createClientForResponse(
  request: NextRequest,
  response: NextResponse,
) {
  const { url, anonKey } = requirePublicSupabase();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });
}
