import { Router } from "express";
import { auth } from "../../middleware/auth";
import { validateRequest } from "../../middleware/validateRequest";
import { landlordController } from "./landlord.controller";
import { landlordValidation } from "./landloard.validation";

const router = Router();


router.use(auth("LANDLORD"));

// Property listing
router.post(
    "/properties",
    validateRequest(landlordValidation.createPropertyValidationSchema),
    landlordController.createProperty
);

router.put(
    "/properties/:id",
    validateRequest(landlordValidation.updatePropertyValidationSchema),
    landlordController.updateProperty
);

router.delete("/properties/:id", landlordController.deleteProperty);

// Rental requests
router.get("/requests", landlordController.getLandlordRequests);

router.patch(
    "/requests/:id",
    validateRequest(landlordValidation.decideRentalRequestValidationSchema),
    landlordController.decideRentalRequest
);

router.patch("/requests/:id/complete", landlordController.completeRentalRequest);

export const landlordRoute = router;
