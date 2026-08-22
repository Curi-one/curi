import { z } from "zod";
import {
  AnchorStyleSchema,
  JargonHandlingSchema,
  LessonLengthSchema,
  RigorSchema,
  SeqOpenSchema,
} from "@/lib/profile/learning-profile";

export const PatchPreferencesSchema = z
  .object({
    seq: SeqOpenSchema.optional(),
    anchor: AnchorStyleSchema.optional(),
    length: LessonLengthSchema.optional(),
    rigor: RigorSchema.optional(),
    jargon: JargonHandlingSchema.optional(),
    emailEnabled: z.boolean().optional(),
    emailTime: z.string().min(1).max(40).optional(),
    emailFormat: z.string().min(1).max(40).optional(),
    emailWeekends: z.boolean().optional(),
    emailWeeklyDigest: z.boolean().optional(),
    notesAutoSave: z.boolean().optional(),
    notesShowDueOnToday: z.boolean().optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "At least one field required",
  });

export type PatchPreferencesInput = z.infer<typeof PatchPreferencesSchema>;
