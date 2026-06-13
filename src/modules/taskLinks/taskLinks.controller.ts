import { Request, Response } from "express";
import statusCodes from "./../../constants/statusCodes.js";
import { catchAsync } from "./../../utils/catchAsync.js";
import response from "./../../utils/responseObject.js";
import { getIO } from "./../../config/socket.js";
import * as taskLinksService from "./taskLinks.service.js";

export const create = catchAsync(async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const { targetTaskId, type } = req.body;
  const userId = (req as any).user.id;

  const { link, projectId } = await taskLinksService.createLink(
    taskId as string,
    targetTaskId,
    type,
    userId,
  );

  getIO().to(projectId).emit("task_link_created", { link });

  return res.status(statusCodes.CREATED).json(
    response({
      message: "Link created",
      status: statusCodes.CREATED,
      success: true,
      data: link,
    }),
  );
});

export const remove = catchAsync(async (req: Request, res: Response) => {
  const { linkId } = req.params;
  const userId = (req as any).user.id;

  const result = await taskLinksService.deleteLink(linkId as string, userId);

  getIO()
    .to(result.projectId)
    .emit("task_link_deleted", {
      linkId: result.linkId,
      fromTaskId: result.fromTaskId,
      toTaskId: result.toTaskId,
    });

  return res.status(statusCodes.OK).json(
    response({
      message: "Link removed",
      status: statusCodes.OK,
      success: true,
      data: { id: result.linkId },
    }),
  );
});
