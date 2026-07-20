import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import config from "../config";
import { AppError } from "../errors/AppError";
import { prisma } from "../lib/prisma";
import { verifyToken } from "../utils/jwt";
import { UserRole } from "../../prisma/generated/prisma/enums";

export const auth = (...roles: UserRole[]) => {
    return async (req: Request, _res: Response, next: NextFunction) => {
        try {
            const token =
                req.cookies?.accessToken ||
                req.headers.authorization?.replace("Bearer ", "");

            if (!token) {
                throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized");
            }

            const decoded = verifyToken(token, config.jwt_access_secret);

            const user = await prisma.user.findUnique({
                where: { id: decoded.id },
            });

            if (!user) {
                throw new AppError(httpStatus.NOT_FOUND, "User not found");
            }

            if (user.status !== "ACTIVE") {
                throw new AppError(httpStatus.FORBIDDEN, "This user is banned");
            }

            if (roles.length && !roles.includes(user.role)) {
                throw new AppError(httpStatus.FORBIDDEN, "Forbidden: insufficient permission");
            }

            req.user = { id: user.id, email: user.email, role: user.role };
            next();
        } catch (error) {
            next(error);
        }
    };
};
