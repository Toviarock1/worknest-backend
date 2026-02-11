import statusCodes from "./../../constants/statusCodes.js";
import { Request, Response } from "express";
import { catchAsync } from "./../../utils/catchAsync.js";
import * as userService from "./user.service.js";
import response from "./../../utils/responseObject.js";

export const getUserDetails = catchAsync(
  async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const user = await userService.userDetails(userId);

    return res.status(statusCodes.OK).json(
      response({
        message: "User details retrieved successfully",
        status: statusCodes.OK,
        success: true,
        data: user,
      }),
    );
  },
);

export const updateUserDetails = catchAsync(
  async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { name, password } = req.body;

    const user = await userService.updateUser(userId, name, password);

    return res.status(statusCodes.OK).json(
      response({
        message: "User updated successfully",
        status: statusCodes.OK,
        success: true,
        data: user,
      }),
    );
  },
);

export const searchUsers = catchAsync(async (req: Request, res: Response) => {
  const query = req.query.q;
  const userId = (req as any).user.id;

  const users = await userService.searchUsersByEmail(query as string, userId);

  return res.status(statusCodes.OK).json(
    response({
      message: "User profile fetched",
      status: statusCodes.OK,
      success: true,
      data: users,
    }),
  );
});
