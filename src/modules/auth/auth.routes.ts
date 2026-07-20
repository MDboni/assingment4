import { Router } from "express";
import { auth } from "../../middleware/auth";
import { validateRequest } from "../../middleware/validateRequest";
import { authController } from "./auth.controller";
import { authValidation } from "./auth.validation";

const router = Router();

router.post(
    "/register",
    validateRequest(authValidation.registerValidationSchema),
    authController.registerUser
);

router.post(
    "/login",
    validateRequest(authValidation.loginValidationSchema),
    authController.loginUser
);

router.get("/me", auth(), authController.getMe);

router.post("/logout", authController.logoutUser);

export const authRoute = router;
