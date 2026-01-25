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

export const updateStatus = catchAsync(async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const { status } = req.body;
  const userId = (req as any).user.id;

  const updatedTask = await taskService.updateTaskStatus(
    taskId as string,
    status,
    userId
  );

  const io = getIO();
  io.to(updatedTask.projectId).emit("task_updated", updatedTask);

  return res.status(statusCodes.OK).json(
    response({
      message: "Tasks updated successfully",
      status: statusCodes.OK,
      success: true,
      data: updatedTask,
    })
  );
});

export const assignTask = catchAsync(async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const { assigneeEmail, projectId } = req.body;
  const userId = (req as any).user.id;

  const assignedTo = await taskService.assignProjectTask(
    taskId as string,
    projectId,
    userId,
    assigneeEmail
  );

  const io = getIO();
  io.to(projectId).emit("task_assigned", assignedTo);

  return res.status(statusCodes.OK).json(
    response({
      message: "Tasks assigned successfully",
      status: statusCodes.OK,
      success: true,
      data: assignedTo,
    })
  );
});

export const deleteTask = catchAsync(async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const userId = (req as any).user.id;
  const deletedTask = await taskService.deleteProjectTask(
    taskId as string,
    userId
  );
  return res.status(statusCodes.OK).json(
    response({
      message: "Tasks deleted successfully",
      status: statusCodes.OK,
      success: true,
      data: deletedTask,
    })
  );
});
