import { Router } from "express";
import authMiddleware from "./../../middlewares/auth.middleware.js";
import { validate } from "./../../middlewares/validation.middleware.js";
import { createLinkSchema, deleteLinkSchema } from "./taskLinks.schema.js";
import { create, remove } from "./taskLinks.controller.js";

const router = Router();

router.post(
  "/task/:taskId",
  authMiddleware,
  validate(createLinkSchema),
  create,
);

router.delete(
  "/:linkId",
  authMiddleware,
  validate(deleteLinkSchema),
  remove,
);

export default router;
