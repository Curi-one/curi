import { beforeEach, describe, expect, it } from "vitest";
import { getMockStore, resetMockStore } from "@/lib/mock/store";

const MEMBER_SESSION = "member-default";

describe("MockStore", () => {
  beforeEach(() => {
    resetMockStore();
  });

  describe("getFeed", () => {
    it("groups active paths into due and done based on today activity", () => {
      const store = getMockStore();
      const feed = store.getFeed(MEMBER_SESSION);

      expect(feed.due.some((p) => p.id === "mock-path-1")).toBe(true);
      expect(feed.done.some((p) => p.id === "mock-path-2")).toBe(true);
      expect(feed.due.some((p) => p.id === "mock-path-2")).toBe(false);
    });
  });

  describe("createCourse plan limit", () => {
    it("blocks a free member from creating a 3rd active path", () => {
      const store = getMockStore();
      const result = store.createCourse(MEMBER_SESSION, {
        topic: "Quantum computing basics",
        depth: "essentials",
        clarifications: [{ questionId: "q1", answer: "Curiosity" }],
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.code).toBe("plan_limit");
      }
    });

    it("allows academy members unlimited active paths", () => {
      const store = getMockStore();
      store.signIn("academy-user", {
        email: "academy@curi.one",
        code: "123456",
        name: "Academy User",
      });
      store.setPlan("academy-user", "academy");
      store.createCourse("academy-user", {
        topic: "Extra path one",
        depth: "essentials",
        clarifications: [],
      });
      store.createCourse("academy-user", {
        topic: "Extra path two",
        depth: "fluent",
        clarifications: [],
      });
      const third = store.createCourse("academy-user", {
        topic: "Extra path three",
        depth: "thorough",
        clarifications: [],
      });

      expect(third.ok).toBe(true);
    });
  });

  describe("submitQuiz", () => {
    it("marks path done today and increments progress on first completion", () => {
      const store = getMockStore();
      const before = store.getFeed(MEMBER_SESSION);
      expect(before.due.some((p) => p.id === "mock-path-1")).toBe(true);

      const quiz = store.getQuiz(MEMBER_SESSION, "mock-path-1", 0);
      const result = store.submitQuiz(MEMBER_SESSION, "mock-path-1", 0, {
        answers: quiz.questions.map((q) => ({
          questionId: q.id,
          selectedIndex: q.correctIndex,
        })),
        lessonFeel: "just_right",
      });

      expect(result.complete).toBe(true);
      expect(result.streak).toBeGreaterThan(0);

      const after = store.getFeed(MEMBER_SESSION);
      expect(after.done.some((p) => p.id === "mock-path-1")).toBe(true);
      expect(after.due.some((p) => p.id === "mock-path-1")).toBe(false);
      expect(after.done.find((p) => p.id === "mock-path-1")?.progress).toBe(1);
    });

    it("does not double-count streak when completing a second path same day", () => {
      const store = getMockStore();
      const session = "fresh-member";

      store.createCourse(session, {
        topic: "Path A",
        depth: "essentials",
        clarifications: [],
      });
      store.signIn(session, {
        email: "fresh@curi.one",
        code: "123456",
        name: "Fresh",
      });

      const pathA = store.getLibrary(session).exploring[0];
      const quizA = store.getQuiz(session, pathA.id, 0);
      const first = store.submitQuiz(session, pathA.id, 0, {
        answers: quizA.questions.map((q) => ({
          questionId: q.id,
          selectedIndex: q.correctIndex,
        })),
        lessonFeel: "just_right",
      });
      expect(first.streak).toBe(1);

      store.setPlan(session, "academy");
      store.createCourse(session, {
        topic: "Path B",
        depth: "essentials",
        clarifications: [],
      });
      const pathB = store.getLibrary(session).exploring.find(
        (p) => p.topic === "Path B",
      );
      expect(pathB).toBeDefined();

      const quizB = store.getQuiz(session, pathB!.id, 0);
      const second = store.submitQuiz(session, pathB!.id, 0, {
        answers: quizB.questions.map((q) => ({
          questionId: q.id,
          selectedIndex: q.correctIndex,
        })),
        lessonFeel: "just_right",
      });

      expect(second.streak).toBe(1);
    });
  });

  describe("getLesson difficulty modifier from prior lesson feel", () => {
    it("applies an easier hint to lesson 2 body after too_hard feel on lesson 1", () => {
      const store = getMockStore();

      const baseline = store.getLesson(MEMBER_SESSION, "mock-path-1", 1);
      expect(baseline.ok).toBe(true);

      const quiz = store.getQuiz(MEMBER_SESSION, "mock-path-1", 0);
      store.submitQuiz(MEMBER_SESSION, "mock-path-1", 0, {
        answers: quiz.questions.map((q) => ({
          questionId: q.id,
          selectedIndex: q.correctIndex,
        })),
        lessonFeel: "too_hard",
      });

      const adjusted = store.getLesson(MEMBER_SESSION, "mock-path-1", 1);
      expect(adjusted.ok).toBe(true);
      if (!baseline.ok || !adjusted.ok) return;

      expect(adjusted.data.body).not.toEqual(baseline.data.body);
      expect(adjusted.data.body[0]).toMatch(/shorter sentences|easier/i);
    });

    it("keeps baseline body when prior feel was just_right", () => {
      const store = getMockStore();

      const quiz = store.getQuiz(MEMBER_SESSION, "mock-path-1", 0);
      store.submitQuiz(MEMBER_SESSION, "mock-path-1", 0, {
        answers: quiz.questions.map((q) => ({
          questionId: q.id,
          selectedIndex: q.correctIndex,
        })),
        lessonFeel: "just_right",
      });

      const baseline = store.getLesson(MEMBER_SESSION, "mock-path-1", 1);
      expect(baseline.ok).toBe(true);
      if (!baseline.ok) return;
      expect(baseline.data.body[0]).not.toMatch(/shorter sentences|easier/i);
    });
  });
});
