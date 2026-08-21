import { z } from "zod";
import { DETAILS_MAX_CHARS } from "@/lib/clarify/details";

export const DepthSlugSchema = z.enum(["essentials", "fluent", "thorough"]);
export type DepthSlug = z.infer<typeof DepthSlugSchema>;

export const LessonFeelSchema = z.enum([
  "too_easy",
  "just_right",
  "too_hard",
  "confusing",
]);
export type LessonFeel = z.infer<typeof LessonFeelSchema>;

export const PlanSchema = z.enum(["free", "academy"]);
export type Plan = z.infer<typeof PlanSchema>;

export const ClarifyQuestionSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  options: z.array(z.string()).min(2),
});
export type ClarifyQuestion = z.infer<typeof ClarifyQuestionSchema>;

export const DepthOptionSchema = z.object({
  slug: DepthSlugSchema,
  label: z.string().min(1),
  subcopy: z.string().min(1),
});
export type DepthOption = z.infer<typeof DepthOptionSchema>;

export const ClarifyRequestSchema = z.object({
  topic: z.string().min(1),
  previousAnswers: z
    .array(
      z.object({
        questionId: z.string(),
        answer: z.string(),
      }),
    )
    .optional(),
});
export type ClarifyRequest = z.infer<typeof ClarifyRequestSchema>;

const DEPTH_SLUGS = ["essentials", "fluent", "thorough"] as const;

export const ClarifyResponseSchema = z
  .object({
    questions: z.array(ClarifyQuestionSchema).min(1).max(3),
    depthOptions: z.array(DepthOptionSchema).length(3).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.depthOptions) return;
    const slugs = data.depthOptions.map((o) => o.slug).sort();
    const expected = [...DEPTH_SLUGS].sort();
    if (slugs.join(",") !== expected.join(",")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "depthOptions must include exactly essentials, fluent, and thorough",
        path: ["depthOptions"],
      });
    }
  });
export type ClarifyResponse = z.infer<typeof ClarifyResponseSchema>;

export const CourseCreateRequestSchema = z.object({
  topic: z.string().min(1),
  depth: DepthSlugSchema,
  clarifications: z.array(
    z.object({
      questionId: z.string(),
      answer: z.string(),
    }),
  ),
  details: z.string().max(DETAILS_MAX_CHARS).optional(),
});
export type CourseCreateRequest = z.infer<typeof CourseCreateRequestSchema>;

export const CourseCreateResponseSchema = z.object({
  courseId: z.string(),
  outline: z.array(
    z.object({
      index: z.number().int().nonnegative(),
      title: z.string(),
    }),
  ),
});
export type CourseCreateResponse = z.infer<typeof CourseCreateResponseSchema>;

export const PathSummarySchema = z.object({
  id: z.string(),
  topic: z.string(),
  progress: z.number().int().nonnegative(),
  totalLessons: z.number().int().positive(),
  depth: DepthSlugSchema,
});
export type PathSummary = z.infer<typeof PathSummarySchema>;

/** Chronological Today feed item status (F2 lesson feed by day). */
export const FeedItemStatusSchema = z.enum([
  "available",
  "completed",
  "locked",
  "overdue",
]);
export type FeedItemStatus = z.infer<typeof FeedItemStatusSchema>;

export const FeedLessonItemSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  topic: z.string(),
  lessonIndex: z.number().int().nonnegative(),
  title: z.string(),
  lessonNumber: z.number().int().positive(),
  totalLessons: z.number().int().positive(),
  /** 0 = today, -1 = tomorrow (locked preview), >0 = that many days in the past. */
  daysAgo: z.number().int(),
  status: FeedItemStatusSchema,
});
export type FeedLessonItem = z.infer<typeof FeedLessonItemSchema>;

export const FeedDayGroupSchema = z.object({
  daysAgo: z.number().int(),
  label: z.string(),
  items: z.array(FeedLessonItemSchema),
});
export type FeedDayGroup = z.infer<typeof FeedDayGroupSchema>;

export const FeedResponseSchema = z.object({
  due: z.array(PathSummarySchema),
  done: z.array(PathSummarySchema),
  /** Chronological lesson feed grouped by day (F2) — tomorrow, today, then past. */
  groups: z.array(FeedDayGroupSchema),
});
export type FeedResponse = z.infer<typeof FeedResponseSchema>;

