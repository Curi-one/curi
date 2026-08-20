import { jsonWithSession, resolveSession } from "@/lib/api/handler-utils";
import { getMockStore } from "@/lib/mock/store";

type RouteParams = { params: Promise<{ courseId: string }> };

export async function GET(request: Request, { params }: RouteParams) {
  const { sessionId } = resolveSession(request);
  const { courseId } = await params;
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
