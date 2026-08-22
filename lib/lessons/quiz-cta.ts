import { hashTopicString } from "@/lib/ui/topic-swatch";

type QuizCta = {
  label: string;
  hint: string;
};

const QUIZ_CTAS: QuizCta[] = [
  {
    label: "Think it stuck? Prove it.",
    hint: "A few questions — no peeking back.",
  },
  {
    label: "Your turn to connect the dots",
    hint: "See if the idea holds without the text in front of you.",
  },
  {
    label: "Ready to stress-test what you read?",
    hint: "Short quiz. Wrong answers are part of learning.",
  },
  {
    label: "Could you explain it to a friend?",
    hint: "Answer honestly — the quiz will show you where.",
  },
  {
    label: "What would you do with this tomorrow?",
    hint: "Three questions to sharpen the takeaway.",
  },
  {
    label: "Still curious? Good — try this.",
    hint: "A quick check before you move on.",
  },
];

/** Friendly, thought-provoking quiz CTA copy — deterministic per lesson. */
export function quizCtaCopy(
  lessonTitle: string,
  topic: string,
  lessonIndex: number,
): QuizCta {
  const key = `${topic}|${lessonTitle}|${lessonIndex}`;
  const h = hashTopicString(key);
  return QUIZ_CTAS[h % QUIZ_CTAS.length]!;
}
