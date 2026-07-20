import { z } from "zod";

const createCategoryValidationSchema = z.object({
    body: z.object({
        name: z.string().min(2, "Category name must be at least 2 characters"),
        description: z.string().max(500).optional(),
    }),
});

const updateCategoryValidationSchema = z.object({
    body: z.object({
        name: z.string().min(2, "Category name must be at least 2 characters").optional(),
        description: z.string().max(500).optional(),
        isActive: z.boolean().optional(),
    }),
});

export const categoryValidation = {
    createCategoryValidationSchema,
    updateCategoryValidationSchema,
};
