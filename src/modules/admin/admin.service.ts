import { StatusCodes as httpStatus } from "http-status-codes";
import { AppError } from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { calculatePagination } from "../../utils/pagination";
import { Prisma } from "../../../prisma/generated/prisma/client";
import {
    ADMIN_PROPERTY_SORTABLE_FIELDS,
    ADMIN_RENTAL_SORTABLE_FIELDS,
    ADMIN_USER_SORTABLE_FIELDS,
    AdminPropertyFilterQuery,
    AdminRentalFilterQuery,
    AdminUserFilterQuery,
    UpdateUserStatusPayload,
} from "./admin.interface";

// Prisma Decimal সরাসরি JSON-এ ভালোভাবে যায় না, তাই number-এ বদলে দিচ্ছি
const toNumber = <T extends Record<string, unknown>>(row: T, fields: string[]) => {
    const formatted: Record<string, unknown> = { ...row };

    for (const field of fields) {
        if (formatted[field] !== null && formatted[field] !== undefined) {
            formatted[field] = Number(formatted[field]);
        }
    }

    return formatted as T;
};

const getAllUsers = async (query: AdminUserFilterQuery) => {
    const { page, limit, skip, sortBy, sortOrder } = calculatePagination(
        query,
        ADMIN_USER_SORTABLE_FIELDS
    );

    const where: Prisma.UserWhereInput = {
        ...(query.role && { role: query.role }),
        ...(query.status && { status: query.status }),
        ...(query.search && {
            OR: [
                { name: { contains: query.search, mode: "insensitive" } },
                { email: { contains: query.search, mode: "insensitive" } },
                { phone: { contains: query.search, mode: "insensitive" } },
            ],
        }),
    };

    const [users, total] = await prisma.$transaction([
        prisma.user.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
            // password কখনো response-এ যাবে না
            omit: { password: true },
            include: {
                _count: {
                    select: { properties: true, tenantRentals: true, payments: true },
                },
            },
        }),
        prisma.user.count({ where }),
    ]);

    return { data: users, meta: { page, limit, total } };
};

// Ban / unban
const updateUserStatus = async (
    adminId: string,
    userId: string,
    payload: UpdateUserStatusPayload
) => {
    if (adminId === userId) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Admin cannot change their own status"
        );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    if (user.role === "ADMIN") {
        throw new AppError(httpStatus.FORBIDDEN, "An admin cannot be banned");
    }

    return prisma.user.update({
        where: { id: userId },
        data: { status: payload.status },
        omit: { password: true },
    });
};

// Admin সব property দেখবে — ARCHIVED, RENTED সহ
const getAllProperties = async (query: AdminPropertyFilterQuery) => {
    const { page, limit, skip, sortBy, sortOrder } = calculatePagination(
        query,
        ADMIN_PROPERTY_SORTABLE_FIELDS
    );

    const where: Prisma.PropertyWhereInput = {
        ...(query.status && { status: query.status }),
        ...(query.city && { city: { equals: query.city, mode: "insensitive" } }),
        ...(query.categoryId && { categoryId: query.categoryId }),
        ...(query.landlordId && { landlordId: query.landlordId }),
        ...(query.search && {
            OR: [
                { title: { contains: query.search, mode: "insensitive" } },
                { address: { contains: query.search, mode: "insensitive" } },
                { city: { contains: query.search, mode: "insensitive" } },
            ],
        }),
    };

    const [properties, total] = await prisma.$transaction([
        prisma.property.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
            include: {
                category: { select: { id: true, name: true } },
                landlord: { select: { id: true, name: true, email: true, status: true } },
                _count: { select: { rentalRequests: true, reviews: true } },
            },
        }),
        prisma.property.count({ where }),
    ]);

    const data = properties.map((property) =>
        toNumber(property, ["monthlyRent", "securityDeposit"])
    );

    return { data, meta: { page, limit, total } };
};

const getAllRentals = async (query: AdminRentalFilterQuery) => {
    const { page, limit, skip, sortBy, sortOrder } = calculatePagination(
        query,
        ADMIN_RENTAL_SORTABLE_FIELDS
    );

    const where: Prisma.RentalRequestWhereInput = {
        ...(query.status && { status: query.status }),
        ...(query.propertyId && { propertyId: query.propertyId }),
        ...(query.tenantId && { tenantId: query.tenantId }),
        ...(query.landlordId && { landlordId: query.landlordId }),
    };

    const [rentals, total] = await prisma.$transaction([
        prisma.rentalRequest.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
            include: {
                property: { select: { id: true, title: true, city: true } },
                tenant: { select: { id: true, name: true, email: true } },
                landlord: { select: { id: true, name: true, email: true } },
                _count: { select: { payments: true } },
            },
        }),
        prisma.rentalRequest.count({ where }),
    ]);

    const data = rentals.map((rental) => toNumber(rental, ["quotedAmount"]));

    return { data, meta: { page, limit, total } };
};

export const adminService = {
    getAllUsers,
    updateUserStatus,
    getAllProperties,
    getAllRentals,
};
