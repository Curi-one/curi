"use client";

import { useCallback, useMemo, useState } from "react";
import { Layers2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/Button";
import { ReviewSession } from "@/components/notes/ReviewSession";
import {
  deleteNoteCard,
  deleteNoteDeck,
  patchNoteDeck,
  postNoteCard,
  postNoteDeck,
} from "@/lib/api/client";
import type { NoteDeck, NotesResponse } from "@/lib/notes/types";
import { isCardDue } from "@/lib/notes/sm2";

type View = "list" | "deck" | "review";

type Props = {
  initial: NotesResponse;
  autoReview?: boolean;
  onRefresh: () => Promise<NotesResponse>;
};

function countDue(deck: NoteDeck, now = Date.now()): number {
  return deck.cards.filter((c) => isCardDue(c, now)).length;
}

export function NotesView({ initial, autoReview = false, onRefresh }: Props) {
  const [data, setData] = useState(initial);
  const [view, setView] = useState<View>(autoReview ? "review" : "list");
  const [activeDeckId, setActiveDeckId] = useState<string | null>(() => {
    if (!autoReview) return null;
    const now = Date.now();
    let best: NoteDeck | null = null;
    let bestDue = 0;
    for (const deck of initial.decks) {
      const due = countDue(deck, now);
      if (due > bestDue) {
        bestDue = due;
        best = deck;
      }
    }
    return best?.id ?? initial.decks[0]?.id ?? null;
  });
  const [creatingDeck, setCreatingDeck] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");
  const [composerFront, setComposerFront] = useState("");
  const [composerBack, setComposerBack] = useState("");
  const [editingName, setEditingName] = useState("");
  const [busy, setBusy] = useState(false);

  const activeDeck = useMemo(
    () => data.decks.find((d) => d.id === activeDeckId) ?? null,
    [data.decks, activeDeckId],
  );

  const refresh = useCallback(async () => {
    const next = await onRefresh();
    setData(next);
    return next;
  }, [onRefresh]);

  async function handleCreateDeck() {
    const name = newDeckName.trim();
    if (!name) return;
    setBusy(true);
    try {
      const res = await postNoteDeck(name);
      setData((prev) => ({
        ...prev,
        decks: [...prev.decks, res.deck],
        stats: {
          ...prev.stats,
          deckCount: prev.stats.deckCount + 1,
        },
      }));
      setActiveDeckId(res.deck.id);
      setEditingName(name);
      setCreatingDeck(false);
      setNewDeckName("");
      setView("deck");
    } finally {
      setBusy(false);
    }
  }

  async function handleAddCard() {
    if (!activeDeck) return;
    const front = composerFront.trim();
    const back = composerBack.trim();
    if (!front || !back) return;
    setBusy(true);
    try {
      const res = await postNoteCard(activeDeck.id, { front, back });
      setData((prev) => ({
        ...prev,
        decks: prev.decks.map((d) =>
          d.id === activeDeck.id
            ? { ...d, cards: [...d.cards, res.card], updatedAt: Date.now() }
            : d,
        ),
        stats: {
          ...prev.stats,
          cardCount: prev.stats.cardCount + 1,
        },
      }));
      setComposerFront("");
      setComposerBack("");
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteCard(cardId: string) {
    if (!activeDeck) return;
    setBusy(true);
    try {
      await deleteNoteCard(cardId);
      setData((prev) => ({
        ...prev,
        decks: prev.decks.map((d) =>
          d.id === activeDeck.id
            ? {
                ...d,
                cards: d.cards.filter((c) => c.id !== cardId),
                updatedAt: Date.now(),
              }
            : d,
        ),
        stats: {
          ...prev.stats,
          cardCount: Math.max(0, prev.stats.cardCount - 1),
        },
      }));
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteDeck() {
    if (!activeDeck) return;
    if (!window.confirm(`Delete "${activeDeck.name}" and all its cards?`)) {
      return;
    }
    setBusy(true);
    try {
      await deleteNoteDeck(activeDeck.id);
      setData((prev) => ({
        ...prev,
        decks: prev.decks.filter((d) => d.id !== activeDeck.id),
        stats: {
          deckCount: prev.stats.deckCount - 1,
          cardCount: prev.stats.cardCount - activeDeck.cards.length,
          dueCount: prev.stats.dueCount - countDue(activeDeck),
          reviewedCount: prev.stats.reviewedCount,
        },
      }));
      setActiveDeckId(null);
      setView("list");
    } finally {
      setBusy(false);
    }
  }

  async function handleRenameDeck() {
    if (!activeDeck) return;
    const name = editingName.trim();
    if (!name || name === activeDeck.name) return;
    setBusy(true);
    try {
      const res = await patchNoteDeck(activeDeck.id, name);
      setData((prev) => ({
        ...prev,
        decks: prev.decks.map((d) =>
          d.id === activeDeck.id ? res.deck : d,
        ),
      }));
    } finally {
      setBusy(false);
    }
  }

  function startReview(deckId: string) {
    setActiveDeckId(deckId);
    setView("review");
  }

  function startReviewDue() {
    const now = Date.now();
    let best: NoteDeck | null = null;
    let bestDue = 0;
    for (const deck of data.decks) {
      const due = countDue(deck, now);
      if (due > bestDue) {
        bestDue = due;
        best = deck;
      }
    }
    if (best) startReview(best.id);
  }

  if (view === "review" && activeDeck) {
    return (
      <ReviewSession
        deck={activeDeck}
        dueOnly
        onBack={() => {
          setView("list");
          void refresh();
        }}
        onDeckUpdated={(deck) => {
          setData((prev) => ({
            ...prev,
            decks: prev.decks.map((d) => (d.id === deck.id ? deck : d)),
          }));
        }}
        onComplete={() => void refresh()}
      />
    );
  }

  if (view === "deck" && activeDeck) {
    return (
      <div className="notes-deck mx-auto w-full max-w-xl pb-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => setView("list")}
              className="focus-ring mb-3 font-meta text-ui-3xs uppercase tracking-wider text-ink-muted transition-colors hover:text-ink"
            >
              All decks
            </button>
            <input
              value={editingName || activeDeck.name}
              onChange={(e) => setEditingName(e.target.value)}
              onBlur={() => void handleRenameDeck()}
              className="notes-deck-name focus-ring w-full bg-transparent font-serif text-2xl tracking-tight text-ink"
              aria-label="Deck name"
            />
            <p className="mt-2 font-meta text-ui-3xs uppercase tracking-wider text-ink-muted">
              {activeDeck.cards.length} cards · {countDue(activeDeck)} due
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            {activeDeck.cards.length > 0 && (
              <Button
                type="button"
                variant="primary"
                size="small"
                onClick={() => startReview(activeDeck.id)}
              >
                Review
              </Button>
            )}
            <button
              type="button"
              onClick={() => void handleDeleteDeck()}
              disabled={busy}
              className="focus-ring inline-flex min-h-11 min-w-11 items-center justify-center text-ink-muted transition-colors hover:text-accent"
              aria-label="Delete deck"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>

        <div className="notes-composer mb-8 space-y-3 border-y border-border py-6">
          <p className="type-kicker-mark normal-case tracking-wider text-ink-muted">
            Add card
          </p>
          <input
            value={composerFront}
            onChange={(e) => setComposerFront(e.target.value)}
            placeholder="Front — question or prompt"
            className="notes-input focus-ring w-full"
          />
          <textarea
            value={composerBack}
            onChange={(e) => setComposerBack(e.target.value)}
            placeholder="Back — answer or takeaway"
            rows={3}
            className="notes-input focus-ring w-full resize-none"
          />
          <Button
            type="button"
            variant="secondary"
            size="small"
            disabled={busy || !composerFront.trim() || !composerBack.trim()}
            onClick={() => void handleAddCard()}
          >
            Save card
          </Button>
        </div>

        <ul className="space-y-2">
          {activeDeck.cards.map((card) => (
            <li key={card.id} className="notes-card-row">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">{card.front}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                  {card.back}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleDeleteCard(card.id)}
                disabled={busy}
                className="focus-ring shrink-0 p-2 text-ink-muted transition-colors hover:text-accent"
                aria-label="Delete card"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="notes-list mx-auto w-full max-w-xl pb-8">
      <header className="mb-10 flex items-end justify-between gap-4">
        <div>
          <p className="type-kicker-mark normal-case tracking-wider text-ink-muted">
            Review
          </p>
          <h1 className="type-display-xl mt-2 text-ink">Notes</h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {data.stats.dueCount > 0 && (
            <Button
              type="button"
              variant="primary"
              size="small"
              onClick={startReviewDue}
            >
              Review {data.stats.dueCount} due
            </Button>
          )}
          <button
            type="button"
            onClick={() => {
              setCreatingDeck(true);
              setNewDeckName("");
            }}
            className="notes-new-deck focus-ring inline-flex min-h-11 items-center gap-1.5 border border-border px-3 font-meta text-ui-3xs uppercase tracking-wider text-ink-muted transition-colors hover:bg-highlight hover:text-ink"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            New deck
          </button>
        </div>
      </header>

      {data.decks.length > 0 && (
        <div className="notes-stats mb-8 grid grid-cols-3 divide-x divide-border border-y border-border py-5">
          <div className="px-4">
            <p className="font-serif text-3xl leading-none tracking-tight text-ink">
              {data.stats.deckCount}
            </p>
            <p className="mt-2 font-meta text-ui-3xs uppercase tracking-wider text-ink-muted">
              decks
            </p>
          </div>
          <div className="px-4">
            <p className="font-serif text-3xl leading-none tracking-tight text-ink">
              {data.stats.cardCount}
            </p>
            <p className="mt-2 font-meta text-ui-3xs uppercase tracking-wider text-ink-muted">
              cards
            </p>
          </div>
          <div className="px-4">
            <p
              className={`font-serif text-3xl leading-none tracking-tight ${data.stats.dueCount > 0 ? "text-accent" : "text-ink"}`}
            >
              {data.stats.dueCount}
            </p>
            <p className="mt-2 font-meta text-ui-3xs uppercase tracking-wider text-ink-muted">
              due
            </p>
          </div>
        </div>
      )}

      {creatingDeck && (
        <div className="notes-modal mb-8 border border-border p-4">
          <p className="type-kicker-mark mb-3 normal-case tracking-wider text-ink-muted">
            New deck
          </p>
          <input
            value={newDeckName}
            onChange={(e) => setNewDeckName(e.target.value)}
            placeholder="Deck name"
            className="notes-input focus-ring mb-3 w-full"
            autoFocus
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="primary"
              size="small"
              disabled={busy || !newDeckName.trim()}
              onClick={() => void handleCreateDeck()}
            >
              Create
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="small"
              onClick={() => setCreatingDeck(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {data.decks.length === 0 ? (
        <div className="notes-empty border border-dashed border-border px-8 py-16 text-center">
          <Layers2
            className="mx-auto mb-4 h-6 w-6 text-ink-faint"
            aria-hidden
          />
          <p className="text-sm font-medium text-ink">No review cards yet</p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
            Finish a lesson and pass the quiz — cards save automatically for
            tomorrow&apos;s review. Or create your own deck.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {data.decks.map((deck) => {
            const due = countDue(deck);
            return (
              <li key={deck.id}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveDeckId(deck.id);
                    setEditingName(deck.name);
                    setView("deck");
                  }}
                  className="notes-deck-row focus-ring w-full text-left"
                >
                  <div className="min-w-0 flex-1">
                    <p className="notes-deck-row-kicker font-meta text-ui-3xs uppercase tracking-wider text-ink-muted">
                      {deck.sourceId ? "From lesson" : "Custom deck"}
                    </p>
                    <p className="notes-deck-row-title mt-1 text-ink">
                      {deck.name}
                    </p>
                    <p className="mt-1 text-sm text-ink-muted">
                      {deck.cards.length} cards
                      {due > 0 ? ` · ${due} due` : ""}
                    </p>
                  </div>
                  {due > 0 && (
                    <span className="notes-due-badge shrink-0 font-meta text-ui-3xs uppercase tracking-wider">
                      {due}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
