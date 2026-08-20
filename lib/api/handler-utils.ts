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

export function withSessionCookie(
  response: NextResponse,
  sessionId: string,
): NextResponse {
  response.cookies.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
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
