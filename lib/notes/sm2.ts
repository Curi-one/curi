import type { NoteCard, ReviewRating } from "@/lib/notes/types";

export const MS_PER_DAY = 24 * 60 * 60 * 1000;
const EASE_MIN = 1.3;
const EASE_MAX = 4.0;

let cardIdCounter = 0;

export function resetNoteCardIdCounterForTests(next = 0): void {
  cardIdCounter = next;
}

function newCardId(): string {
  cardIdCounter += 1;
  return `note-${cardIdCounter.toString(36)}`;
}

type CreateCardOptions = {
  now?: number;
  /** Days from now until first review. 0 = due immediately. */
  dueInDays?: number;
};

export function createNoteCard(
  front: string,
  back: string,
  { now = Date.now(), dueInDays = 0 }: CreateCardOptions = {},
): NoteCard {
  return {
    id: newCardId(),
    front: front.trim(),
    back: back.trim(),
    ease: 2.5,
    interval: 0,
    reps: 0,
    due: now + dueInDays * MS_PER_DAY,
    createdAt: now,
  };
}

/** SM-2 update — rating 1 Again · 2 Hard · 3 Good · 4 Easy */
export function rateCard(
  card: NoteCard,
  rating: ReviewRating,
  now = Date.now(),
): NoteCard {
  let { ease, interval, reps } = card;

  if (rating === 1) {
    ease = Math.max(EASE_MIN, ease - 0.2);
    interval = 1;
    reps = 0;
  } else if (rating === 2) {
    ease = Math.max(EASE_MIN, ease - 0.15);
    interval = reps === 0 ? 1 : Math.max(1, Math.round(interval * 1.2));
    reps = Math.max(1, reps);
  } else if (rating === 3) {
    if (reps === 0) interval = 1;
    else if (reps === 1) interval = 6;
    else interval = Math.round(interval * ease);
    reps += 1;
  } else {
    ease = Math.min(EASE_MAX, ease + 0.15);
    if (reps === 0) interval = 4;
    else if (reps === 1) interval = 10;
    else interval = Math.round(interval * ease * 1.3);
    reps += 1;
  }

  return {
    ...card,
    ease,
    interval,
    reps,
    due: now + interval * MS_PER_DAY,
  };
}

export function previewIntervals(card: NoteCard): {
  again: number;
  hard: number;
  good: number;
  easy: number;
} {
  const { ease, interval, reps } = card;
  return {
    again: 1,
    hard: reps === 0 ? 1 : Math.max(1, Math.round(interval * 1.2)),
    good: reps === 0 ? 1 : reps === 1 ? 6 : Math.round(interval * ease),
    easy: reps === 0 ? 4 : reps === 1 ? 10 : Math.round(interval * ease * 1.3),
  };
}

export function isCardDue(card: NoteCard, now = Date.now()): boolean {
  return card.due <= now;
}
