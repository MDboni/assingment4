import { z } from "zod";

const createRentalValidationSchema = z.object({
    body: z
        .object({
            propertyId: z.uuid("propertyId must be a valid uuid"),
            moveInDate: z.iso.datetime("moveInDate must be an ISO date"),
            moveOutDate: z.iso.datetime("moveOutDate must be an ISO date").optional(),
            message: z.string().max(1000).optional(),
        })
        .refine(
            (data) =>
                !data.moveOutDate ||
                new Date(data.moveOutDate) > new Date(data.moveInDate),
            {
                message: "moveOutDate must be after moveInDate",
                path: ["moveOutDate"],
            }
        ),
});

export const rentalValidation = {
    createRentalValidationSchema,
};
