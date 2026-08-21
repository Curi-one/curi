import { QuizSubmitRequestSchema } from "@/lib/api/schemas";
import {
  invalidBodyResponse,
  jsonWithSession,
  resolveSession,
} from "@/lib/api/handler-utils";
import { getEnv } from "@/lib/env";
import { getQuiz, submitQuiz } from "@/lib/lessons/quiz";
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
    try {
      const store = getMockStore();
      const quiz = store.getQuiz(sessionId, courseId, lessonIndex);
      return jsonWithSession(quiz, sessionId);
    } catch {
      return jsonWithSession(
        { error: "not found", code: "not_found" },
        sessionId,
        { status: 404 },
      );
    }
  }

  const result = await getQuiz({ courseId, lessonIndex, sessionId });
  if (!result.ok) {
    return jsonWithSession(
      { error: result.message, code: result.code },
      sessionId,
      { status: result.code === "locked" ? 403 : 404 },
    );
  }
  return jsonWithSession(result.data, sessionId);
}

export async function POST(request: Request, { params }: RouteParams) {
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

  const body: unknown = await request.json().catch(() => null);
  const parsed = QuizSubmitRequestSchema.safeParse(body);
  if (!parsed.success) {
    return invalidBodyResponse();
  }

  if (getEnv().USE_MOCK_API) {
    try {
      const store = getMockStore();
      const result = store.submitQuiz(
        sessionId,
        courseId,
        lessonIndex,
        parsed.data,
      );
      return jsonWithSession(result, sessionId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message === "already_done_today") {
        return jsonWithSession(
          {
            error: "This path already has a lesson completed today",
            code: "already_done_today",
          },
          sessionId,
          { status: 409 },
        );
      }
      return jsonWithSession(
        { error: "not found", code: "not_found" },
        sessionId,
        { status: 404 },
      );
    }
  }

  const result = await submitQuiz({
    courseId,
    lessonIndex,
    sessionId,
    request: parsed.data,
  });
  if (!result.ok) {
    return jsonWithSession(
      { error: result.message, code: result.code },
      sessionId,
      {
        status:
          result.code === "already_done_today"
            ? 409
            : result.code === "locked"
              ? 403
              : 404,
      },
    );
  }
  return jsonWithSession(result.data, sessionId);
}
