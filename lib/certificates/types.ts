import { z } from "zod";

export const TrackCertificateSchema = z.object({
  courseId: z.string(),
  recipientName: z.string().min(1),
  topic: z.string().min(1),
  lessonCount: z.number().int().positive(),
  studyMinutes: z.number().int().positive(),
  streakAtCompletion: z.number().int().nonnegative(),
  completedAt: z.string().datetime(),
  certificateId: z.string().min(1),
});

export type TrackCertificate = z.infer<typeof TrackCertificateSchema>;

export const TrackCertificateResponseSchema = z.object({
  certificate: TrackCertificateSchema,
});

export type TrackCertificateResponse = z.infer<
  typeof TrackCertificateResponseSchema
>;
