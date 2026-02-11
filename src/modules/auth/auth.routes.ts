import { Router } from "express";
import { login, register } from "./auth.controller.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { loginSchema, registerSchema } from "./auth.schema.js";
import { authLimiter } from "./../../middlewares/rateLimit.middleware.js";

const router = Router();

router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/register", authLimiter, validate(registerSchema), register);

export default router;
