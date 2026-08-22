import { jsonWithSession, resolveSession } from "@/lib/api/handler-utils";
import { getEnv } from "@/lib/env";
import { getMockStore } from "@/lib/mock/store";

export async function GET(request: Request) {
  const { sessionId } = resolveSession(request);

  if (getEnv().USE_MOCK_API) {
    const store = getMockStore();
    return jsonWithSession(store.getNotes(sessionId), sessionId);
  }

  return jsonWithSession(
    {
      decks: [],
      stats: { deckCount: 0, cardCount: 0, dueCount: 0, reviewedCount: 0 },
    },
    sessionId,
  );
}
