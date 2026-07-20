import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import {
    AdminPropertyFilterQuery,
    AdminRentalFilterQuery,
    AdminUserFilterQuery,
} from "./admin.interface";
import { adminService } from "./admin.service";

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
    const result = await adminService.getAllUsers(req.query as AdminUserFilterQuery);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Users retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
    const user = await adminService.updateUserStatus(
        req.user!.id,
        req.params.id as string,
        req.body
    );

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: `User ${req.body.status === "BANNED" ? "banned" : "unbanned"} successfully`,
        data: user,
    });
});

const getAllProperties = catchAsync(async (req: Request, res: Response) => {
    const result = await adminService.getAllProperties(
        req.query as AdminPropertyFilterQuery
    );

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Properties retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getAllRentals = catchAsync(async (req: Request, res: Response) => {
    const result = await adminService.getAllRentals(
        req.query as AdminRentalFilterQuery
    );

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Rental requests retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

export const adminController = {
    getAllUsers,
    updateUserStatus,
    getAllProperties,
    getAllRentals,
};
