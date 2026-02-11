import { Router } from "express";
import authMiddleware from "./../../middlewares/auth.middleware.js";
import { getHistory, send } from "./messages.controller.js";
import { validate } from "./../../middlewares/validation.middleware.js";
import { sendMessageSchema } from "./messages.schema.js";

const router = Router();

router.post("/", authMiddleware, validate(sendMessageSchema), send);
router.get("/:projectId", authMiddleware, getHistory);

export default router;
