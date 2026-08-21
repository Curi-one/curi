import {
  jsonWithSession,
  newSessionId,
  resolveSession,
} from "@/lib/api/handler-utils";
import { getEnv } from "@/lib/env";
import { getMockStore } from "@/lib/mock/store";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { sessionId } = resolveSession(request);

  if (getEnv().USE_MOCK_API) {
    const store = getMockStore();
    const session = store.signOut(sessionId);
    return jsonWithSession({ session }, sessionId);
  }

  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Cookie/session may already be cleared; still return guest.
  }

  // New anonymous id on the way out — the signed-out browser must not keep an
  // id that is still associated with the account's guest history.
  return jsonWithSession(
    { session: { kind: "guest" as const, plan: "free" as const } },
    newSessionId(),
  );
}
