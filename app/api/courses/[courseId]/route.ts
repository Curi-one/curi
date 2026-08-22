import { z } from "zod";
import {
  invalidBodyResponse,
  jsonWithSession,
  resolveSession,
} from "@/lib/api/handler-utils";
import { getCourseMap } from "@/lib/courses/get-course-map";
import { restoreCourse } from "@/lib/courses/restore-course";
import { shelveCourse } from "@/lib/courses/shelve-course";
import { getEnv } from "@/lib/env";
import { getMockStore } from "@/lib/mock/store";

type RouteParams = { params: Promise<{ courseId: string }> };

const PatchBodySchema = z.object({
  action: z.enum(["shelve", "restore"]),
});

function patchStatus(
  code: string,
): number {
  if (code === "not_found") return 404;
  if (code === "path_limit") return 403;
  return 409;
}

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
    return jsonWithSession(result.data, sessionId);
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
    const result =
      parsed.data.action === "restore"
        ? store.restorePath(sessionId, courseId)
        : store.shelvePath(sessionId, courseId);
    if (!result.ok) {
      return jsonWithSession(
        { error: result.message, code: result.code },
        sessionId,
        { status: patchStatus(result.code) },
      );
    }
    return jsonWithSession(
      { ok: true, courseId: result.data.courseId },
      sessionId,
    );
  }

  const result =
    parsed.data.action === "restore"
      ? await restoreCourse(courseId)
      : await shelveCourse(courseId);
  if (!result.ok) {
    return jsonWithSession(
      { error: result.message, code: result.code },
      sessionId,
      { status: patchStatus(result.code) },
    );
  }

  return jsonWithSession({ ok: true, courseId: result.courseId }, sessionId);
}
