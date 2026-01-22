import { NextFunction, Request, Response } from "express";
import * as authService from "./auth.service";
import statusCodes from "./../../constants/statusCodes";
import response from "./../../utils/responseObject";
import { catchAsync } from "./../../utils/catchAsync";

export const register = catchAsync(async (req: Request, res: Response) => {
  const userCreated = await authService.register(req.body);
  return res.status(statusCodes.CREATED).json(
    response({
      message: "User created",
      status: statusCodes.CREATED,
      success: true,
      data: userCreated,
    })
  );
});

export const login = async (req: Request, res: Response) => {
  const user = await authService.login(req.body);

  return res.status(statusCodes.OK).json(
    response({
      message: "Login successful",
      status: statusCodes.OK,
      success: true,
      data: user,
    })
  );
};
