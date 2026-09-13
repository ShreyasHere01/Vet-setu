import { z } from "zod";

export const reviewSchema = z.object({
  appointmentId: z.number(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export type ReviewInput = z.infer<typeof reviewSchema>;