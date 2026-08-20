import { z } from "zod";

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

export const ClarifyResponseSchema = z.object({
  questions: z.array(ClarifyQuestionSchema).min(1).max(3),
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

export const FeedResponseSchema = z.object({
  due: z.array(PathSummarySchema),
  done: z.array(PathSummarySchema),
});
export type FeedResponse = z.infer<typeof FeedResponseSchema>;

export const SourceSchema = z.object({
  title: z.string(),
  url: z.string().url(),
});
export type Source = z.infer<typeof SourceSchema>;

export const LessonResponseSchema = z.object({
  title: z.string(),
  body: z.array(z.string()),
  sources: z.array(SourceSchema),
});
export type LessonResponse = z.infer<typeof LessonResponseSchema>;

export const QuizQuestionSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  options: z.array(z.string()).min(2),
  correctIndex: z.number().int().nonnegative(),
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
  url: z.null(),
  message: z.string(),
});
export type BillingCheckoutResponse = z.infer<
  typeof BillingCheckoutResponseSchema
>;

export const ApiErrorSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;
