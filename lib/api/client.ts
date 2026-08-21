import type {
  AuthRequest,
  BillingCheckoutResponse,
  BillingPortalResponse,
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
import {
  cacheKey,
  invalidateClientCache,
  readThroughCache,
  ttlForPath,
} from "@/lib/api/client-cache";

export type ApiFetchOptions = RequestInit & {
  /** Bypass GET cache and refresh the entry. */
  skipCache?: boolean;
};

async function rawFetch<T>(path: string, init?: RequestInit): Promise<T> {
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

/**
 * Client API helper. GETs are cached (memory + sessionStorage) with short TTL
 * and in-flight dedupe. Non-GET clears the cache so Today/library stay fresh.
 */
async function apiFetch<T>(path: string, init?: ApiFetchOptions): Promise<T> {
  const method = (init?.method ?? "GET").toUpperCase();
  const { skipCache, ...fetchInit } = init ?? {};

  if (method === "GET") {
    return readThroughCache(
      cacheKey("GET", path),
      () => rawFetch<T>(path, fetchInit),
      { skipCache, ttlMs: ttlForPath(path) },
    );
  }

  const data = await rawFetch<T>(path, { ...fetchInit, method });
  // Auth and writes change session / feed / library — drop stale GETs.
  invalidateClientCache();
  return data;
}

/** Drop cached GETs (e.g. after local auth state changes outside apiFetch). */
export { invalidateClientCache };

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
  nodes: {
    index: number;
    title: string;
    status: "read" | "today" | "locked";
  }[];
};

export function getCourseMap(courseId: string) {
  return apiFetch<CourseMapResponse>(`/api/courses/${courseId}`);
}

export type ExploreResponse = {
  paths: CataloguePath[];
  books: CatalogueBook[];
  pathCategories: string[];
  bookCategories: string[];
};

export function getExplore() {
  return apiFetch<ExploreResponse>("/api/explore");
}

export type AuthLinkStepResponse = {
  ok: true;
  step: "link";
  session?: UserSession;
  /** False when Supabase rejected the send (e.g. rate limit). */
  emailSent?: boolean;
  /** Present only when USE_MOCK_API — never shown in UI. */
  devHint?: string;
  /** New email was not sent (provider rate limit). User can still use a prior link/code. */
  notice?: string;
};

export type AuthSessionResponse = {
  session: UserSession;
  migratedPathId?: string;
  /** Guest paths imported as shelved because the free active cap was full. */
  shelvedPathIds?: string[];
};

export type AuthResponse = AuthLinkStepResponse | AuthSessionResponse;

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

export type UserPreferencesResponse = {
  preferences: import("@/lib/profile/user-preferences").UserPreferences;
};

export function getPreferences() {
  return apiFetch<UserPreferencesResponse>("/api/me/preferences");
}

export function getEmailPreview() {
  return apiFetch<{ subject: string; html: string }>("/api/me/email-preview");
}

export function patchPreferences(
  body: Partial<UserPreferencesResponse["preferences"]>,
) {
  return apiFetch<UserPreferencesResponse>("/api/me/preferences", {
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

export function postBillingPortal() {
  return apiFetch<BillingPortalResponse>("/api/billing/portal", {
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
