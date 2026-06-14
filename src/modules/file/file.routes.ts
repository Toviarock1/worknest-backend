import { Router, type NextFunction, type Request, type Response } from "express";
import authMiddleware from "./../../middlewares/auth.middleware.js";
import multer from "multer";
import response from "./../../utils/responseObject.js";
import statusCodes from "./../../constants/statusCodes.js";
import { deleteFile, getFilesHistory, uploadFile } from "./file.controller.js";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES },
});

// Translate multer's LIMIT_FILE_SIZE error into our standard envelope so the
// frontend's typed AxiosError handler surfaces a friendly message.
const handleUploadErrors = (
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
    return res.status(statusCodes.BAD_REQUEST).json(
      response({
        message: "File too large — max 5 MB",
        status: statusCodes.BAD_REQUEST,
        success: false,
        data: {},
      }),
    );
  }
  return next(err);
};

const router = Router();

router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  handleUploadErrors,
  uploadFile,
);
router.get("/:projectId", authMiddleware, getFilesHistory);
router.delete("/:fileId", authMiddleware, deleteFile);

export default router;
