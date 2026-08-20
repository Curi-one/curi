import { AuthRequestSchema } from "@/lib/api/schemas";
import {
  invalidBodyResponse,
  jsonWithSession,
  resolveSession,
} from "@/lib/api/handler-utils";
import { getMockStore } from "@/lib/mock/store";

export async function POST(request: Request) {
  const { sessionId } = resolveSession(request);
  const body: unknown = await request.json().catch(() => null);
  const parsed = AuthRequestSchema.safeParse(body);
  if (!parsed.success) {
    return invalidBodyResponse();
  }

  const store = getMockStore();
  const result = store.signIn(sessionId, parsed.data);
  if (!result.ok) {
    return jsonWithSession(
      { error: result.message, code: result.code },
      sessionId,
      { status: 401 },
    );
  }

  return jsonWithSession(result.data, sessionId);
}
