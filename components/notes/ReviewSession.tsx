"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/Button";
import { formatReviewDays } from "@/lib/notes/format-interval";
import { previewIntervals, rateCard } from "@/lib/notes/sm2";
import type { NoteCard, NoteDeck, ReviewRating } from "@/lib/notes/types";
import { postNoteReview } from "@/lib/api/client";

type Props = {
  deck: NoteDeck;
  dueOnly?: boolean;
  onBack: () => void;
  onDeckUpdated: (deck: NoteDeck) => void;
  onComplete?: () => void;
};

function buildQueue(cards: NoteCard[], dueOnly: boolean, now: number): NoteCard[] {
  const due = cards.filter((c) => c.due <= now);
  if (dueOnly && due.length > 0) return [...due];
  if (due.length > 0) return [...due];
  return [...cards];
}

export function ReviewSession({
  deck,
  dueOnly = true,
  onBack,
  onDeckUpdated,
  onComplete,
}: Props) {
  const now = Date.now();
  const [queue, setQueue] = useState(() => buildQueue(deck.cards, dueOnly, now));
  const [sessionSize] = useState(() => queue.length);
  const [ratedCount, setRatedCount] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const done = queue.length === 0;
  const card = queue[0];
  const preview = card ? previewIntervals(card) : null;

  const applyRating = useCallback(
    async (rating: ReviewRating) => {
      if (!card || submitting) return;
      setSubmitting(true);
      try {
        const res = await postNoteReview(card.id, rating);
        const updated = res.card;
        const nextCards = deck.cards.map((c) =>
          c.id === updated.id ? updated : c,
        );
        onDeckUpdated({ ...deck, cards: nextCards, updatedAt: Date.now() });

        setQueue((prev) => {
          const rest = prev.slice(1);
          if (rating === 1) return [...rest, updated];
          return rest;
        });
        if (rating !== 1) setRatedCount((n) => n + 1);
        setFlipped(false);
      } finally {
        setSubmitting(false);
      }
    },
    [card, deck, onDeckUpdated, submitting],
  );

  useEffect(() => {
    if (flipped || done) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flipped, done]);

  useEffect(() => {
    if (!flipped || done) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "1") void applyRating(1);
      else if (e.key === "2") void applyRating(2);
      else if (e.key === "3") void applyRating(3);
      else if (e.key === "4") void applyRating(4);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flipped, done, applyRating]);

  if (done) {
    return (
      <div className="notes-review-done mx-auto w-full max-w-lg py-16 text-center">
        <p className="type-kicker-mark normal-case tracking-wider text-ink-muted">
          Session complete
        </p>
        <h2 className="type-display-lg mt-3 text-ink">Well done.</h2>
        <p className="mt-4 text-sm text-ink-muted">
          {ratedCount} card{ratedCount === 1 ? "" : "s"} reviewed
        </p>
        <Button
          type="button"
          variant="primary"
          className="mt-10"
          onClick={() => {
            onComplete?.();
            onBack();
          }}
        >
          Back to notes
        </Button>
      </div>
    );
  }

  if (!card) return null;

  const ratings: { rating: ReviewRating; label: string; days: number }[] = [
    { rating: 1, label: "Again", days: preview?.again ?? 1 },
    { rating: 2, label: "Hard", days: preview?.hard ?? 1 },
    { rating: 3, label: "Good", days: preview?.good ?? 1 },
    { rating: 4, label: "Easy", days: preview?.easy ?? 4 },
  ];

  return (
    <div className="notes-review mx-auto w-full max-w-lg">
      <div className="mb-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="focus-ring inline-flex min-h-11 items-center gap-1.5 font-meta text-ui-3xs uppercase tracking-wider text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          {deck.name}
        </button>
        <p className="font-meta text-ui-3xs uppercase tracking-wider text-ink-muted">
          {sessionSize - queue.length + 1} / {sessionSize}
        </p>
      </div>

      <button
        type="button"
        onClick={() => !flipped && setFlipped(true)}
        className="notes-flashcard focus-ring w-full text-left"
        aria-pressed={flipped}
      >
        <p className="type-kicker-mark mb-4 normal-case tracking-wider text-ink-muted">
          {flipped ? "Answer" : "Question"}
        </p>
        <p className="type-lede text-ink">{flipped ? card.back : card.front}</p>
        {!flipped && (
          <p className="notes-flashcard-hint mt-8 font-meta text-ui-3xs uppercase tracking-wider text-ink-muted">
            Tap or press space to reveal
          </p>
        )}
      </button>

      {flipped && (
        <div className="notes-rating-grid mt-6">
          {ratings.map(({ rating, label, days }) => (
            <button
              key={rating}
              type="button"
              disabled={submitting}
              onClick={() => void applyRating(rating)}
              className="notes-rating-btn focus-ring"
            >
              <span className="notes-rating-label">{label}</span>
              <span className="notes-rating-days">{formatReviewDays(days)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Local-only rating for tests — exported to verify SM-2 wiring without API. */
export function rateCardLocally(
  card: NoteCard,
  rating: ReviewRating,
): NoteCard {
  return rateCard(card, rating);
}
