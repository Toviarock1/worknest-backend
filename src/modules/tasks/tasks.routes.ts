import { Router } from "express";
import authMiddleware from "./../../middlewares/auth.middleware";
import { validate } from "./../../middlewares/validation.middleware";
import {
  assignTaskSchema,
  createTaskSchema,
  updateStatusSchema,
} from "./tasks.schema";
import {
  assignTask,
  create,
  deleteTask,
  listProjectTasks,
  updateStatus,
} from "./tasks.controller";

const router = Router();

router.post("/", authMiddleware, validate(createTaskSchema), create);
router.get("/:id", authMiddleware, listProjectTasks);
router.patch(
  "/:taskId",
  authMiddleware,
  validate(updateStatusSchema),
  updateStatus
);
router.delete("/:taskId", authMiddleware, deleteTask);
router.patch(
  "/:taskId/assign",
  validate(assignTaskSchema),
  authMiddleware,
  assignTask
);

export default router;
