import { jsonWithSession, resolveSession } from "@/lib/api/handler-utils";
import { getMockStore } from "@/lib/mock/store";

export async function POST(request: Request) {
  const { sessionId } = resolveSession(request);
  const store = getMockStore();
  const session = store.signOut(sessionId);
  return jsonWithSession({ session }, sessionId);
}
