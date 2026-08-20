import type {
  AuthRequest,
  BillingCheckoutResponse,
  ClarifyRequest,
  ClarifyResponse,
  CourseCreateRequest,
  CourseCreateResponse,
  FeedResponse,
  LessonFeel,
  LessonResponse,
  LibraryResponse,
  PathSummary,
  QuizResponse,
  QuizSubmitRequest,
  QuizSubmitResponse,
  UserSession,
} from "@/lib/api/schemas";
import type { CatalogueBook, CataloguePath } from "@/lib/mock/fixtures";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    let message = body || `Request failed (${res.status})`;
    try {
      const parsed: unknown = JSON.parse(body);
      if (
        parsed &&
        typeof parsed === "object" &&
        "error" in parsed &&
        typeof parsed.error === "string"
      ) {
        message = parsed.error;
      }
    } catch {
      // Keep raw body when it is not JSON.
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export function postClarify(body: ClarifyRequest) {
  return apiFetch<ClarifyResponse>("/api/clarify", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function postCourse(body: CourseCreateRequest) {
  return apiFetch<CourseCreateResponse>("/api/courses", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function getFeed() {
  return apiFetch<FeedResponse>("/api/feed");
}

export function getLesson(courseId: string, lessonIndex: number) {
  return apiFetch<LessonResponse>(
    `/api/courses/${courseId}/lessons/${lessonIndex}`,
  );
}

export function getQuiz(courseId: string, lessonIndex: number) {
  return apiFetch<QuizResponse>(
    `/api/courses/${courseId}/lessons/${lessonIndex}/quiz`,
  );
}

export function postQuiz(
  courseId: string,
  lessonIndex: number,
  body: QuizSubmitRequest,
) {
  return apiFetch<QuizSubmitResponse>(
    `/api/courses/${courseId}/lessons/${lessonIndex}/quiz`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}

export function getLibrary() {
  return apiFetch<LibraryResponse>("/api/library");
}

export function patchShelveCourse(courseId: string) {
  return apiFetch<{ ok: true; courseId: string }>(`/api/courses/${courseId}`, {
    method: "PATCH",
    body: JSON.stringify({ action: "shelve" }),
  });
}

export type CourseMapResponse = {
  id: string;
  topic: string;
  depth: PathSummary["depth"];
  nodes: { index: number; title: string; status: "read" | "today" | "locked" }[];
};

export function getCourseMap(courseId: string) {
  return apiFetch<CourseMapResponse>(`/api/courses/${courseId}`);
}

export type ExploreResponse = {
  paths: CataloguePath[];
  books: CatalogueBook[];
};

export function getExplore() {
  return apiFetch<ExploreResponse>("/api/explore");
}

export type AuthCodeStepResponse = {
  ok: true;
  step: "code";
  session?: UserSession;
  /** False when Supabase rejected the send (e.g. rate limit). */
  emailSent?: boolean;
  /** Present only when USE_MOCK_API — never set for real Supabase OTP. */
  devHint?: string;
  /** Staging-only bypass code (APP_ENV=staging). */
  stagingOtpHint?: string;
  /** New email was not sent (provider rate limit). User can still enter a prior code. */
  notice?: string;
};

export type AuthSessionResponse = {
  session: UserSession;
  migratedPathId?: string;
};

export type AuthResponse = AuthCodeStepResponse | AuthSessionResponse;

export function postAuth(body: AuthRequest) {
  return apiFetch<AuthResponse>("/api/auth", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function postSignOut() {
  return apiFetch<{ session: UserSession }>("/api/auth/signout", {
    method: "POST",
  });
}

export function getMe() {
  return apiFetch<{ session: UserSession }>("/api/me");
}

export function patchMe(body: { name?: string }) {
  return apiFetch<{ session: UserSession }>("/api/me", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function postCheckout() {
  return apiFetch<BillingCheckoutResponse>("/api/billing/checkout", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export type ProgressResponse = {
  streak: number;
  heatmap: string[];
  activePaths: number;
  masteredPaths: number;
};

export function getProgress() {
  return apiFetch<ProgressResponse>("/api/progress");
}

export function postDevPersona(persona: "guest" | "member") {
  return apiFetch<{ ok: boolean }>("/api/dev/persona", {
    method: "POST",
    body: JSON.stringify({ persona }),
  });
}

export type { LessonFeel, PathSummary, UserSession };
