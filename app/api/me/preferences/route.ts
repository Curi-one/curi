import {
  invalidBodyResponse,
  jsonWithSession,
  resolveSession,
} from "@/lib/api/handler-utils";
import {
  loadUserPreferences,
  updateUserPreferences,
} from "@/lib/profile/db-preferences";
import { PatchPreferencesSchema } from "@/lib/profile/preferences-schema";
import { getEnv } from "@/lib/env";
import { getMockStore } from "@/lib/mock/store";

export async function GET(request: Request) {
  const { sessionId } = resolveSession(request);

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
    return jsonWithSession(
      { preferences: store.getPreferences(sessionId) },
      sessionId,
    );
  }

  const result = await loadUserPreferences();
  if (!result.ok) {
    return jsonWithSession(
      { error: result.message, code: result.code },
      sessionId,
      { status: 401 },
    );
  }

  return jsonWithSession({ preferences: result.preferences }, sessionId);
}

export async function PATCH(request: Request) {
  const { sessionId } = resolveSession(request);
  const raw: unknown = await request.json().catch(() => null);
  const parsed = PatchPreferencesSchema.safeParse(raw);
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
    const preferences = store.updatePreferences(sessionId, parsed.data);
    return jsonWithSession({ preferences }, sessionId);
  }

  const result = await updateUserPreferences(parsed.data);
  if (!result.ok) {
    const status = result.code === "unauthorized" ? 401 : 400;
    return jsonWithSession(
      { error: result.message, code: result.code },
      sessionId,
      { status },
    );
  }

  return jsonWithSession({ preferences: result.preferences }, sessionId);
}
