import { Router } from "express";
import {
  addMember,
  create,
  deleteProject,
  listProjectMembers,
  update,
  userProjects,
} from "./project.controller";
import authMiddleware from "./../../middlewares/auth.middleware";
import { validate } from "./../../middlewares/validation.middleware";
import { addMemberSchema, createSchema, updateSchema } from "./project.schema";

const router = Router();

router.post("/", authMiddleware, validate(createSchema), create);
router.get("/", authMiddleware, userProjects);
router.post(
  "/add-member",
  authMiddleware,
  validate(addMemberSchema),
  addMember
);
router.patch("/:id", authMiddleware, validate(updateSchema), update);
router.get("/:id/members", authMiddleware, listProjectMembers);
router.delete("/:id", authMiddleware, deleteProject);

export default router;
