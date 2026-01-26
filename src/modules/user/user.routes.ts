import { Router } from "express";
import authMiddleware from "./../../middlewares/auth.middleware";
import {
  getUserDetails,
  searchUsers,
  updateUserDetails,
} from "./user.controller";
import { validate } from "middlewares/validation.middleware";
import { updateUserSchema } from "./user.schema";

const router = Router();

router.get("/me", authMiddleware, getUserDetails);
router.patch(
  "/me",
  authMiddleware,
  validate(updateUserSchema),
  updateUserDetails
);
router.get("/search", authMiddleware, searchUsers);

export default router;
