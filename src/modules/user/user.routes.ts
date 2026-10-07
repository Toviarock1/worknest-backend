import { Router, type NextFunction, type Request, type Response } from "express";
import authMiddleware from "./../../middlewares/auth.middleware.js";
import {
  deleteAvatar,
  getUserDetails,
  searchUsers,
  updateUserDetails,
  uploadAvatar,
} from "./user.controller.js";
import { validate } from "./../../middlewares/validation.middleware.js";
import { updateUserSchema } from "./user.schema.js";
import multer from "multer";
import response from "./../../utils/responseObject.js";
import statusCodes from "./../../constants/statusCodes.js";

const AVATAR_MAX_BYTES = 800 * 1024; // 800KB — matches settings UI copy

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: AVATAR_MAX_BYTES },
});

const handleUploadErrors = (
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (
    err instanceof multer.MulterError &&
    (err as { code?: string }).code === "LIMIT_FILE_SIZE"
  ) {
    return res.status(statusCodes.BAD_REQUEST).json(
      response({
        message: "Avatar too large — max 800KB",
        status: statusCodes.BAD_REQUEST,
        success: false,
        data: {},
      }),
    );
  }
  return next(err);
};

const router = Router();

router.get("/me", authMiddleware, getUserDetails);
router.patch(
  "/me",
  authMiddleware,
  validate(updateUserSchema),
  updateUserDetails,
);
router.post(
  "/avatar",
  authMiddleware,
  upload.single("avatar"),
  handleUploadErrors,
  uploadAvatar,
);
router.delete("/avatar", authMiddleware, deleteAvatar);
router.get("/search", authMiddleware, searchUsers);

export default router;
