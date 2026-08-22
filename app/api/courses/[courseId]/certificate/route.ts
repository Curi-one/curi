import { getEnv } from "@/lib/env";
import {
  jsonWithSession,
  resolveSession,
} from "@/lib/api/handler-utils";
import { TrackCertificateResponseSchema } from "@/lib/certificates/types";
import { getMockStore } from "@/lib/mock/store";

type RouteParams = { params: Promise<{ courseId: string }> };

export async function GET(request: Request, { params }: RouteParams) {
  const { sessionId } = resolveSession(request);
  const { courseId } = await params;

  if (getEnv().USE_MOCK_API) {
    const store = getMockStore();
    const result = store.getCertificate(sessionId, courseId);
    if (!result.ok) {
      return jsonWithSession(
        { error: result.message, code: result.code },
        sessionId,
        { status: result.code === "not_mastered" ? 403 : 404 },
      );
    }
    const body = TrackCertificateResponseSchema.parse({
      certificate: result.data,
    });
    return jsonWithSession(body, sessionId);
  }

  return jsonWithSession(
    { error: "Certificate not available", code: "not_available" },
    sessionId,
    { status: 501 },
  );
}
