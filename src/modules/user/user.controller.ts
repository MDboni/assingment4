import { Request, Response } from "express";
import { StatusCodes as httpStatus } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { userService } from "./user.service";

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
    const user = await userService.getMyProfile(req.user!.id);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Profile retrieved successfully",
        data: user,
    });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
    const user = await userService.updateMyProfile(req.user!.id, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Profile updated successfully",
        data: user,
    });
});

const changeMyPassword = catchAsync(async (req: Request, res: Response) => {
    const result = await userService.changeMyPassword(req.user!.id, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: null,
    });
});

export const userController = {
    getMyProfile,
    updateMyProfile,
    changeMyPassword,
};
