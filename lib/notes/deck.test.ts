import { describe, expect, it, beforeEach } from "vitest";
import {
  addCardToDeck,
  collectDueCards,
  computeNotesStats,
  createNoteDeck,
  deleteCardFromDeck,
  findCardLocation,
  mergeLessonDeck,
  updateCardInDeck,
  updateDeckName,
} from "@/lib/notes/deck";
import { createNoteCard, MS_PER_DAY, resetNoteCardIdCounterForTests } from "@/lib/notes/sm2";
import type { NoteDeck } from "@/lib/notes/types";

describe("createNoteDeck", () => {
  beforeEach(() => resetNoteCardIdCounterForTests());

  it("creates an empty deck with timestamps", () => {
    const now = 1_000;
    const deck = createNoteDeck("Term sheets", { now });
    expect(deck.name).toBe("Term sheets");
    expect(deck.cards).toEqual([]);
    expect(deck.createdAt).toBe(now);
    expect(deck.updatedAt).toBe(now);
  });
});

describe("deck card operations", () => {
  beforeEach(() => resetNoteCardIdCounterForTests());

  it("adds, updates, and deletes cards", () => {
    let deck = createNoteDeck("Deck");
    deck = addCardToDeck(deck, "Front", "Back", 100);
    const cardId = deck.cards[0]!.id;
    deck = updateCardInDeck(deck, cardId, { front: "New front" }, 200);
    expect(deck.cards[0]?.front).toBe("New front");
    deck = deleteCardFromDeck(deck, cardId, 300);
    expect(deck.cards).toHaveLength(0);
    expect(deck.updatedAt).toBe(300);
  });

  it("renames a deck", () => {
    const deck = updateDeckName(createNoteDeck("Old"), "New", 50);
    expect(deck.name).toBe("New");
  });
});

describe("collectDueCards", () => {
  beforeEach(() => resetNoteCardIdCounterForTests());

  it("returns due cards across decks in deck order", () => {
    const now = 10_000;
    const deckA: NoteDeck = {
      ...createNoteDeck("A"),
      cards: [
        createNoteCard("a1", "A1", { now, dueInDays: 0 }),
        createNoteCard("a2", "A2", { now, dueInDays: 2 }),
      ],
    };
    const deckB: NoteDeck = {
      ...createNoteDeck("B"),
      cards: [createNoteCard("b1", "B1", { now, dueInDays: 0 })],
    };
    const due = collectDueCards([deckA, deckB], now);
    expect(due.map((d) => d.card.front)).toEqual(["a1", "b1"]);
  });
});

describe("computeNotesStats", () => {
  beforeEach(() => resetNoteCardIdCounterForTests());

  it("counts decks, cards, due, and reviewed", () => {
    const now = 5_000;
    const deck = addCardToDeck(createNoteDeck("D"), "Q", "A", now);
    const reviewed = {
      ...deck,
      cards: [
        { ...deck.cards[0]!, reps: 1, due: now + MS_PER_DAY },
        createNoteCard("due", "now", { now, dueInDays: 0 }),
      ],
    };
    expect(computeNotesStats([reviewed], now)).toEqual({
      deckCount: 1,
      cardCount: 2,
      dueCount: 1,
      reviewedCount: 1,
    });
  });
});

describe("mergeLessonDeck", () => {
  beforeEach(() => resetNoteCardIdCounterForTests());

  it("upserts a lesson deck by sourceId", () => {
    const now = 1;
    const first = mergeLessonDeck([], {
      sourceId: "path-1-L0",
      name: "Topic · Day 1",
      courseId: "path-1",
      lessonIndex: 0,
      cards: [{ front: "Q", back: "A" }],
      now,
    });
    expect(first.decks).toHaveLength(1);
    expect(first.decks[0]?.cards).toHaveLength(1);

    const second = mergeLessonDeck(first.decks, {
      sourceId: "path-1-L0",
      name: "Topic · Day 1",
      courseId: "path-1",
      lessonIndex: 0,
      cards: [{ front: "Q2", back: "A2" }],
      now: 2,
    });
    expect(second.decks).toHaveLength(1);
    expect(second.decks[0]?.cards).toHaveLength(1);
    expect(second.decks[0]?.cards[0]?.front).toBe("Q2");
  });
});

describe("findCardLocation", () => {
  beforeEach(() => resetNoteCardIdCounterForTests());

  it("finds deck index and card by id", () => {
    const deck = addCardToDeck(createNoteDeck("D"), "Q", "A");
    const cardId = deck.cards[0]!.id;
    expect(findCardLocation([deck], cardId)).toEqual({ deckIndex: 0, card: deck.cards[0] });
  });
});
