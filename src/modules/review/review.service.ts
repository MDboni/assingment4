import { StatusCodes as httpStatus } from "http-status-codes";
import { AppError } from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { CreateReviewPayload } from "./review.interface";

// শুধু নিজের COMPLETED rental-এর জন্যই review দেওয়া যাবে, প্রতি rental-এ একটাই
const createReview = async (tenantId: string, payload: CreateReviewPayload) => {
    const rental = await prisma.rentalRequest.findFirst({
        where: {
            id: payload.rentalRequestId,
            tenantId,
            status: "COMPLETED",
        },
    });

    if (!rental) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            "You can only review your own completed rental"
        );
    }

    const existingReview = await prisma.review.findUnique({
        where: { rentalRequestId: rental.id },
    });

    if (existingReview) {
        throw new AppError(
            httpStatus.CONFLICT,
            "You have already reviewed this rental"
        );
    }

    return prisma.review.create({
        data: {
            rentalRequestId: rental.id,
            propertyId: rental.propertyId,
            tenantId,
            rating: payload.rating,
            comment: payload.comment,
        },
        include: {
            property: { select: { id: true, title: true } },
            tenant: { select: { id: true, name: true } },
        },
    });
};

export const reviewService = {
    createReview,
};
