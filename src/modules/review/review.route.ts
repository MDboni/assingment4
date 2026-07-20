import { Router } from "express";
import { auth } from "../../middleware/auth";
import { validateRequest } from "../../middleware/validateRequest";
import { reviewController } from "./review.controller";
import { reviewValidation } from "./review.validation";

const router = Router();

router.post(
    "/",
    auth("TENANT"),
    validateRequest(reviewValidation.createReviewValidationSchema),
    reviewController.createReview
);

export const reviewRoute = router;
