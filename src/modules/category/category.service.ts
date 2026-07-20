import { StatusCodes as httpStatus } from "http-status-codes";
import slugify from "slugify";
import { AppError } from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import {
    CreateCategoryPayload,
    UpdateCategoryPayload,
} from "./category.interface";

// Public: শুধু active category গুলো, সাথে কয়টা AVAILABLE property আছে
const getAllCategories = async () => {
    const categories = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
        include: {
            _count: {
                select: {
                    properties: { where: { status: "AVAILABLE" } },
                },
            },
        },
    });

    return categories.map(({ _count, ...category }) => ({
        ...category,
        propertyCount: _count.properties,
    }));
};

// ---------- Admin ----------

// Admin inactive category গুলোও দেখবে
const getAllCategoriesForAdmin = async () => {
    const categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
        include: { _count: { select: { properties: true } } },
    });

    return categories.map(({ _count, ...category }) => ({
        ...category,
        propertyCount: _count.properties,
    }));
};

const createCategory = async (payload: CreateCategoryPayload) => {
    const existing = await prisma.category.findUnique({
        where: { name: payload.name },
    });

    if (existing) {
        throw new AppError(httpStatus.CONFLICT, "This category already exists");
    }

    return prisma.category.create({
        data: {
            name: payload.name,
            slug: slugify(payload.name, { lower: true, strict: true }),
            description: payload.description,
        },
    });
};

const updateCategory = async (id: string, payload: UpdateCategoryPayload) => {
    const category = await prisma.category.findUnique({ where: { id } });

    if (!category) {
        throw new AppError(httpStatus.NOT_FOUND, "Category not found");
    }

    return prisma.category.update({
        where: { id },
        data: {
            name: payload.name,
            description: payload.description,
            isActive: payload.isActive,
            ...(payload.name && {
                slug: slugify(payload.name, { lower: true, strict: true }),
            }),
        },
    });
};

// property যুক্ত থাকলে hard delete নয় — isActive=false করা হয়
const deleteCategory = async (id: string) => {
    const category = await prisma.category.findUnique({
        where: { id },
        include: { _count: { select: { properties: true } } },
    });

    if (!category) {
        throw new AppError(httpStatus.NOT_FOUND, "Category not found");
    }

    if (category._count.properties > 0) {
        const deactivated = await prisma.category.update({
            where: { id },
            data: { isActive: false },
        });

        return { deleted: false, category: deactivated };
    }

    const deleted = await prisma.category.delete({ where: { id } });

    return { deleted: true, category: deleted };
};

export const categoryService = {
    getAllCategories,
    getAllCategoriesForAdmin,
    createCategory,
    updateCategory,
    deleteCategory,
};
