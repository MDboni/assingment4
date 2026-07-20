import { Router } from "express";
import { auth } from "../../middleware/auth";
import { validateRequest } from "../../middleware/validateRequest";
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

export const adminRoute = router;
