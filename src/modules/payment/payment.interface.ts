import { PaymentStatus } from "../../../prisma/generated/prisma/enums";

export interface CreatePaymentPayload {
    rentalRequestId: string;
}

// GET /api/payments -এর query
export interface PaymentFilterQuery {
    status?: PaymentStatus;
    rentalRequestId?: string;
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export const PAYMENT_SORTABLE_FIELDS = [
    "createdAt",
    "amount",
    "status",
    "paidAt",
];
