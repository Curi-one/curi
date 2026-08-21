import { CourseCreateRequestSchema } from "@/lib/api/schemas";
import {
  invalidBodyResponse,
  jsonWithSession,
  resolveSession,
} from "@/lib/api/handler-utils";
import { createCourse } from "@/lib/courses/create-course";
import { getEnv } from "@/lib/env";
import { getMockStore } from "@/lib/mock/store";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/api/rate-limit";

/** Each create can trigger a Perplexity outline generation. */
const CREATE_LIMIT = 10;
const CREATE_WINDOW_MS = 60 * 60 * 1000;

export async function POST(request: Request) {
  const { sessionId } = resolveSession(request);

  const limited = rateLimit(
    `courses:${clientIp(request)}`,
    CREATE_LIMIT,
    CREATE_WINDOW_MS,
  );
  if (!limited.ok) {
    return tooManyRequests(limited.retryAfterSeconds);
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = CourseCreateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return invalidBodyResponse();
  }

  // Preview USE_MOCK_API=false is flipped by ops/manager, not this route.
  if (getEnv().USE_MOCK_API) {
    const store = getMockStore();
    const result = store.createCourse(sessionId, parsed.data);
    if (!result.ok) {
      return jsonWithSession(
        { error: result.message, code: result.code },
        sessionId,
        { status: 403 },
      );
    }
    return jsonWithSession(result.data, sessionId);
  }

  const result = await createCourse({
    sessionId,
    request: parsed.data,
  });

  if (!result.ok) {
    // auth_unavailable is a retryable server condition, not a plan refusal.
    const status = result.code === "auth_unavailable" ? 503 : 403;
    return jsonWithSession(
      { error: result.message, code: result.code },
      sessionId,
      { status },
    );
  }

  return jsonWithSession(result.data, sessionId);
}
