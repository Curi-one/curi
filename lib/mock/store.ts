import type {
  AuthRequest,
  ClarifyRequest,
  ClarifyResponse,
  CourseCreateRequest,
  CourseCreateResponse,
  FeedResponse,
  LessonResponse,
  LibraryResponse,
  PathSummary,
  Plan,
  QuizResponse,
  QuizSubmitRequest,
  QuizSubmitResponse,
  UserSession,
} from "@/lib/api/schemas";
import { isPathDueToday } from "@/lib/due-today";
import { computeStreak } from "@/lib/streak";
import {
  CATALOGUE_BOOKS,
  CATALOGUE_PATHS,
  clarifyQuestionsForTopic,
  createDefaultMemberActivity,
  createDefaultMemberPaths,
  DEFAULT_MEMBER,
  DEFAULT_TIMEZONE,
  generateLessonTitles,
  getLessonContent,
  lessonCountForDepth,
  PENDING_COURSE_TTL_MS,
  seedActivityDates,
  type ActivityRecord,
  type MockPath,
} from "@/lib/mock/fixtures";

export const SESSION_COOKIE = "curi_session";
export const FREE_ACTIVE_PATH_LIMIT = 2;
export const MOCK_AUTH_CODE = "123456";

type PendingCourse = {
  path: MockPath;
  createdAt: number;
};

type SessionData = {
  session: UserSession;
  paths: MockPath[];
  activity: ActivityRecord[];
  pendingCourse: PendingCourse | null;
  timezone: string;
};

type StoreResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string };

export type CourseCreateResult =
  | { ok: true; data: CourseCreateResponse }
  | { ok: false; code: string; message: string };

