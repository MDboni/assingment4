export type TPaginationOptions = {
    page?: unknown;
    limit?: unknown;
    sortBy?: unknown;
    sortOrder?: unknown;
};

export type TPaginationResult = {
    page: number;
    limit: number;
    skip: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
};

export const calculatePagination = (
    options: TPaginationOptions,
    allowedSortFields: string[] = [],
    defaultSortBy = "createdAt"
): TPaginationResult => {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(options.limit) || 10));

    const requestedSortBy = String(options.sortBy ?? "");
    const sortBy = allowedSortFields.includes(requestedSortBy)
        ? requestedSortBy
        : defaultSortBy;

    const sortOrder = options.sortOrder === "asc" ? "asc" : "desc";

    return { page, limit, skip: (page - 1) * limit, sortBy, sortOrder };
};
