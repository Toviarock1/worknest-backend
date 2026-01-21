import { Router } from "express";
import {
  addMember,
  create,
  listProjectMembers,
  userProjects,
} from "./project.controller";
import authMiddleware from "./../../middlewares/auth.middleware";
import { validate } from "./../../middlewares/validation.middleware";
import { addMemberSchema, createSchema } from "./project.schema";

const router = Router();

router.post("/", authMiddleware, validate(createSchema), create);
router.post(
  "/add-member",
  authMiddleware,
  validate(addMemberSchema),
  addMember
);
router.get("/:id/members", authMiddleware, listProjectMembers);
router.get("/", authMiddleware, userProjects);

export default router;
