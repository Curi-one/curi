/** SM-2 rating: 1 Again · 2 Hard · 3 Good · 4 Easy */
export type ReviewRating = 1 | 2 | 3 | 4;

export type NoteCard = {
  id: string;
  front: string;
  back: string;
  ease: number;
  /** Days until next review after a successful grade. */
  interval: number;
  reps: number;
  /** Unix ms — card is due when due <= now. */
  due: number;
  createdAt: number;
};

export type NoteDeck = {
  id: string;
  name: string;
  /** Stable key for lesson-sourced decks, e.g. courseId-L2 */
  sourceId?: string | null;
  courseId?: string;
  lessonIndex?: number;
  cards: NoteCard[];
  createdAt: number;
  updatedAt: number;
};

export type NotesStats = {
  deckCount: number;
  cardCount: number;
  dueCount: number;
  reviewedCount: number;
};

export type NotesResponse = {
  decks: NoteDeck[];
  stats: NotesStats;
};
