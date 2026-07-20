import { randomUUID } from "node:crypto";
import httpStatus from "http-status";
import slugify from "slugify";
import { AppError } from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { calculatePagination } from "../../utils/pagination";
import { Prisma } from "../../../prisma/generated/prisma/client";
import {
    CreatePropertyPayload,
    DecideRentalRequestPayload,
    RENTAL_REQUEST_SORTABLE_FIELDS,
    RentalRequestFilterQuery,
    UpdatePropertyPayload,
} from "./landloard.interface";

// Prisma Decimal সরাসরি JSON-এ ভালোভাবে যায় না, তাই number-এ বদলে দিচ্ছি
const formatMoney = <T extends Record<string, unknown>>(row: T, fields: string[]) => {
    const formatted: Record<string, unknown> = { ...row };

    for (const field of fields) {
        if (formatted[field] !== null && formatted[field] !== undefined) {
            formatted[field] = Number(formatted[field]);
        }
    }

    return formatted as T;
};

// একই title-এ যাতে slug conflict না হয়, তাই শেষে random suffix
const buildSlug = (title: string) =>
    `${slugify(title, { lower: true, strict: true })}-${randomUUID().slice(0, 8)}`;

// শুধু নিজের property, না হলে 403
const getOwnPropertyOrThrow = async (propertyId: string, landlordId: string) => {
    const property = await prisma.property.findUnique({ where: { id: propertyId } });

    if (!property) {
        throw new AppError(httpStatus.NOT_FOUND, "Property not found");
    }

    if (property.landlordId !== landlordId) {
        throw new AppError(httpStatus.FORBIDDEN, "You do not own this property");
    }

    return property;
};

// ---------- Property listing ----------

const createProperty = async (landlordId: string, payload: CreatePropertyPayload) => {
    const category = await prisma.category.findFirst({
        where: { id: payload.categoryId, isActive: true },
    });

    if (!category) {
        throw new AppError(httpStatus.NOT_FOUND, "Category not found or inactive");
    }

    const property = await prisma.property.create({
        data: {
            ...payload,
            availableFrom: payload.availableFrom
                ? new Date(payload.availableFrom)
                : undefined,
            slug: buildSlug(payload.title),
            landlordId,
        },
        include: { category: { select: { id: true, name: true, slug: true } } },
    });

    return formatMoney(property, ["monthlyRent", "securityDeposit"]);
};

const updateProperty = async (
    propertyId: string,
    landlordId: string,
    payload: UpdatePropertyPayload
) => {
    await getOwnPropertyOrThrow(propertyId, landlordId);

    if (payload.categoryId) {
        const category = await prisma.category.findFirst({
            where: { id: payload.categoryId, isActive: true },
        });

        if (!category) {
            throw new AppError(httpStatus.NOT_FOUND, "Category not found or inactive");
        }
    }

    const property = await prisma.property.update({
        where: { id: propertyId },
        data: {
            ...payload,
            availableFrom: payload.availableFrom
                ? new Date(payload.availableFrom)
                : undefined,
        },
        include: { category: { select: { id: true, name: true, slug: true } } },
    });

    return formatMoney(property, ["monthlyRent", "securityDeposit"]);
};

// চলমান rental থাকলে delete করা যাবে না।
// পুরনো rental history থাকলে hard delete না করে ARCHIVED করা হয়।
const deleteProperty = async (propertyId: string, landlordId: string) => {
    await getOwnPropertyOrThrow(propertyId, landlordId);

    const ongoingRental = await prisma.rentalRequest.findFirst({
        where: {
            propertyId,
            status: { in: ["PENDING", "APPROVED", "PAYMENT_PENDING", "ACTIVE"] },
        },
    });

    if (ongoingRental) {
        throw new AppError(
            httpStatus.CONFLICT,
            "This property has ongoing rental requests, it cannot be deleted"
        );
    }

    const rentalHistoryCount = await prisma.rentalRequest.count({
        where: { propertyId },
    });

    if (rentalHistoryCount > 0) {
        const archived = await prisma.property.update({
            where: { id: propertyId },
            data: { status: "ARCHIVED" },
        });

        return {
            deleted: false,
            property: formatMoney(archived, ["monthlyRent", "securityDeposit"]),
        };
    }

    const deleted = await prisma.property.delete({ where: { id: propertyId } });

    return {
        deleted: true,
        property: formatMoney(deleted, ["monthlyRent", "securityDeposit"]),
    };
};

