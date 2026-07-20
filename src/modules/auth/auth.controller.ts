import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { Request ,Response } from "express";
import httpStatus from "http-status";
import { authService } from "./auth.service";

const registerUser = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;

    const user = await authService.registerUser(payload);

        sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User registered successfully",
        data: user
    });
})

export const authController = {
    registerUser
}