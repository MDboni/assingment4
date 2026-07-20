import { Router } from "express";
import { propertyController } from "./property.controller";

const router = Router();

// Public
router.get("/", propertyController.getAllProperties);
router.get("/:id", propertyController.getPropertyById);

export const propertyRoute = router;