// ---------- Rental requests ----------

// শুধু নিজের property-তে আসা request
const getLandlordRequests = async (
    landlordId: string,
    query: RentalRequestFilterQuery
) => {
    const { page, limit, skip, sortBy, sortOrder } = calculatePagination(
        query,
        RENTAL_REQUEST_SORTABLE_FIELDS
    );

    const where: Prisma.RentalRequestWhereInput = {
        landlordId,
        ...(query.status && { status: query.status }),
        ...(query.propertyId && { propertyId: query.propertyId }),
    };

    const [requests, total] = await prisma.$transaction([
        prisma.rentalRequest.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
            include: {
                property: { select: { id: true, title: true, city: true, area: true } },
                tenant: { select: { id: true, name: true, email: true, phone: true } },
            },
        }),
        prisma.rentalRequest.count({ where }),
    ]);

    const data = requests.map((request) => formatMoney(request, ["quotedAmount"]));

    return { data, meta: { page, limit, total } };
};

// শুধু PENDING request-ই approve/reject করা যাবে
const decideRentalRequest = async (
    requestId: string,
    landlordId: string,
    payload: DecideRentalRequestPayload
) => {
    return prisma.$transaction(async (tx) => {
        const rental = await tx.rentalRequest.findUnique({
            where: { id: requestId },
        });

        if (!rental) {
            throw new AppError(httpStatus.NOT_FOUND, "Rental request not found");
        }

        if (rental.landlordId !== landlordId) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "This rental request is not for your property"
            );
        }

        if (rental.status !== "PENDING") {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                `This request is already ${rental.status.toLowerCase()}`
            );
        }

        const isApproved = payload.status === "APPROVED";

        const updated = await tx.rentalRequest.update({
            where: { id: rental.id },
            data: {
                status: payload.status,
                landloardNote: payload.landloardNote,
                approvedAt: isApproved ? new Date() : null,
                rejectedAt: isApproved ? null : new Date(),
            },
            include: {
                property: { select: { id: true, title: true } },
                tenant: { select: { id: true, name: true, email: true } },
            },
        });

        return formatMoney(updated, ["quotedAmount"]);
    });
};

// ACTIVE rental শেষ হলে landlord COMPLETED করবে, property আবার AVAILABLE হবে
const completeRentalRequest = async (requestId: string, landlordId: string) => {
    return prisma.$transaction(async (tx) => {
        const rental = await tx.rentalRequest.findUnique({ where: { id: requestId } });

        if (!rental) {
            throw new AppError(httpStatus.NOT_FOUND, "Rental request not found");
        }

        if (rental.landlordId !== landlordId) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "This rental request is not for your property"
            );
        }

        if (rental.status !== "ACTIVE") {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                "Only an active rental can be completed"
            );
        }

        const completed = await tx.rentalRequest.update({
            where: { id: rental.id },
            data: { status: "COMPLETED", completedAt: new Date() },
            include: {
                property: { select: { id: true, title: true } },
                tenant: { select: { id: true, name: true, email: true } },
            },
        });

        await tx.property.update({
            where: { id: rental.propertyId },
            data: { status: "AVAILABLE" },
        });

        return formatMoney(completed, ["quotedAmount"]);
    });
};

export const landlordService = {
    createProperty,
    updateProperty,
    deleteProperty,
    getLandlordRequests,
    decideRentalRequest,
    completeRentalRequest,
};
