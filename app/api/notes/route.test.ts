import { beforeEach, describe, expect, it } from "vitest";
import { GET } from "@/app/api/notes/route";
import { POST as createDeck } from "@/app/api/notes/decks/route";
import { POST as addCard } from "@/app/api/notes/decks/[deckId]/cards/route";
import { POST as reviewCard } from "@/app/api/notes/review/route";
import { POST as submitQuiz } from "@/app/api/courses/[courseId]/lessons/[index]/quiz/route";
import { PATCH as patchPrefs } from "@/app/api/me/preferences/route";
import { resetMockStore, SESSION_COOKIE } from "@/lib/mock/store";

const SESSION = "member-default";

describe("/api/notes (mock)", () => {
  beforeEach(() => {
    process.env.USE_MOCK_API = "true";
    resetMockStore();
  });

  it("GET returns empty notes for a fresh session", async () => {
    const res = await GET(
      new Request("http://localhost/api/notes", {
        headers: { cookie: `${SESSION_COOKIE}=${SESSION}` },
      }),
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      decks: unknown[];
      stats: { dueCount: number };
    };
    expect(body.decks).toEqual([]);
    expect(body.stats.dueCount).toBe(0);
  });

  it("creates a deck, adds a card, and reviews it", async () => {
    const deckRes = await createDeck(
      new Request("http://localhost/api/notes/decks", {
        method: "POST",
        headers: {
          cookie: `${SESSION_COOKIE}=${SESSION}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "Term sheets" }),
      }),
    );
    expect(deckRes.status).toBe(201);
    const { deck } = (await deckRes.json()) as { deck: { id: string } };

    const cardRes = await addCard(
      new Request(`http://localhost/api/notes/decks/${deck.id}/cards`, {
        method: "POST",
        headers: {
          cookie: `${SESSION_COOKIE}=${SESSION}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ front: "What is a SAFE?", back: "Simple Agreement for Future Equity" }),
      }),
      { params: Promise.resolve({ deckId: deck.id }) },
    );
    expect(cardRes.status).toBe(201);
    const { card } = (await cardRes.json()) as { card: { id: string; reps: number } };

    const reviewRes = await reviewCard(
      new Request("http://localhost/api/notes/review", {
        method: "POST",
        headers: {
          cookie: `${SESSION_COOKIE}=${SESSION}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cardId: card.id, rating: 3 }),
      }),
    );
    expect(reviewRes.status).toBe(200);
    const reviewed = (await reviewRes.json()) as { card: { reps: number; interval: number } };
    expect(reviewed.card.reps).toBe(1);
    expect(reviewed.card.interval).toBe(1);
  });
});

describe("quiz auto-save to notes", () => {
  beforeEach(() => {
    process.env.USE_MOCK_API = "true";
    resetMockStore();
  });

  async function completeFirstLessonQuiz(courseId: string) {
    const { GET: getQuiz } = await import(
      "@/app/api/courses/[courseId]/lessons/[index]/quiz/route"
    );
    const quizRes = await getQuiz(
      new Request(`http://localhost/api/courses/${courseId}/lessons/0/quiz`, {
        headers: { cookie: `${SESSION_COOKIE}=${SESSION}` },
      }),
      { params: Promise.resolve({ courseId, index: "0" }) },
    );
    const quiz = (await quizRes.json()) as {
      questions: { id: string; correctIndex: number }[];
    };

    return submitQuiz(
      new Request(`http://localhost/api/courses/${courseId}/lessons/0/quiz`, {
        method: "POST",
        headers: {
          cookie: `${SESSION_COOKIE}=${SESSION}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers: quiz.questions.map((q) => ({
            questionId: q.id,
            selectedIndex: q.correctIndex,
          })),
          lessonFeel: "just_right",
        }),
      }),
      { params: Promise.resolve({ courseId, index: "0" }) },
    );
  }

  it("saves lesson deck after quiz when notesAutoSave is on", async () => {
    const { getMockStore } = await import("@/lib/mock/store");
    const store = getMockStore();
    const paths = store.getLibrary(SESSION).exploring;
    const courseId = paths[0]?.id;
    expect(courseId).toBeTruthy();

    const quizRes = await completeFirstLessonQuiz(courseId!);
    expect(quizRes.status).toBe(200);

    const notesRes = await GET(
      new Request("http://localhost/api/notes", {
        headers: { cookie: `${SESSION_COOKIE}=${SESSION}` },
      }),
    );
    const notes = (await notesRes.json()) as {
      decks: { cards: unknown[]; sourceId?: string }[];
    };
    expect(notes.decks.length).toBeGreaterThan(0);
    expect(notes.decks[0]?.cards.length).toBeGreaterThan(0);
    expect(notes.decks[0]?.sourceId).toContain(courseId!);
  });

  it("skips auto-save when notesAutoSave is off", async () => {
    await patchPrefs(
      new Request("http://localhost/api/me/preferences", {
        method: "PATCH",
        headers: {
          cookie: `${SESSION_COOKIE}=${SESSION}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notesAutoSave: false }),
      }),
    );

    const { getMockStore } = await import("@/lib/mock/store");
    const store = getMockStore();
    const courseId = store.getLibrary(SESSION).exploring[0]?.id;
    await completeFirstLessonQuiz(courseId!);

    const notesRes = await GET(
      new Request("http://localhost/api/notes", {
        headers: { cookie: `${SESSION_COOKIE}=${SESSION}` },
      }),
    );
    const notes = (await notesRes.json()) as { decks: unknown[] };
    expect(notes.decks).toHaveLength(0);
  });
});
