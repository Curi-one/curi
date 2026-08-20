import type { DepthSlug, LessonFeel, Source } from "@/lib/api/schemas";

export const DEFAULT_TIMEZONE = "Australia/Sydney";

export type CataloguePath = {
  id: string;
  topic: string;
  description: string;
  depth: DepthSlug;
  /** Browse category (F3). See docs/DATA.md taxonomy note. */
  category: string;
  tag?: string;
};

export type CatalogueBook = {
  id: string;
  title: string;
  author: string;
  description: string;
  pathCount: number;
  /** Browse category (F3). See docs/DATA.md taxonomy note. */
  category: string;
  tag?: string;
};

export type MockLessonContent = {
  title: string;
  body: string[];
  sources: Source[];
  quiz: {
    id: string;
    prompt: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
};

export type MockPath = {
  id: string;
  topic: string;
  depth: DepthSlug;
  clarifications: { questionId: string; answer: string }[];
  lessonTitles: string[];
  progress: number;
  status: "active" | "mastered" | "shelved";
  createdAt: string;
};

export const CATALOGUE_PATHS: CataloguePath[] = [
  {
    id: "catalogue-vc",
    topic: "Venture Capital",
    description:
      "How VC funds work and what first-time founders need before the first institutional round.",
    depth: "fluent",
    category: "Raising & deal terms",
    tag: "Fundraising",
  },
  {
    id: "catalogue-term-sheets",
    topic: "Term Sheets",
    description:
      "Valuation, preferences, and governance — the clauses that become real when you sign.",
    depth: "fluent",
    category: "Raising & deal terms",
    tag: "Deals",
  },
  {
    id: "catalogue-safe",
    topic: "SAFE Notes",
    description:
      "Simple until they convert. The ownership math founders need before the priced round.",
    depth: "essentials",
    category: "Raising & deal terms",
    tag: "Instruments",
  },
  {
    id: "catalogue-cap-table",
    topic: "Cap Tables",
    description:
      "Ownership, dilution, and option pools — the spreadsheet investors actually read.",
    depth: "essentials",
    category: "Raising & deal terms",
    tag: "Equity",
  },
  {
    id: "catalogue-unit-economics",
    topic: "Unit Economics",
    description:
      "CAC, LTV, payback, and the customer-level math investors expect you to know.",
    depth: "essentials",
    category: "While you're building",
    tag: "Metrics",
  },
  {
    id: "catalogue-business-models",
    topic: "Business Models",
    description:
      "How companies actually make money, and why the model matters more than the product.",
    depth: "essentials",
    category: "While you're building",
    tag: "Models",
  },
  {
    id: "catalogue-pricing-psychology",
    topic: "Pricing Psychology",
    description:
      "The perception games behind every price a customer agrees to pay.",
    depth: "essentials",
    category: "While you're building",
    tag: "Pricing",
  },
  {
    id: "catalogue-behavioral-economics",
    topic: "Behavioral Economics",
    description:
      "The cognitive biases that quietly shape decisions classical economics assumes away.",
    depth: "fluent",
    category: "Decisions & behavior",
    tag: "Economics",
  },
  {
    id: "catalogue-negotiation",
    topic: "Negotiation",
    description:
      "Leverage, anchoring, and the preparation that decides a deal before anyone speaks.",
    depth: "essentials",
    category: "Decisions & behavior",
    tag: "Negotiation",
  },
];

export const CATALOGUE_BOOKS: CatalogueBook[] = [
  {
    id: "book-thinking-fast",
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    description: "Biases, heuristics, and how we really decide.",
    pathCount: 12,
    category: "Behavioral economics",
    tag: "Decisions",
  },
  {
    id: "book-predictably-irrational",
    title: "Predictably Irrational",
    author: "Dan Ariely",
    description:
      "The behavioural economics of why people buy — anchoring, relativity, and the power of defaults.",
    pathCount: 9,
    category: "Behavioral economics",
    tag: "Pricing",
  },
  {
    id: "book-nudge",
    title: "Nudge",
    author: "Richard Thaler & Cass Sunstein",
    description:
      "Improving decisions without removing choice — the architecture behind every default.",
    pathCount: 8,
    category: "Behavioral economics",
    tag: "Design",
  },
  {
    id: "book-sapiens",
    title: "Sapiens",
    author: "Yuval Noah Harari",
    description: "A brief history of humankind in digestible paths.",
    pathCount: 18,
    category: "Founder mindset",
    tag: "History",
  },
  {
    id: "book-zero-to-one",
    title: "Zero to One",
    author: "Peter Thiel",
    description:
      "Monopoly, not competition, is the goal — what that means for how you build and pitch.",
    pathCount: 8,
    category: "Founder mindset",
    tag: "Strategy",
  },
];

export const MOCK_PATH_1_LESSONS: Record<number, MockLessonContent> = {
  0: {
    title: "What is the Fermi paradox?",
    body: [
      "The **Fermi paradox** asks why, given the vast number of stars and potentially habitable planets, we have not yet detected signs of intelligent extraterrestrial life. [1]",
      "Enrico Fermi reportedly posed the question over lunch in 1950: *Where is everybody?* The scale of the Milky Way suggests many opportunities for life to arise and spread. [2]",
      "Possible explanations range from the **Rare Earth hypothesis** (complex life is uncommon) to the **Great Filter** (civilizations tend to destroy themselves before becoming interstellar).",
    ],
    sources: [
      {
        title: "NASA — Astrobiology",
        url: "https://astrobiology.nasa.gov/",
      },
      {
        title: "SETI Institute",
        url: "https://www.seti.org/",
      },
    ],
    quiz: [
      {
        id: "fp-q1",
        prompt: "Who is the paradox commonly named after?",
        options: ["Carl Sagan", "Enrico Fermi", "Frank Drake", "Isaac Asimov"],
        correctIndex: 1,
        explanation:
          "Enrico Fermi posed the famous lunch-table question in 1950.",
      },
      {
        id: "fp-q2",
        prompt: "What does the paradox primarily concern?",
        options: [
          "Dark matter detection",
          "Missing extraterrestrial evidence",
          "Black hole radiation",
          "Planetary formation rates",
        ],
        correctIndex: 1,
        explanation:
          "It highlights the tension between high probability of life and lack of contact.",
      },
    ],
  },
  1: {
    title: "The Drake equation",
    body: [
      "Frank Drake formulated an equation to estimate the number of active, communicative civilizations in our galaxy.",
      "It multiplies factors like star formation rate, fraction of stars with planets, habitable planets per star, and the fraction that develop intelligent life.",
      "Each term carries enormous uncertainty — the equation is useful for structuring debate rather than producing a precise number.",
    ],
    sources: [
      {
        title: "Frank Drake — SETI",
        url: "https://www.seti.org/drake-equation/",
      },
    ],
    quiz: [
      {
        id: "de-q1",
        prompt: "The Drake equation estimates what quantity?",
        options: [
          "Number of habitable exoplanets",
          "Communicative civilizations in the galaxy",
          "Age of the universe",
          "Rate of supernova events",
        ],
        correctIndex: 1,
        explanation:
          "Drake's formula targets N — detectable civilizations in the Milky Way.",
      },
    ],
  },
};

function defaultLessonContent(
  pathTopic: string,
  lessonIndex: number,
  title: string,
): MockLessonContent {
  return {
    title,
    body: [
      `Welcome to lesson ${lessonIndex + 1} of **${pathTopic}**.`,
      "This is mock content for frontend-first development. Real lesson bodies will come from Perplexity on cache miss.",
      "Focus on one clear idea per paragraph — Curi lessons are meant to be read in a few minutes.",
    ],
    sources: [
      {
        title: "Curi mock source",
        url: "https://curi.one/",
      },
    ],
    quiz: [
      {
        id: `mock-${lessonIndex}-q1`,
        prompt: `What is the main topic of lesson ${lessonIndex + 1}?`,
        options: [pathTopic, "Unrelated topic", "Random trivia", "None of these"],
        correctIndex: 0,
        explanation: `This lesson continues your path on ${pathTopic}.`,
      },
    ],
  };
}

export function getLessonContent(
  pathId: string,
  pathTopic: string,
  lessonIndex: number,
  title: string,
): MockLessonContent {
  if (pathId === "mock-path-1" && MOCK_PATH_1_LESSONS[lessonIndex]) {
    return MOCK_PATH_1_LESSONS[lessonIndex];
  }
  return defaultLessonContent(pathTopic, lessonIndex, title);
}

export const DEPTH_LESSON_RANGES: Record<
  DepthSlug,
  { min: number; max: number }
> = {
  essentials: { min: 5, max: 9 },
  fluent: { min: 10, max: 18 },
  thorough: { min: 19, max: 35 },
};

/** Deterministic lesson count within depth band from topic hash. */
export function lessonCountForDepth(topic: string, depth: DepthSlug): number {
  const { min, max } = DEPTH_LESSON_RANGES[depth];
  const hash = hashString(topic + depth);
  return min + (hash % (max - min + 1));
}

export function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function generateLessonTitles(
  topic: string,
  depth: DepthSlug,
  count: number,
): string[] {
  return Array.from({ length: count }, (_, i) => {
    const variants = [
      `Foundations of ${topic}`,
      `Key concepts in ${topic}`,
      `Going deeper: ${topic}`,
      `Applied ${topic}`,
      `Common misconceptions about ${topic}`,
      `Case study: ${topic}`,
      `Advanced ideas in ${topic}`,
      `Putting ${topic} together`,
    ];
    return `${variants[i % variants.length]} (${i + 1})`;
  });
}

export const CLARIFY_QUESTION_BANK: {
  id: string;
  prompt: string;
  options: string[];
}[] = [
  {
    id: "focus",
    prompt: "What do you most want to get from this path?",
    options: [
      "Practical skills I can use",
      "Big-picture understanding",
      "Exam or interview prep",
      "General curiosity",
    ],
  },
  {
    id: "background",
    prompt: "How familiar are you with this topic already?",
    options: [
      "Complete beginner",
      "Heard the basics",
      "Some experience",
      "Already quite knowledgeable",
    ],
  },
  {
    id: "angle",
    prompt: "Which angle interests you most?",
    options: [
      "Historical context",
      "How it works today",
      "Future implications",
      "Ethics and trade-offs",
    ],
  },
];

export function clarifyQuestionsForTopic(topic: string) {
  const count = 1 + (hashString(topic) % 3);
  const start = hashString(topic) % CLARIFY_QUESTION_BANK.length;
  const questions = [];
  for (let i = 0; i < count; i++) {
    questions.push(
      CLARIFY_QUESTION_BANK[(start + i) % CLARIFY_QUESTION_BANK.length],
    );
  }
  return questions;
}

export type ActivityRecord = {
  courseId: string;
  lessonIndex: number;
  activityDate: string;
  lessonFeel?: LessonFeel;
};

/** Seed activity dates for default member streak / heatmap (ISO dates). */
export function seedActivityDates(today: string): string[] {
  const dates: string[] = [];
  const base = new Date(`${today}T12:00:00`);
  for (let i = 1; i <= 5; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

export const DEFAULT_MEMBER = {
  sessionId: "member-default",
  email: "demo@curi.one",
  name: "Demo Member",
  plan: "free" as const,
};

export function createDefaultMemberPaths(today: string): MockPath[] {
  return [
    {
      id: "mock-path-1",
      topic: "The Fermi paradox",
      depth: "essentials",
      clarifications: [{ questionId: "focus", answer: "General curiosity" }],
      lessonTitles: generateLessonTitles("The Fermi paradox", "essentials", 7),
      progress: 0,
      status: "active",
      createdAt: today,
    },
    {
      id: "mock-path-2",
      topic: "Introductory game theory",
      depth: "fluent",
      clarifications: [{ questionId: "focus", answer: "Practical skills" }],
      lessonTitles: generateLessonTitles(
        "Introductory game theory",
        "fluent",
        12,
      ),
      progress: 3,
      status: "active",
      createdAt: today,
    },
  ];
}

export function createDefaultMemberActivity(
  today: string,
): ActivityRecord[] {
  const historical = seedActivityDates(today).map((date) => ({
    courseId: "mock-path-2",
    lessonIndex: 0,
    activityDate: date,
  }));
  return [
    ...historical,
    {
      courseId: "mock-path-2",
      lessonIndex: 3,
      activityDate: today,
      lessonFeel: "just_right" as LessonFeel,
    },
  ];
}

export const PENDING_COURSE_TTL_MS = 24 * 60 * 60 * 1000;
