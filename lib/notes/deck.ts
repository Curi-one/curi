import type { NoteCard, NoteDeck, NotesStats } from "@/lib/notes/types";
import { createNoteCard, isCardDue } from "@/lib/notes/sm2";

let deckIdCounter = 0;

export function resetNoteDeckIdCounterForTests(next = 0): void {
  deckIdCounter = next;
}

function newDeckId(): string {
  deckIdCounter += 1;
  return `deck-${deckIdCounter.toString(36)}`;
}

export function createNoteDeck(name: string, { now = Date.now() } = {}): NoteDeck {
  return {
    id: newDeckId(),
    name: name.trim(),
    sourceId: null,
    cards: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function updateDeckName(deck: NoteDeck, name: string, now = Date.now()): NoteDeck {
  return { ...deck, name: name.trim(), updatedAt: now };
}

export function deleteDeck(decks: NoteDeck[], deckId: string): NoteDeck[] {
  return decks.filter((d) => d.id !== deckId);
}

export function addCardToDeck(
  deck: NoteDeck,
  front: string,
  back: string,
  now = Date.now(),
  dueInDays = 0,
): NoteDeck {
  return {
    ...deck,
    cards: [...deck.cards, createNoteCard(front, back, { now, dueInDays })],
    updatedAt: now,
  };
}

export function updateCardInDeck(
  deck: NoteDeck,
  cardId: string,
  patch: { front?: string; back?: string },
  now = Date.now(),
): NoteDeck {
  return {
    ...deck,
    cards: deck.cards.map((c) =>
      c.id === cardId
        ? {
            ...c,
            ...(patch.front !== undefined ? { front: patch.front.trim() } : {}),
            ...(patch.back !== undefined ? { back: patch.back.trim() } : {}),
          }
        : c,
    ),
    updatedAt: now,
  };
}

export function deleteCardFromDeck(
  deck: NoteDeck,
  cardId: string,
  now = Date.now(),
): NoteDeck {
  return {
    ...deck,
    cards: deck.cards.filter((c) => c.id !== cardId),
    updatedAt: now,
  };
}

export type DueCardRef = {
  deck: NoteDeck;
  deckIndex: number;
  card: NoteCard;
  cardIndex: number;
};

export function collectDueCards(decks: NoteDeck[], now = Date.now()): DueCardRef[] {
  const items: DueCardRef[] = [];
  decks.forEach((deck, deckIndex) => {
    deck.cards.forEach((card, cardIndex) => {
      if (isCardDue(card, now)) {
        items.push({ deck, deckIndex, card, cardIndex });
      }
    });
  });
  return items;
}

export function computeNotesStats(decks: NoteDeck[], now = Date.now()): NotesStats {
  let cardCount = 0;
  let dueCount = 0;
  let reviewedCount = 0;
  for (const deck of decks) {
    cardCount += deck.cards.length;
    for (const card of deck.cards) {
      if (isCardDue(card, now)) dueCount += 1;
      if (card.reps > 0) reviewedCount += 1;
    }
  }
  return {
    deckCount: decks.length,
    cardCount,
    dueCount,
    reviewedCount,
  };
}

export function findCardLocation(
  decks: NoteDeck[],
  cardId: string,
): { deckIndex: number; card: NoteCard } | null {
  for (let deckIndex = 0; deckIndex < decks.length; deckIndex += 1) {
    const card = decks[deckIndex]?.cards.find((c) => c.id === cardId);
    if (card) return { deckIndex, card };
  }
  return null;
}

type MergeLessonDeckInput = {
  sourceId: string;
  name: string;
  courseId: string;
  lessonIndex: number;
  cards: { front: string; back: string }[];
  now?: number;
  dueInDays?: number;
};

/** Upsert lesson-sourced deck — replaces cards when the same lesson is saved again. */
export function mergeLessonDeck(
  decks: NoteDeck[],
  input: MergeLessonDeckInput,
): { decks: NoteDeck[]; deck: NoteDeck } {
  const now = input.now ?? Date.now();
  const dueInDays = input.dueInDays ?? 1;
  const existingIndex = decks.findIndex((d) => d.sourceId === input.sourceId);
  const cards = input.cards.map(({ front, back }) =>
    createNoteCard(front, back, { now, dueInDays }),
  );

  if (existingIndex >= 0) {
    const existing = decks[existingIndex]!;
    const updated: NoteDeck = {
      ...existing,
      name: input.name,
      courseId: input.courseId,
      lessonIndex: input.lessonIndex,
      cards,
      updatedAt: now,
    };
    const next = [...decks];
    next[existingIndex] = updated;
    return { decks: next, deck: updated };
  }

  const deck: NoteDeck = {
    ...createNoteDeck(input.name, { now }),
    sourceId: input.sourceId,
    courseId: input.courseId,
    lessonIndex: input.lessonIndex,
    cards,
  };
  return { decks: [...decks, deck], deck };
}
