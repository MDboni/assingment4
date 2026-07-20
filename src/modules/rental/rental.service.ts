import httpStatus from "http-status";
import { AppError } from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { calculatePagination } from "../../utils/pagination";
import { Prisma } from "../../../prisma/generated/prisma/client";
import { TJwtPayload } from "../../utils/jwt";
import {
    CreateRentalPayload,
    ONGOING_RENTAL_STATUSES,
    RENTAL_SORTABLE_FIELDS,
    RentalFilterQuery,
} from "./rental.interface";

// Prisma Decimal সরাসরি JSON-এ ভালোভাবে যায় না, তাই number-এ বদলে দিচ্ছি
const formatAmount = <T extends { quotedAmount: unknown }>(rental: T) => ({
    ...rental,
    quotedAmount: Number(rental.quotedAmount),
});

const createRental = async (tenantId: string, payload: CreateRentalPayload) => {
    const moveInDate = new Date(payload.moveInDate);

    // আজকের দিনের শুরু ধরে তুলনা, যাতে আজকের তারিখও চলে
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (moveInDate < today) {
        throw new AppError(httpStatus.BAD_REQUEST, "Move-in date cannot be in the past");
    }

    return prisma.$transaction(async (tx) => {
        const property = await tx.property.findUnique({
            where: { id: payload.propertyId },
        });

        if (!property) {
            throw new AppError(httpStatus.NOT_FOUND, "Property not found");
        }

        if (property.status !== "AVAILABLE") {
            throw new AppError(httpStatus.BAD_REQUEST, "This property is not available");
        }

        if (property.landlordId === tenantId) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                "You cannot rent your own property"
            );
        }

        const duplicate = await tx.rentalRequest.findFirst({
            where: {
                propertyId: property.id,
                tenantId,
                status: { in: ONGOING_RENTAL_STATUSES },
            },
        });

        if (duplicate) {
            throw new AppError(
                httpStatus.CONFLICT,
                "You already have an ongoing request for this property"
            );
        }

        const rental = await tx.rentalRequest.create({
            data: {
                propertyId: property.id,
                tenantId,
                landlordId: property.landlordId,
                moveInDate,
                moveOutDate: payload.moveOutDate
                    ? new Date(payload.moveOutDate)
                    : undefined,
                message: payload.message,
                // টাকার অঙ্ক client থেকে নেওয়া হয় না, database থেকে আসে
                quotedAmount: property.monthlyRent,
            },
            include: {
                property: { select: { id: true, title: true, city: true, area: true } },
            },
        });

        return formatAmount(rental);
    });
};

// Tenant শুধু নিজের request দেখবে
const getMyRentals = async (tenantId: string, query: RentalFilterQuery) => {
    const { page, limit, skip, sortBy, sortOrder } = calculatePagination(
        query,
        RENTAL_SORTABLE_FIELDS
    );

    const where: Prisma.RentalRequestWhereInput = {
        tenantId,
        ...(query.status && { status: query.status }),
        ...(query.propertyId && { propertyId: query.propertyId }),
    };

    const [rentals, total] = await prisma.$transaction([
        prisma.rentalRequest.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
            include: {
                property: {
                    select: { id: true, title: true, city: true, area: true, images: true },
                },
                landlord: { select: { id: true, name: true, phone: true } },
            },
        }),
        prisma.rentalRequest.count({ where }),
    ]);

    return { data: rentals.map(formatAmount), meta: { page, limit, total } };
};

// id জানলেই দেখা যাবে না — tenant, landlord অথবা ADMIN হতে হবে
const getRentalById = async (rentalId: string, user: TJwtPayload) => {
    const rental = await prisma.rentalRequest.findUnique({
        where: { id: rentalId },
        include: {
            property: { select: { id: true, title: true, city: true, area: true } },
            tenant: { select: { id: true, name: true, email: true, phone: true } },
            landlord: { select: { id: true, name: true, email: true, phone: true } },
            payments: {
                select: {
                    id: true,
                    transactionId: true,
                    amount: true,
                    provider: true,
                    status: true,
                    paidAt: true,
                },
            },
        },
    });

    if (!rental) {
        throw new AppError(httpStatus.NOT_FOUND, "Rental request not found");
    }

    const isOwner = rental.tenantId === user.id || rental.landlordId === user.id;

    if (!isOwner && user.role !== "ADMIN") {
        throw new AppError(
            httpStatus.FORBIDDEN,
            "You are not allowed to view this rental request"
        );
    }

    return {
        ...formatAmount(rental),
        payments: rental.payments.map((payment) => ({
            ...payment,
            amount: Number(payment.amount),
        })),
    };
};

// Tenant শুধু PENDING বা APPROVED request cancel করতে পারবে
const cancelRental = async (rentalId: string, tenantId: string) => {
    return prisma.$transaction(async (tx) => {
        const rental = await tx.rentalRequest.findUnique({ where: { id: rentalId } });

        if (!rental) {
            throw new AppError(httpStatus.NOT_FOUND, "Rental request not found");
        }

        if (rental.tenantId !== tenantId) {
            throw new AppError(httpStatus.FORBIDDEN, "This is not your rental request");
        }

        if (rental.status !== "PENDING" && rental.status !== "APPROVED") {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                `A ${rental.status.toLowerCase()} request cannot be cancelled`
            );
        }

        const cancelled = await tx.rentalRequest.update({
            where: { id: rental.id },
            data: { status: "CANCELLED" },
            include: {
                property: { select: { id: true, title: true } },
            },
        });

        return formatAmount(cancelled);
    });
};

export const rentalService = {
    createRental,
    getMyRentals,
    getRentalById,
    cancelRental,
};
