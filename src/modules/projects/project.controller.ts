import { Response, Request, NextFunction } from "express";
import * as projectService from "./project.service";
import response from "./../../utils/responseObject";
import statusCodes from "./../../constants/statusCodes";
import { getIO } from "./../../config/socket";

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.body;
    const { id: ownerId } = (req as any).user;

    const project = await projectService.create(name, ownerId);

    return res.status(statusCodes.CREATED).json(
      response({
        message: "Project created successfully",
        status: statusCodes.CREATED,
        success: true,
        data: project,
      })
    );
  } catch (err) {
    if (err.message === "DUPLICATE_PROJECT")
      return res.status(statusCodes.CONFLICT).json(
        response({
          message: "Project already exist",
          status: statusCodes.CONFLICT,
          success: false,
          data: {},
        })
      );

    next(err);
  }
};

export const addMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { projectId, userEmail } = req.body;

    const addMember = await projectService.addMember(
      projectId,
      userEmail,
      (req as any).user.id
    );

    const io = getIO();
    io.to(addMember.userId).emit("invited_to_project", { projectId });

    return res.status(statusCodes.OK).json(
      response({
        message: "Member added",
        status: statusCodes.OK,
        success: true,
        data: { ...addMember },
      })
    );
  } catch (err) {
    if (err.message === "UNAUTHORIZED_ACTION")
      return res.status(statusCodes.UNAUTHORIZED).json(
        response({
          message: "Access denied. only owners can add members",
          status: statusCodes.UNAUTHORIZED,
          success: false,
          data: {},
        })
      );

    if (err.message === "USER_NOT_FOUND")
      return res.status(statusCodes.NOTFOUND).json(
        response({
          message: "User does not exist",
          status: statusCodes.NOTFOUND,
          success: false,
          data: {},
        })
      );

    if (err.message === "USER_ALREADY_EXIST")
      return res.status(statusCodes.CONFLICT).json(
        response({
          message: "User is already a member",
          status: statusCodes.CONFLICT,
          success: false,
          data: {},
        })
      );

    next(err);
  }
};

export const listProjectMembers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const allProjectMembers = await projectService.listProjectMembers(
      id as string,
      (req as any).user.id
    );
    return res.status(statusCodes.OK).json(
      response({
        message: `Member retrieved successfully`,
        status: statusCodes.OK,
        success: true,
        data: allProjectMembers,
      })
    );
  } catch (err) {
    if (err.message === "NOT_FOUND") {
      return res.status(statusCodes.NOTFOUND).json(
        response({
          message: `Project not found`,
          status: statusCodes.NOTFOUND,
          success: false,
          data: {},
        })
      );
    }

    if (err.message === "UNAUTHORIZED") {
      return res.status(statusCodes.UNAUTHORIZED).json(
        response({
          message: `Access denied. your not a member of this project`,
          status: statusCodes.UNAUTHORIZED,
          success: false,
          data: {},
        })
      );
    }

    next(err);
  }
};

export const userProjects = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userProjects = await projectService.listAllUserProjects(
      (req as any).user.id
    );
    return res.status(statusCodes.OK).json(
      response({
        message: "User project retrieved successfully",
        status: statusCodes.OK,
        success: true,
        data: userProjects,
      })
    );
  } catch (err) {
    if (err.message === "NOT_MEMBER") {
      return res.status(statusCodes.NOTFOUND).json(
        response({
          message: "User is not a member of any project",
          status: statusCodes.NOTFOUND,
          success: false,
          data: {},
        })
      );
    }
    next(err);
  }
};

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    // console.log(name, description);
    const updatedProject = await projectService.updateProject(
      id as string,
      (req as any).user.id,
      name,
      description
    );

    return res.status(statusCodes.OK).json(
      response({
        message: "Project updated",
        status: statusCodes.OK,
        success: true,
        data: updatedProject,
      })
    );
  } catch (err) {
    if (err.message === "UNAUTHORIZED") {
      return res.status(statusCodes.UNAUTHORIZED).json(
        response({
          message: "User is not the owner",
          status: statusCodes.UNAUTHORIZED,
          success: false,
          data: {},
        })
      );
    }
    next(err);
  }
};
