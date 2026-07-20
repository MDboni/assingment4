import {
    PropertyStatus,
    RentalStatus,
    UserRole,
    UserStatus,
} from "../../../prisma/generated/prisma/enums";

export interface AdminUserFilterQuery {
    search?: string;
    role?: UserRole;
    status?: UserStatus;
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export interface AdminPropertyFilterQuery {
    search?: string;
    status?: PropertyStatus;
    city?: string;
    categoryId?: string;
    landlordId?: string;
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export interface AdminRentalFilterQuery {
    status?: RentalStatus;
    propertyId?: string;
    tenantId?: string;
    landlordId?: string;
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export interface UpdateUserStatusPayload {
    status: UserStatus;
}

export const ADMIN_USER_SORTABLE_FIELDS = ["createdAt", "name", "email", "role"];
export const ADMIN_PROPERTY_SORTABLE_FIELDS = [
    "createdAt",
    "monthlyRent",
    "title",
    "city",
];
export const ADMIN_RENTAL_SORTABLE_FIELDS = [
    "createdAt",
    "moveInDate",
    "quotedAmount",
    "status",
];
