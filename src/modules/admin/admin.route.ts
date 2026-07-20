import { Router } from "express";
import { auth } from "../../middleware/auth";
import { validateRequest } from "../../middleware/validateRequest";
import { categoryController } from "../category/category.controller";
import { categoryValidation } from "../category/category.validation";
import { adminController } from "./admin.controller";
import { adminValidation } from "./admin.validation";

const router = Router();

// এই module-এর সব route শুধু ADMIN-এর জন্য
router.use(auth("ADMIN"));

router.get("/users", adminController.getAllUsers);

router.patch(
    "/users/:id",
    validateRequest(adminValidation.updateUserStatusValidationSchema),
    adminController.updateUserStatus
);

router.get("/properties", adminController.getAllProperties);

router.get("/rentals", adminController.getAllRentals);

// Category management (admin only)
router.get("/categories", categoryController.getAllCategoriesForAdmin);

router.post(
    "/categories",
    validateRequest(categoryValidation.createCategoryValidationSchema),
    categoryController.createCategory
);

router.patch(
    "/categories/:id",
    validateRequest(categoryValidation.updateCategoryValidationSchema),
    categoryController.updateCategory
);

router.delete("/categories/:id", categoryController.deleteCategory);

export const adminRoute = router;
