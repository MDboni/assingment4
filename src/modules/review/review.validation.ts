import { z } from "zod";

const createReviewValidationSchema = z.object({
    body: z.object({
        rentalRequestId: z.uuid("rentalRequestId must be a valid uuid"),
        rating: z
            .number()
            .int("Rating must be a whole number")
            .min(1, "Rating must be between 1 and 5")
            .max(5, "Rating must be between 1 and 5"),
        comment: z.string().max(1000).optional(),
    }),
});

export const reviewValidation = {
    createReviewValidationSchema,
};
