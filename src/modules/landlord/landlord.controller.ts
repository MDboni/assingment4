import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { RentalRequestFilterQuery } from "./landloard.interface";
import { landlordService } from "./landlord.service";

const createProperty = catchAsync(async (req: Request, res: Response) => {
    const property = await landlordService.createProperty(req.user!.id, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Property created successfully",
        data: property,
    });
});

const updateProperty = catchAsync(async (req: Request, res: Response) => {
    const property = await landlordService.updateProperty(
        req.params.id as string,
        req.user!.id,
        req.body
    );

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Property updated successfully",
        data: property,
    });
});

const deleteProperty = catchAsync(async (req: Request, res: Response) => {
    const result = await landlordService.deleteProperty(
        req.params.id as string,
        req.user!.id
    );

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.deleted
            ? "Property deleted successfully"
            : "Property has rental history, so it was archived instead of deleted",
        data: result.property,
    });
});

const getLandlordRequests = catchAsync(async (req: Request, res: Response) => {
    const result = await landlordService.getLandlordRequests(
        req.user!.id,
        req.query as RentalRequestFilterQuery
    );

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Rental requests retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const decideRentalRequest = catchAsync(async (req: Request, res: Response) => {
    const request = await landlordService.decideRentalRequest(
        req.params.id as string,
        req.user!.id,
        req.body
    );

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: `Rental request ${req.body.status.toLowerCase()} successfully`,
        data: request,
    });
});

export const landlordController = {
    createProperty,
    updateProperty,
    deleteProperty,
    getLandlordRequests,
    decideRentalRequest,
};
