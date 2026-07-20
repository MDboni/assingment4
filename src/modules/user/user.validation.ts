import { z } from "zod";

const updateProfileValidationSchema = z.object({
    body: z.object({
        name: z.string().min(2, "Name must be at least 2 characters").optional(),
        phone: z.string().min(6, "Phone number is too short").optional(),
        bio: z.string().max(1000).optional(),
    }),
});

const changePasswordValidationSchema = z.object({
    body: z.object({
        oldPassword: z.string().min(1, "Old password is required"),
        newPassword: z
            .string()
            .min(8, "New password must be at least 8 characters"),
    }),
});

export const userValidation = {
    updateProfileValidationSchema,
    changePasswordValidationSchema,
};
