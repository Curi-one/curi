/** Max length for optional clarify “Anything else we should know?” details. */
export const DETAILS_MAX_CHARS = 500;

/** Trim and truncate optional learner details for prompts / storage. */
export function normalizeDetails(raw: string): string {
  return raw.trim().slice(0, DETAILS_MAX_CHARS);
}

export const LEARNER_DETAILS_KEY = "learner_details";

export type ClarificationLike = { questionId: string; answer: string };

/** Merge optional details into clarifications as `learner_details` (no double-store). */
export function mergeLearnerDetails(
  clarifications: ClarificationLike[],
  details?: string,
): ClarificationLike[] {
  const without = clarifications.filter(
    (item) => item.questionId !== LEARNER_DETAILS_KEY,
  );
  const normalized = details ? normalizeDetails(details) : "";
  if (!normalized) {
    return without;
  }
  return [...without, { questionId: LEARNER_DETAILS_KEY, answer: normalized }];
}

/** Resolve additional learner context from details param or clarifications map. */
export function resolveLearnerDetails(
  clarifications: ClarificationLike[],
  details?: string,
): string | undefined {
  if (details !== undefined) {
    const normalized = normalizeDetails(details);
    if (normalized) return normalized;
  }
  const fromArray = clarifications.find(
    (item) => item.questionId === LEARNER_DETAILS_KEY,
  )?.answer;
  if (!fromArray) return undefined;
  const normalized = normalizeDetails(fromArray);
  return normalized || undefined;
}
