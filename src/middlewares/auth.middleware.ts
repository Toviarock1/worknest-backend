import statusCodes from "./../constants/statusCodes.js";
import { NextFunction, Request, Response } from "express";
import response from "./../utils/responseObject.js";
import jwt from "jsonwebtoken";
import { env } from "./../config/env.js";

export default function (req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(statusCodes.UNAUTHORIZED).json(
      response({
        message: "Access denied",
        status: statusCodes.UNAUTHORIZED,
        success: false,
        data: {},
      }),
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);

    (req as any).user = decoded;

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(statusCodes.UNAUTHORIZED).json(
        response({
          message: "Token expired",
          status: statusCodes.UNAUTHORIZED,
          success: false,
          data: {},
        }),
      );
    }

    return res.status(statusCodes.BAD_REQUEST).json(
      response({
        message: "Invalid token supply",
        status: statusCodes.BAD_REQUEST,
        success: false,
        data: {},
      }),
    );
  }
}
