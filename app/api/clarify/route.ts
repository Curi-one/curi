import { ClarifyRequestSchema } from "@/lib/api/schemas";
import {
  invalidBodyResponse,
  jsonWithSession,
  resolveSession,
} from "@/lib/api/handler-utils";
import { generateClarifyQuestions } from "@/lib/clarify/generate";
import { getEnv } from "@/lib/env";
import { getMockStore } from "@/lib/mock/store";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/api/rate-limit";

/** Every miss is a Perplexity call, and this endpoint needs no account. */
const CLARIFY_LIMIT = 30;
const CLARIFY_WINDOW_MS = 60 * 60 * 1000;

export async function POST(request: Request) {
  const { sessionId } = resolveSession(request);

  const limited = rateLimit(
    `clarify:${clientIp(request)}`,
    CLARIFY_LIMIT,
    CLARIFY_WINDOW_MS,
  );
  if (!limited.ok) {
    return tooManyRequests(limited.retryAfterSeconds);
  }

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
