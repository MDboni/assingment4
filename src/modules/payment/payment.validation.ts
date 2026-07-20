import { z } from "zod";

const createPaymentValidationSchema = z.object({
    body: z.object({
        rentalRequestId: z.uuid("rentalRequestId must be a valid uuid"),
    }),
});

export const paymentValidation = {
    createPaymentValidationSchema,
};
