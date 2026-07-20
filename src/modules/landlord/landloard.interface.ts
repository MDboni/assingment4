import { RentalStatus } from "../../../prisma/generated/prisma/enums";

// Landlord নিজে যেসব status সেট করতে পারে (RENTED সিস্টেম নিজে বসাবে)
export type TLandlordPropertyStatus = "AVAILABLE" | "UNAVAILABLE" | "ARCHIVED";

export interface CreatePropertyPayload {
    title: string;
    description: string;
    categoryId: string;
    address: string;
    city: string;
    area: string;
    monthlyRent: number;
    securityDeposit: number;
    bedrooms: number;
    bathrooms: number;
    sizeSqft: number;
    amenities: string[];
    images: string[];
    availableFrom?: string;
    status?: TLandlordPropertyStatus;
}

export type UpdatePropertyPayload = Partial<CreatePropertyPayload>;

// GET /api/landlord/requests -এর query
export interface RentalRequestFilterQuery {
    status?: RentalStatus;
    propertyId?: string;
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export interface DecideRentalRequestPayload {
    status: "APPROVED" | "REJECTED";
    landloardNote?: string;
}

export const RENTAL_REQUEST_SORTABLE_FIELDS = [
    "createdAt",
    "moveInDate",
    "quotedAmount",
    "status",
];
