import { randomUUID } from "node:crypto";
import httpStatus from "http-status";
import Stripe from "stripe";
import config from "../../config";
import { AppError } from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import { calculatePagination } from "../../utils/pagination";
import { Prisma } from "../../../prisma/generated/prisma/client";
import { TJwtPayload } from "../../utils/jwt";
import {
    CreatePaymentPayload,
    PAYMENT_SORTABLE_FIELDS,
    PaymentFilterQuery,
} from "./payment.interface";

// Prisma Decimal সরাসরি JSON-এ ভালোভাবে যায় না, তাই number-এ বদলে দিচ্ছি
const formatAmount = <T extends { amount: unknown }>(payment: T) => ({
    ...payment,
    amount: Number(payment.amount),
});

// APPROVED rental-এর জন্য Stripe Checkout session তৈরি
const createCheckoutSession = async (
    tenantId: string,
    payload: CreatePaymentPayload
) => {
    const rental = await prisma.rentalRequest.findFirst({
        where: { id: payload.rentalRequestId, tenantId },
        include: { property: { select: { id: true, title: true } } },
    });

    if (!rental) {
        throw new AppError(httpStatus.NOT_FOUND, "Rental request not found");
    }

    if (rental.status !== "APPROVED") {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Only an approved rental request can be paid"
        );
    }

    const alreadyPaid = await prisma.payment.findFirst({
        where: { rentalRequestId: rental.id, status: "COMPLETED" },
    });

    if (alreadyPaid) {
        throw new AppError(httpStatus.CONFLICT, "This rental is already paid");
    }

    // টাকার অঙ্ক client থেকে নেওয়া হয় না, database-এর quotedAmount থেকে আসে
    const amount = Number(rental.quotedAmount);
    const transactionId = `RN-${Date.now()}-${randomUUID().slice(0, 8)}`;

    const payment = await prisma.payment.create({
        data: {
            rentalRequestId: rental.id,
            tenantId,
            transactionId,
            amount,
            currency: config.payment_currency,
            provider: "STRIPE",
            status: "PENDING",
        },
    });

    const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
            {
                quantity: 1,
                price_data: {
                    currency: config.payment_currency.toLowerCase(),
                    unit_amount: Math.round(amount * 100),
                    product_data: { name: `Rent: ${rental.property.title}` },
                },
            },
        ],
        success_url: `${config.stripe_success_url}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: config.stripe_cancel_url,
        // webhook-এ এই metadata দিয়েই payment খুঁজে নেব
        metadata: {
            paymentId: payment.id,
            rentalRequestId: rental.id,
            tenantId,
        },
    });

    await prisma.$transaction([
        prisma.payment.update({
            where: { id: payment.id },
            data: { checkoutSessionId: session.id },
        }),
        prisma.rentalRequest.update({
            where: { id: rental.id },
            data: { status: "PAYMENT_PENDING" },
        }),
    ]);

    return {
        checkoutUrl: session.url,
        paymentId: payment.id,
        transactionId,
        amount,
        currency: config.payment_currency,
    };
};

// payment সফল হলে: Payment COMPLETED, Rental ACTIVE, Property RENTED
const markPaymentCompleted = async (
    paymentId: string,
    providerTransactionId?: string,
    method?: string
) => {
    await prisma.$transaction(async (tx) => {
        const payment = await tx.payment.findUnique({ where: { id: paymentId } });

        // Stripe একই event একাধিকবার পাঠাতে পারে, তাই idempotent
        if (!payment || payment.status === "COMPLETED") {
            return;
        }

        await tx.payment.update({
            where: { id: payment.id },
            data: {
                status: "COMPLETED",
                providerTransactionId,
                method,
                paidAt: new Date(),
            },
        });

        const rental = await tx.rentalRequest.update({
            where: { id: payment.rentalRequestId },
            data: { status: "ACTIVE", activatedAt: new Date() },
        });

        await tx.property.update({
            where: { id: rental.propertyId },
            data: { status: "RENTED" },
        });
    });
};

// payment ব্যর্থ/বাতিল হলে rental আবার APPROVED-এ ফিরে যাবে, যাতে আবার চেষ্টা করা যায়
const markPaymentFailed = async (paymentId: string, failedStatus: "FAILED" | "CANCELED") => {
    await prisma.$transaction(async (tx) => {
        const payment = await tx.payment.findUnique({ where: { id: paymentId } });

        if (!payment || payment.status !== "PENDING") {
            return;
        }

        await tx.payment.update({
            where: { id: payment.id },
            data: { status: failedStatus },
        });

        const rental = await tx.rentalRequest.findUnique({
            where: { id: payment.rentalRequestId },
        });

        if (rental?.status === "PAYMENT_PENDING") {
            await tx.rentalRequest.update({
                where: { id: rental.id },
                data: { status: "APPROVED" },
            });
        }
    });
};

// Stripe webhook — signature verify করে তবেই database update
const handleStripeWebhook = async (rawBody: Buffer, signature?: string) => {
    if (!signature) {
        throw new AppError(httpStatus.BAD_REQUEST, "Missing stripe-signature header");
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            rawBody,
            signature,
            config.stripe_webhook_secret
        );
    } catch {
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid webhook signature");
    }

    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object;
            const paymentId = session.metadata?.paymentId;

            if (paymentId) {
                await markPaymentCompleted(
                    paymentId,
                    session.payment_intent ? String(session.payment_intent) : undefined,
                    session.payment_method_types?.[0]
                );
            }
            break;
        }

        case "checkout.session.expired": {
            const session = event.data.object;
            const paymentId = session.metadata?.paymentId;

            if (paymentId) {
                await markPaymentFailed(paymentId, "CANCELED");
            }
            break;
        }

        case "checkout.session.async_payment_failed": {
            const session = event.data.object;
            const paymentId = session.metadata?.paymentId;

            if (paymentId) {
                await markPaymentFailed(paymentId, "FAILED");
            }
            break;
        }

        default:
            break;
    }

    return { received: true, type: event.type };
};

// ADMIN সব দেখবে, বাকিরা শুধু নিজের payment
const getPayments = async (user: TJwtPayload, query: PaymentFilterQuery) => {
    const { page, limit, skip, sortBy, sortOrder } = calculatePagination(
        query,
        PAYMENT_SORTABLE_FIELDS
    );

    const where: Prisma.PaymentWhereInput = {
        ...(user.role !== "ADMIN" && { tenantId: user.id }),
        ...(query.status && { status: query.status }),
        ...(query.rentalRequestId && { rentalRequestId: query.rentalRequestId }),
    };

    const [payments, total] = await prisma.$transaction([
        prisma.payment.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
            include: {
                rentalRequest: {
                    select: {
                        id: true,
                        status: true,
                        property: { select: { id: true, title: true } },
                    },
                },
            },
        }),
        prisma.payment.count({ where }),
    ]);

    return { data: payments.map(formatAmount), meta: { page, limit, total } };
};

// owner tenant, related landlord অথবা ADMIN দেখতে পাবে
const getPaymentById = async (paymentId: string, user: TJwtPayload) => {
    const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
            tenant: { select: { id: true, name: true, email: true } },
            rentalRequest: {
                select: {
                    id: true,
                    status: true,
                    landlordId: true,
                    moveInDate: true,
                    property: { select: { id: true, title: true, city: true } },
                },
            },
        },
    });

    if (!payment) {
        throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
    }

    const isRelated =
        payment.tenantId === user.id || payment.rentalRequest.landlordId === user.id;

    if (!isRelated && user.role !== "ADMIN") {
        throw new AppError(
            httpStatus.FORBIDDEN,
            "You are not allowed to view this payment"
        );
    }

    return formatAmount(payment);
};

export const paymentService = {
    createCheckoutSession,
    handleStripeWebhook,
    getPayments,
    getPaymentById,
};
