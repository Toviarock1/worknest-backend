import { Request, Response } from "express";
import statusCodes from "./../../constants/statusCodes.js";
import { catchAsync } from "./../../utils/catchAsync.js";
import response from "./../../utils/responseObject.js";
import { getIO } from "./../../config/socket.js";
import * as commentsService from "./comments.service.js";
import { resolveMentionsForProject } from "./../../utils/mentions.js";

export const list = catchAsync(async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const userId = (req as any).user.id;

  const data = await commentsService.listForTask(taskId as string, userId);

  return res.status(statusCodes.OK).json(
    response({
      message: "Comments retrieved",
      status: statusCodes.OK,
      success: true,
      data,
    }),
  );
});

export const create = catchAsync(async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const { content } = req.body;
  const userId = (req as any).user.id;

  const { comment, projectId } = await commentsService.create(
    taskId as string,
    userId,
    content,
  );

  const io = getIO();
  io.to(projectId).emit("comment_created", { taskId, comment });

  // Notify mentioned project members.
  const mentions = await resolveMentionsForProject(content, projectId);
  for (const m of mentions) {
    if (m.userId === userId) continue; // don't ping yourself
    io.to(m.userId).emit("mention", {
      source: "comment",
      projectId,
      taskId,
      commentId: comment.id,
      excerpt: content.slice(0, 200),
      from: { id: userId, name: (req as any).user.name ?? null },
    });
  }

  return res.status(statusCodes.CREATED).json(
    response({
      message: "Comment posted",
      status: statusCodes.CREATED,
      success: true,
      data: comment,
    }),
  );
});

export const remove = catchAsync(async (req: Request, res: Response) => {
  const { commentId } = req.params;
  const userId = (req as any).user.id;

  const { commentId: id, taskId, projectId } = await commentsService.remove(
    commentId as string,
    userId,
  );

  getIO().to(projectId).emit("comment_deleted", { taskId, commentId: id });

  return res.status(statusCodes.OK).json(
    response({
      message: "Comment deleted",
      status: statusCodes.OK,
      success: true,
      data: { id },
    }),
  );
});
