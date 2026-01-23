import { Router } from "express";
import authMiddleware from "./../../middlewares/auth.middleware";
import { validate } from "./../../middlewares/validation.middleware";
import { createTaskSchema } from "./tasks.schema";
import { create, listProjectTasks } from "./tasks.controller";

const router = Router();

router.post("/", authMiddleware, validate(createTaskSchema), create);
router.get("/:id", authMiddleware, listProjectTasks);

export default router;
