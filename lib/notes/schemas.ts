import { z } from "zod";

export const ReviewRatingSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
]);

export const NoteCardSchema = z.object({
  id: z.string(),
  front: z.string(),
  back: z.string(),
  ease: z.number(),
  interval: z.number(),
  reps: z.number().int().nonnegative(),
  due: z.number(),
  createdAt: z.number(),
});

export const NoteDeckSchema = z.object({
  id: z.string(),
  name: z.string(),
  sourceId: z.string().nullable().optional(),
  courseId: z.string().optional(),
  lessonIndex: z.number().int().nonnegative().optional(),
  cards: z.array(NoteCardSchema),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const NotesStatsSchema = z.object({
  deckCount: z.number().int().nonnegative(),
  cardCount: z.number().int().nonnegative(),
  dueCount: z.number().int().nonnegative(),
  reviewedCount: z.number().int().nonnegative(),
});

export const NotesResponseSchema = z.object({
  decks: z.array(NoteDeckSchema),
  stats: NotesStatsSchema,
});

export const CreateDeckRequestSchema = z.object({
  name: z.string().trim().min(1).max(120),
});

export const UpdateDeckRequestSchema = z.object({
  name: z.string().trim().min(1).max(120),
});

export const CreateCardRequestSchema = z.object({
  front: z.string().trim().min(1).max(2000),
  back: z.string().trim().min(1).max(4000),
});

export const UpdateCardRequestSchema = z
  .object({
    front: z.string().trim().min(1).max(2000).optional(),
    back: z.string().trim().min(1).max(4000).optional(),
  })
  .refine((obj) => obj.front !== undefined || obj.back !== undefined, {
    message: "At least one field required",
  });

export const ReviewCardRequestSchema = z.object({
  cardId: z.string().min(1),
  rating: ReviewRatingSchema,
});
