import { z } from "zod";

export const SeqOpenSchema = z.enum(["broad", "definition", "straight"]);
export const AnchorStyleSchema = z.enum(["example", "data", "story", "analogy"]);
export const LessonLengthSchema = z.enum(["short", "medium", "long"]);
export const RigorSchema = z.enum(["clean", "edges", "harder"]);
export const JargonHandlingSchema = z.enum(["always", "unusual", "skip"]);

export type SeqOpen = z.infer<typeof SeqOpenSchema>;
export type AnchorStyle = z.infer<typeof AnchorStyleSchema>;
export type LessonLength = z.infer<typeof LessonLengthSchema>;
export type Rigor = z.infer<typeof RigorSchema>;
export type JargonHandling = z.infer<typeof JargonHandlingSchema>;

export type LearningProfile = {
  seq: SeqOpen;
  anchor: AnchorStyle;
  length: LessonLength;
  rigor: Rigor;
  jargon: JargonHandling;
};

export const DEFAULT_LEARNING_PROFILE: LearningProfile = {
  seq: "straight",
  anchor: "example",
  length: "medium",
  rigor: "clean",
  jargon: "always",
};

export const LearningProfileSchema = z.object({
  seq: SeqOpenSchema,
  anchor: AnchorStyleSchema,
  length: LessonLengthSchema,
  rigor: RigorSchema,
  jargon: JargonHandlingSchema,
});

const SEQ_INSTRUCTIONS: Record<SeqOpen, string> = {
  broad: "Open with the broad picture and landscape before the specific point.",
  definition:
    "Open with a plain, direct definition before examples or implications.",
  straight: "Open straight into a concrete example or scenario — minimal preamble.",
};

const ANCHOR_INSTRUCTIONS: Record<AnchorStyle, string> = {
  example: "Illustrate with real-world examples, companies, and outcomes.",
  data: "Lean on numbers, data, and quantitative comparisons where possible.",
  story: "Use stories about people, founders, or investors to carry the idea.",
  analogy:
    "Explain through comparisons to concepts the learner likely already knows.",
};

const LENGTH_INSTRUCTIONS: Record<LessonLength, string> = {
  short: "~2 minute read: one tight opening plus one core paragraph.",
  medium: "~5 minute read: opening plus two substantive paragraphs.",
  long: "~10 minute read: opening plus three paragraphs with deeper follow-through.",
};

const RIGOR_INSTRUCTIONS: Record<Rigor, string> = {
  clean: "Keep explanations clean and to the point; avoid tangents.",
  edges:
    "Flag edge cases and messy real-world wrinkles as they naturally arise.",
  harder:
    "Include a harder follow-up question or challenge before the lesson ends.",
};

const JARGON_INSTRUCTIONS: Record<JargonHandling, string> = {
  always: "Define new terms inline when they first appear.",
  unusual: "Define only unusual or domain-specific terms; skip common ones.",
  skip: "Do not define terms inline — assume the learner will look them up.",
};

/** Human-readable stance line for the profile preview panel. */
export function learningProfileStance(profile: LearningProfile): string {
  const seqPhrase = {
    broad: "with the broad picture first",
    definition: "with a plain definition",
    straight: "straight into the example, no preamble",
  } as const;
  const anchorPhrase = {
    example: "real-world examples",
    data: "numbers and data",
    story: "stories about people",
    analogy: "comparisons to what you already know",
  } as const;
  const lengthWord = { short: "Short", medium: "Medium", long: "Long" } as const;
  const rigorPhrase = {
    clean: "kept clean and to the point",
    edges: "flagging edge cases as they come up",
    harder: "pushing with a harder follow-up",
  } as const;
  const jargonPhrase = {
    always: "defining new terms as they arrive",
    unusual: "defining only the unusual ones",
    skip: "assuming you'll look up anything unfamiliar",
  } as const;

  return `Lessons open ${seqPhrase[profile.seq]}, illustrated with ${anchorPhrase[profile.anchor]}. ${lengthWord[profile.length]}-length by default, ${rigorPhrase[profile.rigor]}, and ${jargonPhrase[profile.jargon]}.`;
}

/** Prompt lines injected into Perplexity lesson generation. */
export function learningProfilePromptLines(profile: LearningProfile): string[] {
  return [
    "Learner teaching preferences (apply to structure, tone, and length):",
    `- Opening: ${SEQ_INSTRUCTIONS[profile.seq]}`,
    `- Illustration: ${ANCHOR_INSTRUCTIONS[profile.anchor]}`,
    `- Length: ${LENGTH_INSTRUCTIONS[profile.length]}`,
    `- Challenge: ${RIGOR_INSTRUCTIONS[profile.rigor]}`,
    `- Terminology: ${JARGON_INSTRUCTIONS[profile.jargon]}`,
  ];
}

export function normalizeLearningProfile(raw: unknown): LearningProfile {
  const parsed = LearningProfileSchema.safeParse(raw);
  if (parsed.success) return parsed.data;

  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const obj = raw as Record<string, unknown>;
    return {
      seq: SeqOpenSchema.safeParse(obj.seq).success
        ? (obj.seq as SeqOpen)
        : DEFAULT_LEARNING_PROFILE.seq,
      anchor: AnchorStyleSchema.safeParse(obj.anchor).success
        ? (obj.anchor as AnchorStyle)
        : DEFAULT_LEARNING_PROFILE.anchor,
      length: normalizeLegacyLength(obj.length ?? obj.lessonDepth),
      rigor: RigorSchema.safeParse(obj.rigor).success
        ? (obj.rigor as Rigor)
        : DEFAULT_LEARNING_PROFILE.rigor,
      jargon: JargonHandlingSchema.safeParse(obj.jargon).success
        ? (obj.jargon as JargonHandling)
        : DEFAULT_LEARNING_PROFILE.jargon,
    };
  }

  return { ...DEFAULT_LEARNING_PROFILE };
}

/** Migrate legacy Short/Medium/Long chip labels from localStorage. */
function normalizeLegacyLength(value: unknown): LessonLength {
  if (typeof value !== "string") return DEFAULT_LEARNING_PROFILE.length;
  const lower = value.toLowerCase();
  if (LessonLengthSchema.safeParse(lower).success) return lower as LessonLength;
  const legacy: Record<string, LessonLength> = {
    quick: "short",
    standard: "medium",
    deep: "long",
    short: "short",
    medium: "medium",
    long: "long",
  };
  return legacy[lower] ?? DEFAULT_LEARNING_PROFILE.length;
}
