import { jsonWithSession, resolveSession } from "@/lib/api/handler-utils";
import { loadMemberSession } from "@/lib/auth/otp";
import { getEnv } from "@/lib/env";
import { getMockStore } from "@/lib/mock/store";
import { createClient } from "@/lib/supabase/server";

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
