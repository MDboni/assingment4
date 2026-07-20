import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { PaymentFilterQuery } from "./payment.interface";
import { paymentService } from "./payment.service";

const createPayment = catchAsync(async (req: Request, res: Response) => {
    const result = await paymentService.createCheckoutSession(req.user!.id, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Checkout session created successfully",
        data: result,
    });
});

// Stripe webhook — এখানে req.body raw Buffer (app.ts-এ express.raw বসানো আছে)
const confirmPayment = catchAsync(async (req: Request, res: Response) => {
    const result = await paymentService.handleStripeWebhook(
        req.body as Buffer,
        req.headers["stripe-signature"] as string | undefined
    );

    res.status(httpStatus.OK).json(result);
});

const getPayments = catchAsync(async (req: Request, res: Response) => {
    const result = await paymentService.getPayments(
        req.user!,
        req.query as PaymentFilterQuery
    );

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Payments retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getPaymentById = catchAsync(async (req: Request, res: Response) => {
    const payment = await paymentService.getPaymentById(
        req.params.id as string,
        req.user!
    );

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Payment retrieved successfully",
        data: payment,
    });
});

export const paymentController = {
    createPayment,
    confirmPayment,
    getPayments,
    getPaymentById,
};
