import bcrypt from "bcrypt";
import httpStatus from "http-status";
import config from "../../config";
import { AppError } from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { createToken } from "../../utils/jwt";
import { LoginUserPayload, RegisterUserPayload } from "./auth.interface";

const registerUser = async (payload: RegisterUserPayload) => {
    const email = payload.email.toLowerCase();

    const isUserExist = await prisma.user.findUnique({
        where: { email },
    });

    if (isUserExist) {
        throw new AppError(httpStatus.CONFLICT, "Email already exists");
    }

    const hashedPassword = await bcrypt.hash(
        payload.password,
        Number(config.bcrypt_salt_rounds)
    );

    const user = await prisma.user.create({
        data: {
            name: payload.name,
            email,
            password: hashedPassword,
            role: payload.role,
            phone: payload.phone,
            bio: payload.bio,
        },
        omit: { password: true },
    });

    return user;
};

const loginUser = async (payload: LoginUserPayload) => {
    const user = await prisma.user.findUnique({
        where: { email: payload.email.toLowerCase() },
    });

    if (!user) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Invalid credentials");
    }

    const isPasswordMatched = await bcrypt.compare(payload.password, user.password);

    if (!isPasswordMatched) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Invalid credentials");
    }

    if (user.status === "BANNED") {
        throw new AppError(httpStatus.FORBIDDEN, "This user is banned");
    }

    const jwtPayload = { id: user.id, email: user.email, role: user.role };

    const accessToken = createToken(
        jwtPayload,
        config.jwt_access_secret,
        config.jwt_access_expires_in
    );

    const refreshToken = createToken(
        jwtPayload,
        config.jwt_refresh_secret,
        config.jwt_refresh_expires_in
    );

    const { password, ...userWithoutPassword } = user;

    return { accessToken, refreshToken, user: userWithoutPassword };
};

const getMe = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        omit: { password: true },
    });

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    return user;
};

export const authService = {
    registerUser,
    loginUser,
    getMe,
};
