import { StatusCodes as httpStatus } from "http-status-codes";
import { AppError } from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { calculatePagination } from "../../utils/pagination";
import { Prisma } from "../../../prisma/generated/prisma/client";
import {
    PROPERTY_SORTABLE_FIELDS,
    PropertyFilterQuery,
} from "./property.interface";


const formatMoney = <T extends { monthlyRent: unknown; securityDeposit: unknown }>(
    property: T
) => ({
    ...property,
    monthlyRent: Number(property.monthlyRent),
    securityDeposit: Number(property.securityDeposit),
});

// Public: 
const getAllProperties = async (query: PropertyFilterQuery) => {
    const {
        search,
        city,
        area,
        categoryId,
        categorySlug,
        bedrooms,
        bathrooms,
        minPrice,
        maxPrice,
        amenity,
    } = query;

    const { page, limit, skip, sortBy, sortOrder } = calculatePagination(
        query,
        PROPERTY_SORTABLE_FIELDS
    );

    const where: Prisma.PropertyWhereInput = {
        status: "AVAILABLE",
        ...(city && { city: { equals: city, mode: "insensitive" } }),
        ...(area && { area: { contains: area, mode: "insensitive" } }),
        ...(categoryId && { categoryId }),
        ...(categorySlug && { category: { slug: categorySlug } }),
        ...(bedrooms && { bedrooms: { gte: Number(bedrooms) } }),
        ...(bathrooms && { bathrooms: { gte: Number(bathrooms) } }),
        ...(amenity && { amenities: { has: amenity } }),
        ...(minPrice || maxPrice
            ? {
                  monthlyRent: {
                      ...(minPrice && { gte: Number(minPrice) }),
                      ...(maxPrice && { lte: Number(maxPrice) }),
                  },
              }
            : {}),
        ...(search && {
            OR: [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
                { address: { contains: search, mode: "insensitive" } },
                { city: { contains: search, mode: "insensitive" } },
                { area: { contains: search, mode: "insensitive" } },
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
                category: { select: { id: true, name: true, slug: true } },
                landlord: { select: { id: true, name: true, phone: true } },
                _count: { select: { reviews: { where: { isVisible: true } } } },
            },
        }),
        prisma.property.count({ where }),
    ]);

    const data = properties.map(({ _count, ...property }) => ({
        ...formatMoney(property),
        reviewCount: _count.reviews,
    }));

    return { data, meta: { page, limit, total } };
};

// Public: 
const getPropertyById = async (id: string) => {
    const property = await prisma.property.findUnique({
        where: { id },
        include: {
            category: { select: { id: true, name: true, slug: true } },
            landlord: { select: { id: true, name: true, phone: true, bio: true } },
            reviews: {
                where: { isVisible: true },
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    rating: true,
                    comment: true,
                    createdAt: true,
                    tenant: { select: { id: true, name: true } },
                },
            },
        },
    });

    if (!property || property.status === "ARCHIVED") {
        throw new AppError(httpStatus.NOT_FOUND, "Property not found");
    }

    const ratingSummary = await prisma.review.aggregate({
        where: { propertyId: id, isVisible: true },
        _avg: { rating: true },
        _count: { rating: true },
    });

    return {
        ...formatMoney(property),
        ratingSummary: {
            average: ratingSummary._avg.rating
                ? Number(ratingSummary._avg.rating.toFixed(2))
                : 0,
            total: ratingSummary._count.rating,
        },
    };
};

export const propertyService = {
    getAllProperties,
    getPropertyById,
};
