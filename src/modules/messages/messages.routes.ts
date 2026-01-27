import { Router } from "express";
import authMiddleware from "middlewares/auth.middleware";
import { getHistory, send } from "./messages.controller";
import { validate } from "middlewares/validation.middleware";
import { sendMessageSchema } from "./messages.schema";

const router = Router();

router.post("/", authMiddleware, validate(sendMessageSchema), send);
router.get("/:projectId", authMiddleware, getHistory);

export default router;
