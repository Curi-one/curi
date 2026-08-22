type QuizItem = {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

type BuildLessonNoteCardsInput = {
  topic: string;
  lessonTitle: string;
  quiz: QuizItem[];
  takeaways: string[];
};

const MAX_CARDS = 6;

/** Build review cards from lesson quiz + takeaways (prototype-inspired). */
export function buildLessonNoteCards({
  topic,
  lessonTitle,
  quiz,
  takeaways,
}: BuildLessonNoteCardsInput): { front: string; back: string }[] {
  const cards: { front: string; back: string }[] = [];

  for (const q of quiz) {
    if (cards.length >= MAX_CARDS) break;
    const correct = q.options[q.correctIndex] ?? "";
    cards.push({
      front: q.prompt,
      back: [correct, q.explanation].filter(Boolean).join(" — "),
    });
  }

  for (const takeaway of takeaways) {
    if (cards.length >= MAX_CARDS) break;
    const trimmed = takeaway.trim();
    if (!trimmed) continue;
    cards.push({
      front: `Takeaway · ${lessonTitle}`,
      back: trimmed,
    });
  }

  if (cards.length === 0) {
    cards.push({
      front: `Core idea · ${topic}`,
      back: `Review the main decision trade-off from "${lessonTitle}".`,
    });
  }

  return cards.slice(0, MAX_CARDS);
}

export function lessonDeckName(topic: string, lessonIndex: number): string {
  return `${topic} · Day ${lessonIndex + 1}`;
}

export function lessonDeckSourceId(courseId: string, lessonIndex: number): string {
  return `${courseId}-L${lessonIndex}`;
}
