import { Router } from "express";
import { login } from "./auth.controller";
import { validate } from "../../middlewares/validation.middleware";
import { loginSchema } from "./auth.schema";
import { authLimiter } from "./../../middlewares/rateLimit.middleware";

const router = Router();

router.post("/login", authLimiter, validate(loginSchema), login);

export default router;
