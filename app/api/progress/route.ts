import { jsonWithSession, resolveSession } from "@/lib/api/handler-utils";
import { getEnv } from "@/lib/env";
import { getMockStore } from "@/lib/mock/store";
import { getProgress } from "@/lib/progress/get-progress";

export async function GET(request: Request) {
  const { sessionId } = resolveSession(request);

  if (getEnv().USE_MOCK_API) {
    const store = getMockStore();
    return jsonWithSession(store.getProgress(sessionId), sessionId);
  }

  try {
    const progress = await getProgress();
    return jsonWithSession(progress, sessionId);
  } catch {
    return jsonWithSession(
      { streak: 0, heatmap: [], activityByDay: {}, activePaths: 0, masteredPaths: 0 },
      sessionId,
    );
  }
}
