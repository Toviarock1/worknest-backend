import { Request, Response, NextFunction } from "express";
import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "user-service" },
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

export default function (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.log({
    level: "info",
    message: err.message,
    err,
  });

  res.status(500).json({ message: "Something failed", error: true, data: {} });
}
