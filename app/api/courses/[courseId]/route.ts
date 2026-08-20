import { z } from "zod";
import {
  invalidBodyResponse,
  jsonWithSession,
  resolveSession,
} from "@/lib/api/handler-utils";
import { getCourseMap } from "@/lib/courses/get-course-map";
import { shelveCourse } from "@/lib/courses/shelve-course";
import { getEnv } from "@/lib/env";
import { getMockStore } from "@/lib/mock/store";

type RouteParams = { params: Promise<{ courseId: string }> };

const PatchBodySchema = z.object({
  action: z.literal("shelve"),
});

export async function GET(request: Request, { params }: RouteParams) {
  const { sessionId } = resolveSession(request);
  const { courseId } = await params;

  if (getEnv().USE_MOCK_API) {
    const store = getMockStore();
    const result = store.getCourseMap(sessionId, courseId);
    if (!result.ok) {
      return jsonWithSession(
        { error: result.message, code: result.code },
        sessionId,
        { status: 404 },
      );
    }
    const { status: _mockStatus, ...body } = result.data;
    void _mockStatus;
    return jsonWithSession(body, sessionId);
  }

  const result = await getCourseMap(courseId);
  if (!result.ok) {
    return jsonWithSession(
      { error: result.message, code: result.code },
      sessionId,
      { status: 404 },
    );
  }

  return jsonWithSession(result.data, sessionId);
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { sessionId } = resolveSession(request);
  const { courseId } = await params;

  const raw: unknown = await request.json().catch(() => null);
  const parsed = PatchBodySchema.safeParse(raw);
  if (!parsed.success) {
    return invalidBodyResponse();
  }

  if (getEnv().USE_MOCK_API) {
    const store = getMockStore();
    const result = store.shelvePath(sessionId, courseId);
    if (!result.ok) {
      const status = result.code === "not_found" ? 404 : 409;
      return jsonWithSession(
        { error: result.message, code: result.code },
        sessionId,
        { status },
      );
    }
    return jsonWithSession(
      { ok: true, courseId: result.data.courseId },
      sessionId,
    );
  }

  const result = await shelveCourse(courseId);
  if (!result.ok) {
    const status = result.code === "not_found" ? 404 : 409;
    return jsonWithSession(
      { error: result.message, code: result.code },
      sessionId,
      { status },
    );
  }

  return jsonWithSession({ ok: true, courseId: result.courseId }, sessionId);
}
