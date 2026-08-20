import { jsonWithSession, resolveSession } from "@/lib/api/handler-utils";
import { getEnv } from "@/lib/env";
import { getLibrary } from "@/lib/library/get-library";
import { getMockStore } from "@/lib/mock/store";

export async function GET(request: Request) {
  const { sessionId } = resolveSession(request);

  if (getEnv().USE_MOCK_API) {
    const store = getMockStore();
    return jsonWithSession(store.getLibrary(sessionId), sessionId);
  }

  try {
    const library = await getLibrary();
    return jsonWithSession(library, sessionId);
  } catch {
    return jsonWithSession(
      { exploring: [], mastered: [], shelved: [] },
      sessionId,
    );
  }
}
