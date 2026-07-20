import { Router } from "express";
import { auth } from "../../middleware/auth";
import { validateRequest } from "../../middleware/validateRequest";
import { rentalController } from "./rental.controler";
import { rentalValidation } from "./rental.validation";

const router = Router();

router.post(
    "/",
    auth("TENANT"),
    validateRequest(rentalValidation.createRentalValidationSchema),
    rentalController.createRental
);

router.get("/", auth("TENANT"), rentalController.getMyRentals);

router.get("/:id", auth(), rentalController.getRentalById);

router.patch("/:id/cancel", auth("TENANT"), rentalController.cancelRental);

export const rentalRoute = router;
