import { Request, Response } from "express";
import { StatusCodes as httpStatus } from "http-status-codes";
import config from "../../config";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { authService } from "./auth.service";

const registerUser = catchAsync(async (req: Request, res: Response) => {
    const user = await authService.registerUser(req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User registered successfully",
        data: user,
    });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
    const result = await authService.loginUser(req.body);

    // production HTTPS-এ secure cookie, local-এ নয়
    const cookieOptions = {
        httpOnly: true,
        secure: config.is_production,
        sameSite: config.is_production ? ("none" as const) : ("lax" as const),
    };

    res.cookie("accessToken", result.accessToken, {
        ...cookieOptions,
        maxAge: 1000 * 60 * 60 * 24, // 1 day
    });

    res.cookie("refreshToken", result.refreshToken, {
        ...cookieOptions,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User logged in successfully",
        data: result,
    });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
    const user = await authService.getMe(req.user!.id);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User retrieved successfully",
        data: user,
    });
});

const logoutUser = catchAsync(async (_req: Request, res: Response) => {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User logged out successfully",
        data: null,
    });
});

export const authController = {
    registerUser,
    loginUser,
    getMe,
    logoutUser,
};
