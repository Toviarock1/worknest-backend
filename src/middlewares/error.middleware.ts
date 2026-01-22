import { Request, Response, NextFunction } from "express";
import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }), // Captures the stack trace
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

// Add console logging for development
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

export default function (
  err: any, // Changed to 'any' to access custom properties like .statusCode
  req: Request,
  res: Response,
  next: NextFunction
) {
  // 1. Determine the status (Use 500 only if not specified)
  const statusCode = err.statusCode || 500;

  // 2. Log based on severity
  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.url}`, { err });
  } else {
    logger.warn(`${req.method} ${req.url} - ${err.message}`);
  }

  // 3. Clean response for the user
  const message =
    statusCode === 500 ? "Something went wrong on our end" : err.message;

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: message,
    data: process.env.NODE_ENV === "development" ? { stack: err.stack } : {},
  });
}
