import { jsonWithSession, resolveSession } from "@/lib/api/handler-utils";
import { getEnv } from "@/lib/env";
import { getLessonBody } from "@/lib/lessons/body";
import { getMockStore } from "@/lib/mock/store";

type RouteParams = { params: Promise<{ courseId: string; index: string }> };

export async function GET(request: Request, { params }: RouteParams) {
  const { sessionId } = resolveSession(request);
  const { courseId, index } = await params;
  const lessonIndex = Number.parseInt(index, 10);
  if (Number.isNaN(lessonIndex)) {
    return jsonWithSession(
      { error: "invalid", code: "invalid_index" },
      sessionId,
      { status: 400 },
    );
  }

  if (getEnv().USE_MOCK_API) {
    const store = getMockStore();
    const result = store.getLesson(sessionId, courseId, lessonIndex);
    if (!result.ok) {
      return jsonWithSession(
        { error: result.message, code: result.code },
        sessionId,
        { status: result.code === "locked" ? 403 : 404 },
      );
    }
    return jsonWithSession(result.data, sessionId);
  }

  const result = await getLessonBody({
    courseId,
    lessonIndex,
    sessionId,
  });

  if (!result.ok) {
    return jsonWithSession(
      { error: result.message, code: result.code },
      sessionId,
      { status: result.code === "locked" ? 403 : 404 },
    );
  }

  return jsonWithSession(result.data, sessionId);
}
