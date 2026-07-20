import { Router } from "express";
import { auth } from "../../middleware/auth";
import { validateRequest } from "../../middleware/validateRequest";
import { userController } from "./user.controller";
import { userValidation } from "./user.validation";

const router = Router();

// যেকোনো logged-in user নিজের profile দেখবে ও বদলাবে
router.get("/me", auth(), userController.getMyProfile);

router.patch(
    "/me",
    auth(),
    validateRequest(userValidation.updateProfileValidationSchema),
    userController.updateMyProfile
);

router.patch(
    "/me/password",
    auth(),
    validateRequest(userValidation.changePasswordValidationSchema),
    userController.changeMyPassword
);

export const userRoute = router;
