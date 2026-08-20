import { CourseCreateRequestSchema } from "@/lib/api/schemas";
import {
  invalidBodyResponse,
  jsonWithSession,
  resolveSession,
} from "@/lib/api/handler-utils";
import { createCourse } from "@/lib/courses/create-course";
import { getEnv } from "@/lib/env";
import { getMockStore } from "@/lib/mock/store";

export async function POST(request: Request) {
  const { sessionId } = resolveSession(request);
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
    return jsonWithSession(
      { error: result.message, code: result.code },
      sessionId,
      { status: 403 },
    );
  }

  return jsonWithSession(result.data, sessionId);
}
