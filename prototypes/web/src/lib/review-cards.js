import { getLessonCards } from "@/lib/lesson-content";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** SM-2 card defaults — due tomorrow for lesson-sourced review cards. */
export function makeReviewCard(front, back, { dueTomorrow = true } = {}) {
  return {
    id: Math.random().toString(36).slice(2, 9),
    front,
    back,
    ease: 2.5,
    interval: 0,
    reps: 0,
    due: dueTomorrow ? Date.now() + MS_PER_DAY : Date.now(),
  };
}

/** Build (or refresh) the review deck saved after a lesson quiz. */
export function buildLessonReviewDeck(course, lessonIndex) {
  const lessonNumber = lessonIndex + 1;
  const cards = getLessonCards(course.topic)
    .slice(0, 6)
    .map(({ front, back }) => makeReviewCard(front, back, { dueTomorrow: true }));

  return {
    id: `deck-${course.id}-L${lessonIndex}`,
    sourceId: `${course.id}-L${lessonIndex}`,
    name: `${course.topic} · Day ${lessonNumber}`,
    lessonIndex,
    courseId: course.id,
    cards,
  };
}

export function countDueCards(cardSets, now = Date.now()) {
  return cardSets.reduce(
    (sum, set) => sum + set.cards.filter((c) => (c.due ?? 0) <= now).length,
    0
  );
}

/** Flat list of all due cards across decks, for a combined review session. */
export function collectDueCards(cardSets, now = Date.now()) {
  const items = [];
  for (const set of cardSets) {
    for (const card of set.cards) {
      if ((card.due ?? 0) <= now) {
        items.push({ set, card });
      }
    }
  }
  return items;
}
