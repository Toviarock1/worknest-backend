import { Router } from "express";
import {
  addMember,
  create,
  deleteProject,
  listProjectMembers,
  removeMember,
  update,
  userProjects,
} from "./project.controller";
import authMiddleware from "./../../middlewares/auth.middleware";
import { validate } from "./../../middlewares/validation.middleware";
import { MemberSchema, createSchema, updateSchema } from "./project.schema";

const router = Router();

router.post("/", authMiddleware, validate(createSchema), create);
router.get("/", authMiddleware, userProjects);
router.post("/add-member", authMiddleware, validate(MemberSchema), addMember);
router.post(
  "/remove-member",
  authMiddleware,
  validate(MemberSchema),
  removeMember,
);
router.patch("/:id", authMiddleware, validate(updateSchema), update);
router.get("/:id/members", authMiddleware, listProjectMembers);
router.delete("/:id", authMiddleware, deleteProject);

export default router;
