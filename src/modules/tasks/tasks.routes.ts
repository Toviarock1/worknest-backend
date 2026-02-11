import { Router } from "express";
import authMiddleware from "./../../middlewares/auth.middleware.js";
import { validate } from "./../../middlewares/validation.middleware.js";
import {
  assignTaskSchema,
  createTaskSchema,
  updateStatusSchema,
} from "./tasks.schema.js";
import {
  assignTask,
  create,
  deleteTask,
  listProjectTasks,
  updateStatus,
} from "./tasks.controller.js";

const router = Router();

router.post("/", authMiddleware, validate(createTaskSchema), create);
router.get("/:id", authMiddleware, listProjectTasks);
router.patch(
  "/:taskId",
  authMiddleware,
  validate(updateStatusSchema),
  updateStatus,
);
router.delete("/:taskId", authMiddleware, deleteTask);
router.patch(
  "/:taskId/assign",
  validate(assignTaskSchema),
  authMiddleware,
  assignTask,
);

export default router;
