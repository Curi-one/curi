import { NextResponse } from "next/server";
import { AuthRequestSchema } from "@/lib/api/schemas";
import {
  invalidBodyResponse,
  jsonWithSession,
  newSessionId,
  resolveSession,
} from "@/lib/api/handler-utils";
import {
  classifyAuthError,
  isStagingOtpBypass,
  loadMemberSession,
  migratePending,
  OTP_RATE_LIMIT_NOTICE,
  requestOtp,
  signInWithStagingOtp,
  updateUserName,
  verifyOtp,
} from "@/lib/auth/otp";
import { getEnv } from "@/lib/env";
import { getMockStore, MOCK_AUTH_CODE } from "@/lib/mock/store";
import {
  createClientForResponse,
  requestFromIncoming,
} from "@/lib/supabase/server";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/api/rate-limit";

const HOUR_MS = 60 * 60 * 1000;
/** Sign-in emails are free to request and land in someone else's inbox. */
const SEND_PER_EMAIL = 5;
/** A 6-digit OTP is only strong if guesses are bounded. */
const VERIFY_PER_EMAIL = 10;
const VERIFY_WINDOW_MS = 15 * 60 * 1000;
const PER_IP = 30;

/**
 * Carry Supabase's auth cookies onto the outgoing response **with their
 * options**. Copying only name/value drops maxAge, path, sameSite, secure and
 * httpOnly, which downgrades the session cookie to a non-Secure, browser-
 * session-lifetime cookie.
 */
function copySessionCookies(
  carrier: NextResponse,
  response: NextResponse,
): void {
  for (const cookie of carrier.cookies.getAll()) {
    response.cookies.set(cookie);
  }
}

export async function POST(request: Request) {
  const { sessionId } = resolveSession(request);
  const body: unknown = await request.json().catch(() => null);
  const parsed = AuthRequestSchema.safeParse(body);
  if (!parsed.success) {
    return invalidBodyResponse();
  }

  const { email, code, name, returnTo } = parsed.data;

  if (getEnv().USE_MOCK_API) {
    const store = getMockStore();
    const result = store.signIn(sessionId, parsed.data);
    if (!result.ok) {
      return jsonWithSession(
        { error: result.message, code: result.code },
        sessionId,
        { status: 401 },
      );
    }

    // Email-only: request step (mock OTP). devHint kept for local tests only — never shown in UI.
    if (!code) {
      return jsonWithSession(
        {
          ok: true as const,
          step: "link" as const,
          session: result.data.session,
          devHint: MOCK_AUTH_CODE,
        },
        sessionId,
      );
    }

    return jsonWithSession(result.data, sessionId);
  }

  // Mock mode is local-only and has no real mailbox or OTP to protect.
  const normalizedEmail = email.trim().toLowerCase();
  const ipLimit = rateLimit(`auth:ip:${clientIp(request)}`, PER_IP, HOUR_MS);
  if (!ipLimit.ok) {
    return tooManyRequests(ipLimit.retryAfterSeconds);
  }
  const perEmail = code
    ? rateLimit(
        `auth:verify:${normalizedEmail}`,
        VERIFY_PER_EMAIL,
        VERIFY_WINDOW_MS,
      )
    : rateLimit(`auth:send:${normalizedEmail}`, SEND_PER_EMAIL, HOUR_MS);
  if (!perEmail.ok) {
    return tooManyRequests(perEmail.retryAfterSeconds);
  }

  try {
    // Email only → send OTP
    if (!code && !name) {
      const cookieCarrier = new NextResponse();
      const otp = await requestOtp(email, {
        createServerClient: async () =>
          createClientForResponse(
            requestFromIncoming(request),
            cookieCarrier,
          ),
      }, returnTo);
      const response = jsonWithSession(
        {
          ok: true as const,
          step: "link" as const,
          emailSent: otp.sent,
          ...(otp.rateLimited ? { notice: OTP_RATE_LIMIT_NOTICE } : {}),
        },
        sessionId,
      );
      copySessionCookies(cookieCarrier, response);
      return response;
    }

    const incoming = requestFromIncoming(request);
    const cookieCarrier = new NextResponse();
    const createServer = async () =>
      createClientForResponse(incoming, cookieCarrier);

    const supabase = await createServer();
    const {
      data: { user: existing },
    } = await supabase.auth.getUser();

    let userId = existing?.id;
    let userEmail = existing?.email ?? email;

    // OTP is single-use — only verify when we do not already have a session.
    if (code && !userId) {
      const verified = isStagingOtpBypass(code)
        ? await signInWithStagingOtp(email, { createServerClient: createServer })
        : await verifyOtp(
            { email, token: code },
            { createServerClient: createServer },
          );
      userId = verified.userId;
      userEmail = verified.email;
    }

    if (!userId) {
      return jsonWithSession(
        { error: "Not signed in", code: "unauthorized" },
        sessionId,
        { status: 401 },
      );
    }

    const migrated = await migratePending(sessionId, userId);
    const migratedPathId = migrated.migratedPathIds[0];

    if (name?.trim()) {
      await updateUserName(userId, name.trim());
    }

    const session = await loadMemberSession(userId, userEmail);
    // Pending paths have been claimed above; retire the guest id so it cannot
    // be replayed or inherited.
    const response = jsonWithSession(
      {
        session,
        ...(migratedPathId ? { migratedPathId } : {}),
        ...(migrated.shelvedPathIds.length > 0
          ? { shelvedPathIds: migrated.shelvedPathIds }
          : {}),
      },
      newSessionId(),
    );
    copySessionCookies(cookieCarrier, response);
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Auth failed";
    const classified = classifyAuthError(message);
    // Only the two user-actionable classes get a specific message. Anything
    // else is an internal fault — do not echo the raw error to the client.
    let clientMessage: string;
    if (classified.code === "rate_limited") {
      clientMessage =
        "Too many sign-in emails. Wait a few minutes, or open the link we already sent.";
    } else if (classified.code === "invalid_code") {
      clientMessage = "That code is invalid or expired. Request a new one.";
    } else {
      console.error("auth route failed", err);
      clientMessage = "Something went wrong signing you in. Try again.";
    }
    return jsonWithSession(
      {
        error: clientMessage,
        code: classified.code,
      },
      sessionId,
      { status: classified.status },
    );
  }
}
