import { ClarifyRequestSchema } from "@/lib/api/schemas";
import {
  invalidBodyResponse,
  jsonWithSession,
  resolveSession,
} from "@/lib/api/handler-utils";
import { getMockStore } from "@/lib/mock/store";

export async function POST(request: Request) {
  const { sessionId } = resolveSession(request);
  const body: unknown = await request.json().catch(() => null);
  const parsed = ClarifyRequestSchema.safeParse(body);
  if (!parsed.success) {
    return invalidBodyResponse();
  }

  const store = getMockStore();
  const data = store.clarify(parsed.data);
  return jsonWithSession(data, sessionId);
}
