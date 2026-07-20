import { RentalStatus } from "../../../prisma/generated/prisma/enums";

export interface CreateRentalPayload {
    propertyId: string;
    moveInDate: string;
    moveOutDate?: string;
    message?: string;
}

// GET /api/rentals -এর query
export interface RentalFilterQuery {
    status?: RentalStatus;
    propertyId?: string;
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export const RENTAL_SORTABLE_FIELDS = [
    "createdAt",
    "moveInDate",
    "quotedAmount",
    "status",
];

// এই status গুলো থাকলে ওই property-তে নতুন request দেওয়া যাবে না
export const ONGOING_RENTAL_STATUSES: RentalStatus[] = [
    "PENDING",
    "APPROVED",
    "PAYMENT_PENDING",
    "ACTIVE",
];
