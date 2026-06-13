import statusCodes from "./../../constants/statusCodes.js";
import { Request, Response } from "express";
import response from "./../../utils/responseObject.js";
import { catchAsync } from "./../../utils/catchAsync.js";
import { AppError } from "./../../utils/AppError.js";
import * as fileService from "./file.service.js";
import { getIO } from "./../../config/socket.js";

export const uploadFile = catchAsync(async (req: Request, res: Response) => {
  const { projectId, taskId } = req.body;
  const userId = (req as any).user.id;
  const file = req.file;

  if (!file) throw new AppError("No file uploaded", statusCodes.BAD_REQUEST);

  const cloudResponse = await fileService.uploadToCloudinary(file.buffer);

  const fileUpload = await fileService.saveFileRecord(
    projectId,
    userId,
    file.originalname,
    cloudResponse.secure_url,
    file.size,
    taskId || undefined,
  );

  const io = getIO();
  // Chat feed only cares about untagged uploads; task attachments emit their own
  // event so the task panel can patch its cache.
  if (taskId) {
    io.to(projectId).emit("task_file_added", { taskId, file: fileUpload });
  } else {
    io.to(projectId).emit("new_file", fileUpload);
  }

  return res.status(statusCodes.CREATED).json(
    response({
      message: "File uploaded",
      status: statusCodes.CREATED,
      success: true,
      data: fileUpload,
    }),
  );
});

export const getFilesHistory = catchAsync(
  async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const userId = (req as any).user.id;
    const fileHistory = await fileService.getProjectFiles(
      projectId as string,
      userId,
    );

    return res.status(statusCodes.OK).json(
      response({
        message: "File retrieved successfully",
        status: statusCodes.OK,
        success: true,
        data: fileHistory,
      }),
    );
  },
);

export const deleteFile = catchAsync(async (req: Request, res: Response) => {
  const { fileId } = req.params;
  const userId = (req as any).user.id;
  const fileHistory = await fileService.deleteFile(fileId as string, userId);

  const io = getIO();
  io.to(fileHistory.projectId).emit("file_deleted", { fileId });

  return res.status(statusCodes.OK).json(
    response({
      message: "File deleted successfully",
      status: statusCodes.OK,
      success: true,
      data: fileHistory,
    }),
  );
});
