import { certificateFilename } from "@/lib/certificates/format";
import { renderTrackCertificateImage } from "@/lib/certificates/render-image";
import { getEnv } from "@/lib/env";
import { jsonWithSession, resolveSession } from "@/lib/api/handler-utils";
import { getMockStore } from "@/lib/mock/store";

type RouteParams = { params: Promise<{ courseId: string }> };

export async function GET(request: Request, { params }: RouteParams) {
  const { sessionId } = resolveSession(request);
  const { courseId } = await params;

  if (!getEnv().USE_MOCK_API) {
    return jsonWithSession(
      { error: "Certificate image not available", code: "not_available" },
      sessionId,
      { status: 501 },
    );
  }

  const store = getMockStore();
  const result = store.getCertificate(sessionId, courseId);
  if (!result.ok) {
    return jsonWithSession(
      { error: result.message, code: result.code },
      sessionId,
      { status: result.code === "not_mastered" ? 403 : 404 },
    );
  }

  const image = await renderTrackCertificateImage(result.data);
  const headers = new Headers(image.headers);
  headers.set(
    "Content-Disposition",
    `attachment; filename="${certificateFilename(result.data.topic)}"`,
  );
  return new Response(image.body, { status: 200, headers });
}
