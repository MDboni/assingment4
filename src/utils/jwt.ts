import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { UserRole } from "../../prisma/generated/prisma/enums";

export type TJwtPayload = {
    id: string;
    email: string;
    role: UserRole;
};

export const createToken = (
    payload: TJwtPayload,
    secret: string,
    expiresIn: string
) => {
    return jwt.sign(payload, secret, {
        expiresIn: expiresIn as SignOptions["expiresIn"],
    });
};

export const verifyToken = (token: string, secret: string) => {
    return jwt.verify(token, secret) as JwtPayload & TJwtPayload;
};
