import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { ZodError } from "zod";
import { AppError } from "../errors/AppError";

type TErrorSource = { path: string; message: string };

export const globalErrorHandler = (
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
    let message = "Something went wrong";
    let errorSources: TErrorSource[] = [];

    if (err instanceof ZodError) {
        statusCode = httpStatus.BAD_REQUEST;
        message = "Validation failed";
        errorSources = err.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
        }));
    } else if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    } else if (typeof err === "object" && err !== null && "code" in err) {
        // Prisma known request errors
        const code = (err as { code: string }).code;

        if (code === "P2002") {
            statusCode = httpStatus.CONFLICT;
            message = "Duplicate value: this record already exists";
        } else if (code === "P2025") {
            statusCode = httpStatus.NOT_FOUND;
            message = "Record not found";
        } else if (code === "P2003") {
            statusCode = httpStatus.BAD_REQUEST;
            message = "Related record not found (foreign key error)";
        } else if (err instanceof Error) {
            message = err.message;
        }
    } else if (err instanceof Error) {
        if (err.name === "JsonWebTokenError") {
            statusCode = httpStatus.UNAUTHORIZED;
            message = "Invalid token";
        } else if (err.name === "TokenExpiredError") {
            statusCode = httpStatus.UNAUTHORIZED;
            message = "Token expired";
        } else {
            message = err.message;
        }
    }

    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        errorSources,
    });
};
