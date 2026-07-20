// GET /api/properties -এ যেসব query param support করা হয়
export interface PropertyFilterQuery {
    search?: string;
    city?: string;
    area?: string;
    categoryId?: string;
    categorySlug?: string;
    bedrooms?: string;
    bathrooms?: string;
    minPrice?: string;
    maxPrice?: string;
    amenity?: string;
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export const PROPERTY_SORTABLE_FIELDS = [
    "monthlyRent",
    "createdAt",
    "bedrooms",
    "sizeSqft",
    "title",
];
