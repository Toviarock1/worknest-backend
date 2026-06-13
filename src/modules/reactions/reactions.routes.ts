import { Router } from "express";
import authMiddleware from "./../../middlewares/auth.middleware.js";
import { validate } from "./../../middlewares/validation.middleware.js";
import { toggleReactionSchema } from "./reactions.schema.js";
import { toggle } from "./reactions.controller.js";

const router = Router();

// Single toggle endpoint — idempotent on the client side via the cache patcher.
router.post(
  "/message/:messageId/:emoji",
  authMiddleware,
  validate(toggleReactionSchema),
  toggle,
);

export default router;
