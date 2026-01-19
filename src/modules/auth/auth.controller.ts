import { Request, Response } from "express";
import * as authService from "./auth.service";
import statusCodes from "./../../constants/statusCodes";
import response from "./../../utils/responseObject";

export const login = async (req: Request, res: Response) => {
  try {
    const user = await authService.login(req.body);

    return res.status(statusCodes.OK).json(
      response({
        message: "Login successful",
        status: statusCodes.OK,
        success: true,
        data: {},
      })
    );
  } catch (err: any) {
    if (err.message === "AUTH_FAILED") {
      return res.status(statusCodes.UNAUTHORIZED).json(
        response({
          message: "Invalid email/password",
          status: statusCodes.UNAUTHORIZED,
          success: false,
          data: {},
        })
      );
    }

    if (err.message === "INVALID_EMAIL/PASSWORD") {
      return res.status(statusCodes.BAD_REQUEST).json(
        response({
          message: "Invalid email/password",
          status: statusCodes.BAD_REQUEST,
          success: false,
          data: {},
        })
      );
    }

    return res.status(statusCodes.SERVER_ERROR).json(
      response({
        message: "Server eror",
        status: statusCodes.SERVER_ERROR,
        success: false,
        data: {},
      })
    );
  }
};
