import bcrypt from "bcrypt";
import { StatusCodes as httpStatus } from "http-status-codes";
import config from "../../config";
import { AppError } from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { ChangePasswordPayload, UpdateProfilePayload } from "./user.interface";

const getMyProfile = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        omit: { password: true },
        include: {
            _count: {
                select: {
                    properties: true,
                    tenantRentals: true,
                    landlordRentals: true,
                    payments: true,
                    reviews: true,
                },
            },
        },
    });

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    return user;
};

// email আর role এখান থেকে বদলানো যাবে না — ইচ্ছে করেই
const updateMyProfile = async (userId: string, payload: UpdateProfilePayload) => {
    return prisma.user.update({
        where: { id: userId },
        data: {
            name: payload.name,
            phone: payload.phone,
            bio: payload.bio,
        },
        omit: { password: true },
    });
};

const changeMyPassword = async (userId: string, payload: ChangePasswordPayload) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    const isPasswordMatched = await bcrypt.compare(
        payload.oldPassword,
        user.password
    );

    if (!isPasswordMatched) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Old password is incorrect");
    }

    const hashedPassword = await bcrypt.hash(
        payload.newPassword,
        Number(config.bcrypt_salt_rounds)
    );

    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
    });

    return { message: "Password changed successfully" };
};

export const userService = {
    getMyProfile,
    updateMyProfile,
    changeMyPassword,
};
