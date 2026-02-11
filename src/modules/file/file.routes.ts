import { Router } from "express";
import authMiddleware from "./../../middlewares/auth.middleware.js";
import multer from "multer";
import { deleteFile, getFilesHistory, uploadFile } from "./file.controller.js";

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload", authMiddleware, upload.single("file"), uploadFile);
router.get("/:projectId", authMiddleware, getFilesHistory);
router.delete("/:fileId", authMiddleware, deleteFile);

export default router;
