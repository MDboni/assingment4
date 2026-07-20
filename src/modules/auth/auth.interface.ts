import { UserRole } from "../../../prisma/generated/prisma/enums";

export interface RegisterUserPayload {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone?: string;
    bio?: string;
}
