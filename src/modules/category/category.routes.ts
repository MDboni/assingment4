import { Router } from "express";
import { categoryController } from "./category.controller";

const router = Router();

// Public
router.get("/", categoryController.getAllCategories);

export const categoryRoute = router;
