import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/mock/store";

export function resolveSession(request: Request): {
  sessionId: string;
  isNew: boolean;
} {
  const cookieHeader = request.headers.get("cookie");
  const existing = cookieHeader?.match(
    new RegExp(`${SESSION_COOKIE}=([^;]+)`),
  )?.[1];
  if (existing) {
    return { sessionId: existing, isNew: false };
  }
  const sessionId = crypto.randomUUID();
  return { sessionId, isNew: true };
}

/**
 * Fresh anonymous id. Issue one on every auth-state change (sign-in,
 * sign-out): the cookie survives both otherwise, so on a shared device the
 * next person inherits the previous visitor's pending paths.
 */
export function newSessionId(): string {
  return crypto.randomUUID();
}

export function withSessionCookie(
  response: NextResponse,
  sessionId: string,
): NextResponse {
  const secure =
    process.env.APP_ENV === "staging" ||
    process.env.APP_ENV === "production" ||
    process.env.NODE_ENV === "production";
  response.cookies.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure,
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}

export function jsonWithSession<T>(
  data: T,
  sessionId: string,
  init?: ResponseInit,
): NextResponse {
  const response = NextResponse.json(data, init);
  return withSessionCookie(response, sessionId);
}

export function invalidBodyResponse(): NextResponse {
  return NextResponse.json(
    { error: "invalid", code: "invalid_body" },
    { status: 400 },
  );
}
