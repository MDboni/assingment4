import { prisma } from "../../lib/prisma";

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

export const categoryService = {
    getAllCategories,
};
