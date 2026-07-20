import { Request, Response } from "express";
import { StatusCodes as httpStatus } from "http-status-codes";

export const notFound = (req: Request, res: Response) => {
    res.status(httpStatus.NOT_FOUND).json({
        success: false,
        statusCode: httpStatus.NOT_FOUND,
        message: `Route ${req.method} ${req.originalUrl} not found`,
        errorDetails: [],
    });
};
