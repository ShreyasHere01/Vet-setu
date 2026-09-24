import { z } from "zod";

export const reviewSchema = z.object({
  appointmentId: z.number(),
  rating: z
    .string()
    .min(1, "Please select a rating"),
  comment: z
    .string()
    .max(500, "Comment must be less than 500 characters or less")
    .optional(),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;