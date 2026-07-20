import { z } from "zod";

const registerValidationSchema = z.object({
    body: z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        role: z.enum(["TENANT", "LANDLORD"], {
            message: "Role must be TENANT or LANDLORD",
        }),
        phone: z.string().optional(),
        bio: z.string().optional(),
    }),
});

const loginValidationSchema = z.object({
    body: z.object({
        email: z.email("Invalid email address"),
        password: z.string().min(1, "Password is required"),
    }),
});

export const authValidation = {
    registerValidationSchema,
    loginValidationSchema,
};
