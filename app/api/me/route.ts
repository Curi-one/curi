import { z } from "zod";
import {
  invalidBodyResponse,
  jsonWithSession,
  resolveSession,
} from "@/lib/api/handler-utils";
import { loadMemberSession } from "@/lib/auth/otp";
import { getEnv } from "@/lib/env";
import { updateProfile } from "@/lib/me/update-profile";
import { getMockStore } from "@/lib/mock/store";
import { createClient } from "@/lib/supabase/server";

const PatchMeSchema = z.object({
  name: z.string().min(1).max(120).optional(),
});

export async function GET(request: Request) {
  const { sessionId } = resolveSession(request);

  if (getEnv().USE_MOCK_API) {
    const store = getMockStore();
    return jsonWithSession({ session: store.getSession(sessionId) }, sessionId);
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const session = await loadMemberSession(user.id, user.email ?? undefined);
      return jsonWithSession({ session }, sessionId);
    }
  } catch {
    // Fall through to guest when Supabase is unavailable.
  }

  return jsonWithSession(
    { session: { kind: "guest" as const, plan: "free" as const } },
    sessionId,
  );
}

export async function PATCH(request: Request) {
  const { sessionId } = resolveSession(request);
  const raw: unknown = await request.json().catch(() => null);
  const parsed = PatchMeSchema.safeParse(raw);
  if (!parsed.success) {
    return invalidBodyResponse();
  }

  if (getEnv().USE_MOCK_API) {
    const store = getMockStore();
    const session = store.getSession(sessionId);
    if (session.kind !== "member") {
      return jsonWithSession(
        { error: "Sign in required", code: "unauthorized" },
        sessionId,
        { status: 401 },
      );
    }
    if (parsed.data.name) {
      session.name = parsed.data.name;
    }
    return jsonWithSession({ session }, sessionId);
  }

  const result = await updateProfile(parsed.data);
  if (!result.ok) {
    const status = result.code === "unauthorized" ? 401 : 400;
    return jsonWithSession(
      { error: result.message, code: result.code },
      sessionId,
      { status },
    );
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return jsonWithSession(
        { error: "Sign in required", code: "unauthorized" },
        sessionId,
        { status: 401 },
      );
    }
    const session = await loadMemberSession(user.id, user.email ?? undefined);
    return jsonWithSession({ session }, sessionId);
  } catch {
    return jsonWithSession({ ok: true }, sessionId);
  }
}
