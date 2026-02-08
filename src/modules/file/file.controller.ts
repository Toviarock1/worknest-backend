import statusCodes from "constants/statusCodes";
import { Request, Response } from "express";
import response from "utils/responseObject";
import { catchAsync } from "utils/catchAsync";
import { AppError } from "utils/AppError";
import * as fileService from "./file.service";
import { getIO } from "config/socket";

export const uploadFile = catchAsync(async (req: Request, res: Response) => {
  const { projectId } = req.body;
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
  );

  const io = getIO();
  io.to(projectId).emit("new_file", fileUpload);

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
