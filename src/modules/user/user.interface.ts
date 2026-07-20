export interface UpdateProfilePayload {
    name?: string;
    phone?: string;
    bio?: string;
}

export interface ChangePasswordPayload {
    oldPassword: string;
    newPassword: string;
}
