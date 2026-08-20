import { jsonWithSession, resolveSession } from "@/lib/api/handler-utils";
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

  const store = getMockStore();
  const result = store.getLesson(sessionId, courseId, lessonIndex);
  if (!result.ok) {
    return jsonWithSession(
      { error: result.message, code: result.code },
      sessionId,
      { status: 404 },
    );
  }

  return jsonWithSession(result.data, sessionId);
}
