import { Router } from "express";
import authMiddleware from "./../../middlewares/auth.middleware.js";
import { validate } from "./../../middlewares/validation.middleware.js";
import {
  createCommentSchema,
  deleteCommentSchema,
  listCommentsSchema,
} from "./comments.schema.js";
import { create, list, remove } from "./comments.controller.js";

const router = Router();

router.get(
  "/task/:taskId",
  authMiddleware,
  validate(listCommentsSchema),
  list,
);

router.post(
  "/task/:taskId",
  authMiddleware,
  validate(createCommentSchema),
  create,
);

router.delete(
  "/:commentId",
  authMiddleware,
  validate(deleteCommentSchema),
  remove,
);

export default router;
