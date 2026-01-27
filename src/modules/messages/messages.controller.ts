import { Request, Response } from "express";
import * as messageService from "./messages.service";
import { getIO } from "config/socket";
import { catchAsync } from "utils/catchAsync";
import statusCodes from "constants/statusCodes";
import response from "utils/responseObject";

export const send = catchAsync(async (req: Request, res: Response) => {
  const { projectId, content } = req.body;
  const userId = (req as any).user.id;

  const message = await messageService.sendMessage(projectId, userId, content);

  const io = getIO();
  io.to(projectId).emit("new_message", message);

  return res.status(statusCodes.CREATED).json(
    response({
      message: "Message stored",
      status: statusCodes.CREATED,
      success: true,
      data: message,
    })
  );
});

export const getHistory = catchAsync(async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const userId = (req as any).user.id;
  const history = await messageService.getProjectChat(
    projectId as string,
    userId
  );
  return res.status(statusCodes.CREATED).json(
    response({
      message: "Message retrieved successfully",
      status: statusCodes.CREATED,
      success: true,
      data: history,
    })
  );
});
