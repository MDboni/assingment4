import { Router } from "express";
import { auth } from "../../middleware/auth";
import { validateRequest } from "../../middleware/validateRequest";
import { paymentController } from "./payment.controler";
import { paymentValidation } from "./payment.validation";

const router = Router();

//  
router.post("/confirm", paymentController.confirmPayment);

router.post(
    "/create",
    auth("TENANT"),
    validateRequest(paymentValidation.createPaymentValidationSchema),
    paymentController.createPayment
);

router.get("/", auth(), paymentController.getPayments);

router.get("/:id", auth(), paymentController.getPaymentById);

export const paymentRoute = router;
