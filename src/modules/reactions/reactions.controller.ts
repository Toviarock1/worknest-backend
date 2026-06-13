import { Request, Response } from "express";
import statusCodes from "./../../constants/statusCodes.js";
import { catchAsync } from "./../../utils/catchAsync.js";
import response from "./../../utils/responseObject.js";
import { getIO } from "./../../config/socket.js";
import * as reactionsService from "./reactions.service.js";

export const toggle = catchAsync(async (req: Request, res: Response) => {
  const { messageId, emoji } = req.params;
  const userId = (req as any).user.id;

  const result = await reactionsService.toggleReaction(
    messageId as string,
    userId,
    emoji as string,
  );

  const event =
    result.kind === "added"
      ? "message_reaction_added"
      : "message_reaction_removed";

  getIO()
    .to(result.projectId)
    .emit(event, {
      messageId: result.messageId,
      emoji: result.emoji,
      userId: result.userId,
    });

  return res.status(statusCodes.OK).json(
    response({
      message: result.kind === "added" ? "Reaction added" : "Reaction removed",
      status: statusCodes.OK,
      success: true,
      data: result,
    }),
  );
});
