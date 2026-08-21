import type { ClarifySession } from "@/lib/clarify-store";

/** Whether clarify questions must be fetched for this topic (FLOWS: topic change → restart). */
export function shouldFetchClarifyQuestions(
  existing: ClarifySession | null,
  topic: string,
): boolean {
  if (!topic.trim()) return false;
  if (!existing?.questions.length) return true;
  return existing.topic.trim().toLowerCase() !== topic.trim().toLowerCase();
}

/** Whether a stored clarify session can be restored for the URL topic. */
export function canRestoreClarifySession(
  existing: ClarifySession | null,
  topic: string,
): boolean {
  if (!existing?.questions.length) return false;
  return (
    existing.topic.trim().toLowerCase() === topic.trim().toLowerCase()
  );
}
