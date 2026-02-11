import { Request, Response, NextFunction } from "express";
import response from "../utils/responseObject.js";
import { z, ZodError } from "zod";
import statusCodes from "../constants/statusCodes.js";

export const validate =
  (schema: z.ZodSchema) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // This checks the body, params, and query all at once
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next(); // Data is good! Move to the Controller
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(statusCodes.BAD_REQUEST).json(
          response({
            message: "Validation Error",
            status: statusCodes.BAD_REQUEST,
            success: false,
            // Map Zod errors into a simple list for your frontend
            data: error.issues.map((issue) => ({
              path: issue.path[1], // Returns the field name (e.g., 'email')
              message: issue.message,
            })),
          }),
        );
      }
      return res.status(statusCodes.SERVER_ERROR).json(
        response({
          message: "Internal Server Error",
          status: statusCodes.SERVER_ERROR,
          success: false,
          data: {},
        }),
      );
    }
  };
