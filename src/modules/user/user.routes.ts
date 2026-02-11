import { Router } from "express";
import authMiddleware from "./../../middlewares/auth.middleware.js";
import {
  getUserDetails,
  searchUsers,
  updateUserDetails,
} from "./user.controller.js";
import { validate } from "./../../middlewares/validation.middleware.js";
import { updateUserSchema } from "./user.schema.js";

const router = Router();

router.get("/me", authMiddleware, getUserDetails);
router.patch(
  "/me",
  authMiddleware,
  validate(updateUserSchema),
  updateUserDetails,
);
router.get("/search", authMiddleware, searchUsers);

export default router;
