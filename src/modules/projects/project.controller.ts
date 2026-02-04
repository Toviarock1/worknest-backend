import { Response, Request, NextFunction } from "express";
import * as projectService from "./project.service";
import response from "./../../utils/responseObject";
import statusCodes from "./../../constants/statusCodes";
import { getIO } from "./../../config/socket";
import { catchAsync } from "./../../utils/catchAsync";

export const create = catchAsync(async (req: Request, res: Response) => {
  const { name } = req.body;
  const { id: ownerId } = (req as any).user;

  const project = await projectService.create(name, ownerId);

  return res.status(statusCodes.CREATED).json(
    response({
      message: "Project created successfully",
      status: statusCodes.CREATED,
      success: true,
      data: project,
    }),
  );
});

export const addMember = catchAsync(async (req: Request, res: Response) => {
  const { projectId, userEmail } = req.body;

  const addMember = await projectService.addMember(
    projectId,
    userEmail,
    (req as any).user.id,
  );

  const io = getIO();
  io.to(addMember.userId).emit("invited_to_project", { projectId });

  return res.status(statusCodes.OK).json(
    response({
      message: "Member added",
      status: statusCodes.OK,
      success: true,
      data: { ...addMember },
    }),
  );
});

export const removeMember = catchAsync(async (req: Request, res: Response) => {
  const { projectId, userEmail } = req.body;

  const removedUser = await projectService.removeMember(
    projectId,
    userEmail,
    (req as any).user.id,
  );

  const io = getIO();
  io.to(removedUser.userId).emit("removed_from_project", { projectId });

  return res.status(statusCodes.OK).json(
    response({
      message: "Member removed",
      status: statusCodes.OK,
      success: true,
      data: { ...removedUser },
    }),
  );
});

export const listProjectMembers = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const allProjectMembers = await projectService.listProjectMembers(
      id as string,
      (req as any).user.id,
    );
    return res.status(statusCodes.OK).json(
      response({
        message: `Member retrieved successfully`,
        status: statusCodes.OK,
        success: true,
        data: allProjectMembers,
      }),
    );
  },
);

export const userProjects = catchAsync(async (req: Request, res: Response) => {
  const userProjects = await projectService.listAllUserProjects(
    (req as any).user.id,
  );
  return res.status(statusCodes.OK).json(
    response({
      message: "User project retrieved successfully",
      status: statusCodes.OK,
      success: true,
      data: userProjects,
    }),
  );
});

export const update = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description } = req.body;
  // console.log(name, description);
  const updatedProject = await projectService.updateProject(
    id as string,
    (req as any).user.id,
    name,
    description,
  );

  return res.status(statusCodes.OK).json(
    response({
      message: "Project updated",
      status: statusCodes.OK,
      success: true,
      data: updatedProject,
    }),
  );
});

export const deleteProject = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { id: userId } = (req as any).user;
  const deletedProject = await projectService.deleteProject(
    id as string,
    userId,
  );

  return res.status(statusCodes.OK).json(
    response({
      message: "Project deleted successfully",
      status: statusCodes.OK,
      success: true,
      data: deletedProject,
    }),
  );
});
