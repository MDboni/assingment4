import { UserRole } from "../../../prisma/generated/prisma/enums";

// ADMIN public registration বন্ধ — শুধু TENANT / LANDLORD
export type TRegisterRole = Exclude<UserRole, "ADMIN">;

export interface RegisterUserPayload {
    name: string;
    email: string;
    password: string;
    role: TRegisterRole;
    phone?: string;
    bio?: string;
}

export interface LoginUserPayload {
    email: string;
    password: string;
}