function todayInTimezone(timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function pathToSummary(path: MockPath): PathSummary {
  return {
    id: path.id,
    topic: path.topic,
    progress: path.progress,
    totalLessons: path.lessonTitles.length,
    depth: path.depth,
  };
}

function activePaths(paths: MockPath[]): MockPath[] {
  return paths.filter((p) => p.status === "active");
}

function hasActivityToday(
  activity: ActivityRecord[],
  courseId: string,
  today: string,
): boolean {
  return activity.some(
    (a) => a.courseId === courseId && a.activityDate === today,
  );
}

function activityDates(activity: ActivityRecord[]): string[] {
  return activity.map((a) => a.activityDate);
}

function nextCourseId(topic: string): string {
  return `course-${Date.now()}-${lessonCountForDepth(topic, "essentials")}`;
}

function createGuestSession(): UserSession {
  return { kind: "guest", plan: "free" };
}

function seedDefaultMember(today: string): SessionData {
  return {
    session: {
      kind: "member",
      name: DEFAULT_MEMBER.name,
      email: DEFAULT_MEMBER.email,
      plan: DEFAULT_MEMBER.plan,
    },
    paths: createDefaultMemberPaths(today),
    activity: createDefaultMemberActivity(today),
    pendingCourse: null,
    timezone: DEFAULT_TIMEZONE,
  };
}

class MockStore {
  private sessions = new Map<string, SessionData>();

  constructor() {
    this.reset();
  }

  reset(): void {
    this.sessions.clear();
    const today = todayInTimezone(DEFAULT_TIMEZONE);
    this.sessions.set(DEFAULT_MEMBER.sessionId, seedDefaultMember(today));
  }

  getSession(sessionId: string): UserSession {
    return this.getOrCreateSession(sessionId).session;
  }

  private getOrCreateSession(sessionId: string): SessionData {
    const existing = this.sessions.get(sessionId);
    if (existing) {
      this.expirePendingIfNeeded(existing);
      return existing;
    }
    const created: SessionData = {
      session: createGuestSession(),
      paths: [],
      activity: [],
      pendingCourse: null,
      timezone: DEFAULT_TIMEZONE,
    };
    this.sessions.set(sessionId, created);
    return created;
  }

  private expirePendingIfNeeded(data: SessionData): void {
    if (!data.pendingCourse) {
      return;
    }
    if (Date.now() - data.pendingCourse.createdAt > PENDING_COURSE_TTL_MS) {
      data.pendingCourse = null;
    }
  }

  private resolvePaths(data: SessionData): MockPath[] {
    if (data.session.kind === "guest" && data.pendingCourse) {
      return [data.pendingCourse.path];
    }
    return data.paths;
  }

  clarify(request: ClarifyRequest): ClarifyResponse {
    return {
      questions: clarifyQuestionsForTopic(request.topic),
    };
  }

  createCourse(
    sessionId: string,
    request: CourseCreateRequest,
  ): CourseCreateResult {
    const data = this.getOrCreateSession(sessionId);
    const count = lessonCountForDepth(request.topic, request.depth);
    const titles = generateLessonTitles(request.topic, request.depth, count);
    const path: MockPath = {
      id: nextCourseId(request.topic),
      topic: request.topic,
      depth: request.depth,
      clarifications: request.clarifications,
      lessonTitles: titles,
      progress: 0,
      status: "active",
      createdAt: todayInTimezone(data.timezone),
    };

    if (data.session.kind === "member") {
      const active = activePaths(data.paths);
      if (
        data.session.plan === "free" &&
        active.length >= FREE_ACTIVE_PATH_LIMIT
      ) {
        return {
          ok: false,
          code: "plan_limit",
          message: "Free plan allows up to 2 active paths. Upgrade to Academy.",
        };
      }
      data.paths.push(path);
      return {
        ok: true,
        data: {
          courseId: path.id,
          outline: titles.map((title, index) => ({ index, title })),
        },
      };
    }

    data.pendingCourse = { path, createdAt: Date.now() };
    return {
      ok: true,
      data: {
        courseId: path.id,
        outline: titles.map((title, index) => ({ index, title })),
      },
    };
  }

  getFeed(sessionId: string): FeedResponse {
    const data = this.getOrCreateSession(sessionId);
    const today = todayInTimezone(data.timezone);
    const paths = this.resolvePaths(data).filter((p) => p.status === "active");

    const due: PathSummary[] = [];
    const done: PathSummary[] = [];

    for (const path of paths) {
      const summary = pathToSummary(path);
      const state = {
        progress: path.progress,
        totalLessons: path.lessonTitles.length,
        hasActivityToday: hasActivityToday(data.activity, path.id, today),
      };
      if (isPathDueToday(state)) {
        due.push(summary);
      } else if (path.progress < path.lessonTitles.length) {
        done.push(summary);
      }
    }

    return { due, done };
  }

  getLesson(
    sessionId: string,
    courseId: string,
    index: number,
  ): StoreResult<LessonResponse> {
    const data = this.getOrCreateSession(sessionId);
    const path = this.resolvePaths(data).find((p) => p.id === courseId);
    if (!path) {
      return { ok: false, code: "not_found", message: "Path not found" };
    }
    if (index < 0 || index >= path.lessonTitles.length) {
      return { ok: false, code: "not_found", message: "Lesson not found" };
    }

    const content = getLessonContent(
      path.id,
      path.topic,
      index,
      path.lessonTitles[index],
    );
    return {
      ok: true,
      data: {
        title: content.title,
        body: content.body,
        sources: content.sources,
      },
    };
  }

  getQuiz(
    sessionId: string,
    courseId: string,
    index: number,
  ): QuizResponse {
    const data = this.getOrCreateSession(sessionId);
    const path = this.resolvePaths(data).find((p) => p.id === courseId);
    if (!path) {
      throw new Error("Path not found");
    }
    const content = getLessonContent(
      path.id,
      path.topic,
      index,
      path.lessonTitles[index] ?? `Lesson ${index + 1}`,
    );
    return {
      questions: content.quiz.map((q) => ({
        id: q.id,
        prompt: q.prompt,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
      })),
    };
  }

  submitQuiz(
    sessionId: string,
    courseId: string,
    index: number,
    request: QuizSubmitRequest,
  ): QuizSubmitResponse {
    const data = this.getOrCreateSession(sessionId);
    const path = this.resolvePaths(data).find((p) => p.id === courseId);
    if (!path) {
      throw new Error("Path not found");
    }

    const content = getLessonContent(
      path.id,
      path.topic,
      index,
      path.lessonTitles[index] ?? `Lesson ${index + 1}`,
    );
    const today = todayInTimezone(data.timezone);
    const alreadyCompleted = data.activity.some(
      (a) =>
        a.courseId === courseId &&
        a.lessonIndex === index &&
        a.lessonFeel !== undefined,
    );

    const feedback = content.quiz.map((q) => {
      const answer = request.answers.find((a) => a.questionId === q.id);
      const selectedIndex = answer?.selectedIndex ?? -1;
      return {
        questionId: q.id,
        correct: selectedIndex === q.correctIndex,
        explanation: q.explanation,
        correctIndex: q.correctIndex,
      };
    });

    if (!alreadyCompleted) {
      data.activity.push({
        courseId,
        lessonIndex: index,
        activityDate: today,
        lessonFeel: request.lessonFeel,
      });
      if (index === path.progress) {
        path.progress += 1;
      }
      if (path.progress >= path.lessonTitles.length) {
        path.status = "mastered";
      }
    }

    const dates = activityDates(data.activity);
    const streak = computeStreak(dates);
    const feed = this.getFeed(sessionId);

    return {
      feedback,
      complete: true,
      streak,
      pathsStillDue: feed.due.length,
      pathMastered: path.status === "mastered",
    };
  }

  getLibrary(sessionId: string): LibraryResponse {
    const data = this.getOrCreateSession(sessionId);
    const paths = this.resolvePaths(data);
    return {
      exploring: paths
        .filter((p) => p.status === "active")
        .map(pathToSummary),
      mastered: paths
        .filter((p) => p.status === "mastered")
        .map(pathToSummary),
      shelved: paths.filter((p) => p.status === "shelved").map(pathToSummary),
    };
  }

  getCourseMap(
    sessionId: string,
    courseId: string,
  ): StoreResult<{
    id: string;
    topic: string;
    depth: MockPath["depth"];
    status: "active" | "completed" | "shelved";
    nodes: { index: number; title: string; status: "read" | "today" | "locked" }[];
  }> {
    const data = this.getOrCreateSession(sessionId);
    const path = this.resolvePaths(data).find((p) => p.id === courseId);
    if (!path) {
      return { ok: false, code: "not_found", message: "Path not found" };
    }
    const dbStatus: "active" | "completed" | "shelved" =
      path.status === "mastered"
        ? "completed"
        : path.status === "shelved"
          ? "shelved"
          : "active";
    const nodes = path.lessonTitles.map((title, index) => {
      let status: "read" | "today" | "locked" = "locked";
      if (index < path.progress) status = "read";
      else if (index === path.progress && path.status === "active") {
        status = "today";
      }
      return { index, title, status };
    });
    return {
      ok: true,
      data: {
        id: path.id,
        topic: path.topic,
        depth: path.depth,
        status: dbStatus,
        nodes,
      },
    };
  }

  shelvePath(
    sessionId: string,
    courseId: string,
  ): StoreResult<{ courseId: string }> {
    const data = this.getOrCreateSession(sessionId);
    const path = data.paths.find((p) => p.id === courseId);
    if (!path) {
      return { ok: false, code: "not_found", message: "Path not found" };
    }
    if (path.status !== "active") {
      return {
        ok: false,
        code: "invalid_state",
        message: "Only active paths can be shelved",
      };
    }
    path.status = "shelved";
    return { ok: true, data: { courseId } };
  }

  signIn(
    sessionId: string,
    request: AuthRequest,
  ): StoreResult<{ session: UserSession; migratedPathId?: string }> {
    const data = this.getOrCreateSession(sessionId);

    if (!request.code) {
      return {
        ok: true,
        data: { session: data.session },
      };
    }

    if (request.code !== MOCK_AUTH_CODE) {
      return { ok: false, code: "invalid_code", message: "Invalid code" };
    }

    let migratedPathId: string | undefined;
    const wasGuest = data.session.kind === "guest";

    data.session = {
      kind: "member",
      email: request.email,
      name: request.name ?? data.session.name,
      plan: data.session.plan,
    };

    if (wasGuest && data.pendingCourse) {
      data.paths.push(data.pendingCourse.path);
      migratedPathId = data.pendingCourse.path.id;
      data.pendingCourse = null;
    }

    return {
      ok: true,
      data: { session: data.session, migratedPathId },
    };
  }

  signOut(sessionId: string): UserSession {
    const guest = createGuestSession();
    this.sessions.set(sessionId, {
      session: guest,
      paths: [],
      activity: [],
      pendingCourse: null,
      timezone: DEFAULT_TIMEZONE,
    });
    return guest;
  }

  setPlan(sessionId: string, plan: Plan): void {
    const data = this.getOrCreateSession(sessionId);
    if (data.session.kind === "member") {
      data.session.plan = plan;
    }
  }

  getExplore() {
    return { paths: CATALOGUE_PATHS, books: CATALOGUE_BOOKS };
  }

  getProgress(sessionId: string) {
    const data = this.getOrCreateSession(sessionId);
    const today = todayInTimezone(data.timezone);
    const dates = [...new Set(activityDates(data.activity))].sort();
    const heatmapSeed = seedActivityDates(today);
    const heatmap = [...new Set([...dates, ...heatmapSeed])].sort();

    return {
      streak: computeStreak(dates),
      heatmap,
      activePaths: activePaths(this.resolvePaths(data)).length,
      masteredPaths: this.resolvePaths(data).filter((p) => p.status === "mastered")
        .length,
    };
  }

  setPersona(sessionId: string, persona: "guest" | "member"): void {
    if (persona === "member") {
      const today = todayInTimezone(DEFAULT_TIMEZONE);
      this.sessions.set(sessionId, seedDefaultMember(today));
      return;
    }
    this.sessions.set(sessionId, {
      session: createGuestSession(),
      paths: [],
      activity: [],
      pendingCourse: null,
      timezone: DEFAULT_TIMEZONE,
    });
  }
}

let storeInstance: MockStore | null = null;

export function getMockStore(): MockStore {
  if (!storeInstance) {
    storeInstance = new MockStore();
  }
  return storeInstance;
}

export function resetMockStore(): void {
  getMockStore().reset();
}

export function getSessionIdFromCookieHeader(
  cookieHeader: string | null,
): string {
  if (!cookieHeader) {
    return `guest-${Date.now()}`;
  }
  const match = cookieHeader.match(
    new RegExp(`${SESSION_COOKIE}=([^;]+)`),
  );
  return match?.[1] ?? `guest-${Date.now()}`;
}
