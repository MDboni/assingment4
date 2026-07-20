import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { RentalFilterQuery } from "./rental.interface";
import { rentalService } from "./rental.service";

const createRental = catchAsync(async (req: Request, res: Response) => {
    // tenantId token থেকে, client-এর পাঠানো id বিশ্বাস করা হয় না
    const rental = await rentalService.createRental(req.user!.id, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Rental request created successfully",
        data: rental,
    });
});

const getMyRentals = catchAsync(async (req: Request, res: Response) => {
    const result = await rentalService.getMyRentals(
        req.user!.id,
        req.query as RentalFilterQuery
    );

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Rental requests retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getRentalById = catchAsync(async (req: Request, res: Response) => {
    const rental = await rentalService.getRentalById(
        req.params.id as string,
        req.user!
    );

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Rental request retrieved successfully",
        data: rental,
    });
});

const cancelRental = catchAsync(async (req: Request, res: Response) => {
    const rental = await rentalService.cancelRental(
        req.params.id as string,
        req.user!.id
    );

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Rental request cancelled successfully",
        data: rental,
    });
});

export const rentalController = {
    createRental,
    getMyRentals,
    getRentalById,
    cancelRental,
};
