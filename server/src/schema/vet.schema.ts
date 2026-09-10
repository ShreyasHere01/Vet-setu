import { z } from "zod";

export const slotSchema = z.object({
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
});

