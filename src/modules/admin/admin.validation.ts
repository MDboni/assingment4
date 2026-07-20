import { z } from "zod";

const updateUserStatusValidationSchema = z.object({
    body: z.object({
        status: z.enum(["ACTIVE", "BANNED"], {
            message: "Status must be ACTIVE or BANNED",
        }),
    }),
});

export const adminValidation = {
    updateUserStatusValidationSchema,
};
