import type { ClarifyQuestion, DepthOption, DepthSlug } from "@/lib/api/schemas";

const KEY = "curi_clarify";

export type ClarifyAnswer = { questionId: string; answer: string };

export type ClarifySession = {
  topic: string;
  questions: ClarifyQuestion[];
  answers: ClarifyAnswer[];
  depth?: DepthSlug;
  /** Optional free-text learner context (≤500 chars). */
  details?: string;
  /** Topic-dynamic depth labels; slugs/bands remain fixed. */
  depthOptions?: DepthOption[];
  courseId?: string;
};

export function loadClarifySession(): ClarifySession | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ClarifySession;
  } catch {
    return null;
  }
}

export function saveClarifySession(session: ClarifySession) {
  sessionStorage.setItem(KEY, JSON.stringify(session));
}

export function clearClarifySession() {
  sessionStorage.removeItem(KEY);
}

export function startClarifySession(topic: string) {
  const session: ClarifySession = {
    topic,
    questions: [],
    answers: [],
  };
  saveClarifySession(session);
  return session;
}
