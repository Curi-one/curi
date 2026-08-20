import { jsonWithSession, resolveSession } from "@/lib/api/handler-utils";
import { getFeed } from "@/lib/feed/get-feed";
import { getEnv } from "@/lib/env";
import { getMockStore } from "@/lib/mock/store";

export async function GET(request: Request) {
  const { sessionId } = resolveSession(request);

  if (getEnv().USE_MOCK_API) {
    const store = getMockStore();
    return jsonWithSession(store.getFeed(sessionId), sessionId);
  }

  const result = await getFeed();
  if (!result.ok) {
    return jsonWithSession({ due: [], done: [] }, sessionId);
  }

  return jsonWithSession(result.data, sessionId);
}
