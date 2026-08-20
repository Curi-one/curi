import { AuthRequestSchema } from "@/lib/api/schemas";
import {
  invalidBodyResponse,
  jsonWithSession,
  resolveSession,
} from "@/lib/api/handler-utils";
import {
  loadMemberSession,
  migratePending,
  requestOtp,
  updateUserName,
  verifyOtp,
} from "@/lib/auth/otp";
import { getEnv } from "@/lib/env";
import { getMockStore, MOCK_AUTH_CODE } from "@/lib/mock/store";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { sessionId } = resolveSession(request);
  const body: unknown = await request.json().catch(() => null);
  const parsed = AuthRequestSchema.safeParse(body);
  if (!parsed.success) {
    return invalidBodyResponse();
  }

  const { email, code, name } = parsed.data;

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

    // Email-only: request step (mock OTP). Expose devHint only in mock mode.
    if (!code) {
      return jsonWithSession(
        {
          ok: true as const,
          step: "code" as const,
          session: result.data.session,
          devHint: MOCK_AUTH_CODE,
        },
        sessionId,
      );
    }

    return jsonWithSession(result.data, sessionId);
  }

  try {
    // Email only → send OTP
    if (!code && !name) {
      await requestOtp(email);
      return jsonWithSession(
        { ok: true as const, step: "code" as const },
        sessionId,
      );
    }

    const supabase = await createClient();
    const {
      data: { user: existing },
    } = await supabase.auth.getUser();

    let userId = existing?.id;
    let userEmail = existing?.email ?? email;

    // OTP is single-use — only verify when we do not already have a session.
    if (code && !userId) {
      const verified = await verifyOtp({ email, token: code });
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
    return jsonWithSession(
      {
        session,
        ...(migratedPathId ? { migratedPathId } : {}),
      },
      sessionId,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Auth failed";
    const isInvalid =
      /otp|token|invalid|expired/i.test(message) ||
      message.toLowerCase().includes("verify");
    return jsonWithSession(
      {
        error: message,
        code: isInvalid ? "invalid_code" : "auth_error",
      },
      sessionId,
      { status: isInvalid ? 401 : 500 },
    );
  }
}
