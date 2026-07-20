export interface CreateCategoryPayload {
    name: string;
    description?: string;
}

export interface UpdateCategoryPayload {
    name?: string;
    description?: string;
    isActive?: boolean;
}
