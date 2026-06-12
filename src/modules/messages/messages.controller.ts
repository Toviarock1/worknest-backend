import { Request, Response } from "express";
import * as messageService from "./messages.service.js";
import { getIO } from "./../../config/socket.js";
import { catchAsync } from "./../../utils/catchAsync.js";
import statusCodes from "./../../constants/statusCodes.js";
import response from "./../../utils/responseObject.js";
import { resolveMentionsForProject } from "./../../utils/mentions.js";

export const send = catchAsync(async (req: Request, res: Response) => {
  const { projectId, content } = req.body;
  const userId = (req as any).user.id;

  const message = await messageService.sendMessage(projectId, userId, content);

  const io = getIO();
  io.to(projectId).emit("new_message", message);

  // Notify mentioned project members in personal rooms.
  const mentions = await resolveMentionsForProject(content, projectId);
  for (const m of mentions) {
    if (m.userId === userId) continue;
    io.to(m.userId).emit("mention", {
      source: "message",
      projectId,
      messageId: message.id,
      excerpt: content.slice(0, 200),
      from: { id: userId, name: (req as any).user.name ?? null },
    });
  }

  return res.status(statusCodes.CREATED).json(
    response({
      message: "Message stored",
      status: statusCodes.CREATED,
      success: true,
      data: message,
    }),
  );
});

export const getHistory = catchAsync(async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const userId = (req as any).user.id;
  const history = await messageService.getProjectChat(
    projectId as string,
    userId,
  );
  return res.status(statusCodes.OK).json(
    response({
      message: "Message retrieved successfully",
      status: statusCodes.OK,
      success: true,
      data: history,
    }),
  );
});
