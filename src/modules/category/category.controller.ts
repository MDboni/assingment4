import { Request, Response } from "express";
import { StatusCodes as httpStatus } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { categoryService } from "./category.service";

const getAllCategories = catchAsync(async (_req: Request, res: Response) => {
    const categories = await categoryService.getAllCategories();

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Categories retrieved successfully",
        data: categories,
    });
});

// ---------- Admin ----------

const getAllCategoriesForAdmin = catchAsync(async (_req: Request, res: Response) => {
    const categories = await categoryService.getAllCategoriesForAdmin();

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Categories retrieved successfully",
        data: categories,
    });
});

const createCategory = catchAsync(async (req: Request, res: Response) => {
    const category = await categoryService.createCategory(req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Category created successfully",
        data: category,
    });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
    const category = await categoryService.updateCategory(
        req.params.id as string,
        req.body
    );

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Category updated successfully",
        data: category,
    });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
    const result = await categoryService.deleteCategory(req.params.id as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.deleted
            ? "Category deleted successfully"
            : "Category has properties, so it was deactivated instead of deleted",
        data: result.category,
    });
});

export const categoryController = {
    getAllCategories,
    getAllCategoriesForAdmin,
    createCategory,
    updateCategory,
    deleteCategory,
};
