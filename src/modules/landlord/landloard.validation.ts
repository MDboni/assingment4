import { z } from "zod";

const createPropertyValidationSchema = z.object({
    body: z.object({
        title: z.string().min(5, "Title must be at least 5 characters"),
        description: z.string().min(20, "Description must be at least 20 characters"),
        categoryId: z.uuid("categoryId must be a valid uuid"),
        address: z.string().min(5, "Address is required"),
        city: z.string().min(2, "City is required"),
        area: z.string().min(2, "Area is required"),
        monthlyRent: z.number().positive("Monthly rent must be a positive number"),
        securityDeposit: z.number().nonnegative("Security deposit cannot be negative"),
        bedrooms: z.number().int().nonnegative(),
        bathrooms: z.number().int().nonnegative(),
        sizeSqft: z.number().int().positive("Size must be a positive number"),
        amenities: z.array(z.string()).default([]),
        images: z.array(z.url("Each image must be a valid URL")).default([]),
        availableFrom: z.iso.datetime("availableFrom must be an ISO date").optional(),

        status: z.enum(["AVAILABLE", "UNAVAILABLE", "ARCHIVED"]).optional(),
    }),
});

const updatePropertyValidationSchema = z.object({
    body: createPropertyValidationSchema.shape.body.partial(),
});

const decideRentalRequestValidationSchema = z.object({
    body: z.object({
        status: z.enum(["APPROVED", "REJECTED"], {
            message: "Status must be APPROVED or REJECTED",
        }),
        landloardNote: z.string().max(1000).optional(),
    }),
});

export const landlordValidation = {
    createPropertyValidationSchema,
    updatePropertyValidationSchema,
    decideRentalRequestValidationSchema,
};