export const SourceSchema = z.object({
  title: z.string(),
  url: z.string().url(),
});
export type Source = z.infer<typeof SourceSchema>;

export const LessonVisualSchema = z.object({
  title: z.string().min(1),
  caption: z.string().min(1),
  equation: z.string().min(1).optional(),
  formulaNote: z.string().min(1).optional(),
  /** Optional public image URL when a real figure helps; omit if none. */
  imageUrl: z.string().url().optional(),
});
export type LessonVisualBlock = z.infer<typeof LessonVisualSchema>;

export const ShareableFactSchema = z.object({
  fact: z.string().min(1),
  reflection: z.string().min(1),
});
export type ShareableFactPayload = z.infer<typeof ShareableFactSchema>;

export const LessonResponseSchema = z.object({
  title: z.string(),
  /** Markdown paragraphs exactly as generated (split on blank lines only). */
  body: z.array(z.string()),
  sources: z.array(SourceSchema),
  /** Exactly three key takeaways when generated; optional for older cache rows. */
  takeaways: z.array(z.string().min(1)).min(1).max(5).optional(),
  shareableFact: ShareableFactSchema.optional(),
  /** Structured visuals when the lesson benefits from a figure/equation. */
  visuals: z.array(LessonVisualSchema).max(3).optional(),
});
export type LessonResponse = z.infer<typeof LessonResponseSchema>;

export const QuizQuestionSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  options: z.array(z.string()).min(2),
  correctIndex: z.number().int().nonnegative(),
  /** Optional per-answer why copy for QuizFlow (also returned on submit feedback). */
  explanation: z.string().optional(),
  /** Optional citation shown after why text (FLOWS: right/wrong + why + source). */
  source: SourceSchema.optional(),
});
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

export const QuizResponseSchema = z.object({
  questions: z.array(QuizQuestionSchema).min(1),
});
export type QuizResponse = z.infer<typeof QuizResponseSchema>;

export const QuizSubmitRequestSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      selectedIndex: z.number().int().nonnegative(),
    }),
  ),
  lessonFeel: LessonFeelSchema,
});
export type QuizSubmitRequest = z.infer<typeof QuizSubmitRequestSchema>;

export const QuizFeedbackItemSchema = z.object({
  questionId: z.string(),
  correct: z.boolean(),
  explanation: z.string(),
  correctIndex: z.number().int().nonnegative(),
});
export type QuizFeedbackItem = z.infer<typeof QuizFeedbackItemSchema>;

export const QuizSubmitResponseSchema = z.object({
  feedback: z.array(QuizFeedbackItemSchema),
  complete: z.boolean(),
  streak: z.number().int().nonnegative().optional(),
  pathsStillDue: z.number().int().nonnegative().optional(),
  pathMastered: z.boolean().optional(),
});
export type QuizSubmitResponse = z.infer<typeof QuizSubmitResponseSchema>;

export const LibraryResponseSchema = z.object({
  exploring: z.array(PathSummarySchema),
  mastered: z.array(PathSummarySchema),
  shelved: z.array(PathSummarySchema),
});
export type LibraryResponse = z.infer<typeof LibraryResponseSchema>;

export const AuthRequestSchema = z.object({
  email: z.string().email(),
  code: z.string().optional(),
  name: z.string().optional(),
  /** Post-auth destination — embedded in magic-link callback when not /today. */
  returnTo: z.string().optional(),
});
export type AuthRequest = z.infer<typeof AuthRequestSchema>;

export const UserSessionSchema = z.object({
  kind: z.enum(["guest", "member"]),
  name: z.string().optional(),
  email: z.string().email().optional(),
  plan: PlanSchema,
});
export type UserSession = z.infer<typeof UserSessionSchema>;

export const BillingCheckoutResponseSchema = z.object({
  url: z.string().nullable(),
  message: z.string().optional(),
  code: z.string().optional(),
});
export type BillingCheckoutResponse = z.infer<
  typeof BillingCheckoutResponseSchema
>;

export const BillingPortalResponseSchema = z.object({
  url: z.string().nullable(),
  message: z.string().optional(),
  code: z.string().optional(),
});
export type BillingPortalResponse = z.infer<typeof BillingPortalResponseSchema>;

export const ApiErrorSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;
