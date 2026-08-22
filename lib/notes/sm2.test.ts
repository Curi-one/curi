import { describe, expect, it } from "vitest";
import {
  createNoteCard,
  MS_PER_DAY,
  previewIntervals,
  rateCard,
} from "@/lib/notes/sm2";

describe("createNoteCard", () => {
  it("creates a card due now with SM-2 defaults", () => {
    const now = 1_700_000_000_000;
    const card = createNoteCard("Q", "A", { now, dueInDays: 0 });
    expect(card.front).toBe("Q");
    expect(card.back).toBe("A");
    expect(card.ease).toBe(2.5);
    expect(card.interval).toBe(0);
    expect(card.reps).toBe(0);
    expect(card.due).toBe(now);
  });

  it("can schedule first review for tomorrow", () => {
    const now = 1_700_000_000_000;
    const card = createNoteCard("Q", "A", { now, dueInDays: 1 });
    expect(card.due).toBe(now + MS_PER_DAY);
  });
});

describe("rateCard", () => {
  const now = 1_700_000_000_000;

  it("Again resets reps and schedules one day out", () => {
    const card = createNoteCard("Q", "A", { now });
    const rated = rateCard({ ...card, reps: 3, interval: 10 }, 1, now);
    expect(rated.reps).toBe(0);
    expect(rated.interval).toBe(1);
    expect(rated.due).toBe(now + MS_PER_DAY);
    expect(rated.ease).toBeLessThan(2.5);
  });

  it("Good on first review sets one-day interval and increments reps", () => {
    const card = createNoteCard("Q", "A", { now });
    const rated = rateCard(card, 3, now);
    expect(rated.reps).toBe(1);
    expect(rated.interval).toBe(1);
    expect(rated.due).toBe(now + MS_PER_DAY);
  });

  it("Good on second review sets six-day interval", () => {
    const card = { ...createNoteCard("Q", "A", { now }), reps: 1, interval: 1 };
    const rated = rateCard(card, 3, now);
    expect(rated.reps).toBe(2);
    expect(rated.interval).toBe(6);
    expect(rated.due).toBe(now + 6 * MS_PER_DAY);
  });

  it("Easy on first review schedules four days", () => {
    const card = createNoteCard("Q", "A", { now });
    const rated = rateCard(card, 4, now);
    expect(rated.interval).toBe(4);
    expect(rated.due).toBe(now + 4 * MS_PER_DAY);
  });
});

describe("previewIntervals", () => {
  it("returns day previews for each rating button", () => {
    const card = createNoteCard("Q", "A");
    expect(previewIntervals(card)).toEqual({
      again: 1,
      hard: 1,
      good: 1,
      easy: 4,
    });
  });
});
