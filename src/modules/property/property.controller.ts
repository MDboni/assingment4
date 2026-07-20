import { Request, Response } from "express";
import { StatusCodes as httpStatus } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { PropertyFilterQuery } from "./property.interface";
import { propertyService } from "./property.service";

const getAllProperties = catchAsync(async (req: Request, res: Response) => {
    const result = await propertyService.getAllProperties(
        req.query as PropertyFilterQuery
    );

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Properties retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getPropertyById = catchAsync(async (req: Request, res: Response) => {
    const property = await propertyService.getPropertyById(req.params.id as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Property retrieved successfully",
        data: property,
    });
});

export const propertyController = {
    getAllProperties,
    getPropertyById,
};
