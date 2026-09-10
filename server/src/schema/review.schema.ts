import {z} from "zod";

export const reviewSchema = z.object({
    vetId:z.number().int().positive(),
    rating:z.number().int().min(1).max(5),
    comment:z.string().max(500).optional()
});