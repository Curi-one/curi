import { jsonWithSession, resolveSession } from "@/lib/api/handler-utils";
import { getMockStore } from "@/lib/mock/store";

export async function GET(request: Request) {
  const { sessionId } = resolveSession(request);
  const store = getMockStore();
  return jsonWithSession(store.getFeed(sessionId), sessionId);
}
