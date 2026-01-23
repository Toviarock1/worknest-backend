import { Request, Response } from "express";
import statusCodes from "./../../constants/statusCodes";
import { catchAsync } from "./../../utils/catchAsync";
import * as taskService from "./tasks.service";
import response from "./../../utils/responseObject";
import { getIO } from "config/socket";

export const create = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  const task = await taskService.createTask(req.body, userId);

  const io = getIO();
  io.to(req.body.projectId).emit("task_created", task);

  return res.status(statusCodes.CREATED).json(
    response({
      message: "Task created successfully",
      status: statusCodes.CREATED,
      success: true,
      data: task,
    })
  );
});

export const listProjectTasks = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const allTasks = await taskService.listTasks(id as string, userId);
    return res.status(statusCodes.CREATED).json(
      response({
        message: "Tasks retrieved successfully",
        status: statusCodes.CREATED,
        success: true,
        data: allTasks,
      })
    );
  }
);
