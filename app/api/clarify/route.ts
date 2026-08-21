import { ClarifyRequestSchema } from "@/lib/api/schemas";
import {
  invalidBodyResponse,
  jsonWithSession,
  resolveSession,
} from "@/lib/api/handler-utils";
import { generateClarifyQuestions } from "@/lib/clarify/generate";
import { getEnv } from "@/lib/env";
import { getMockStore } from "@/lib/mock/store";

export async function POST(request: Request) {
  const { sessionId } = resolveSession(request);
  const body: unknown = await request.json().catch(() => null);
  const parsed = ClarifyRequestSchema.safeParse(body);
  if (!parsed.success) {
    return invalidBodyResponse();
  }

  // Preview USE_MOCK_API=false is flipped by ops/manager, not this route.
  if (getEnv().USE_MOCK_API) {
    const store = getMockStore();
    return jsonWithSession(store.clarify(parsed.data), sessionId);
  }

  const data = await generateClarifyQuestions(parsed.data);
  return jsonWithSession(data, sessionId);
}
