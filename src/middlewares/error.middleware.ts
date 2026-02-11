import { Request, Response, NextFunction } from "express";
import winston from "winston";

// Custom format to ensure error details are visible to Winston
const errorEnumeration = winston.format((info) => {
  if (info instanceof Error) {
    return Object.assign({ message: info.message, stack: info.stack }, info);
  }
  return info;
});

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    errorEnumeration(), // MUST come before json()
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          ({ timestamp, level, message, stack, ...meta }) => {
            // Print a clean, readable line for the console
            const metaStr = Object.keys(meta).length
              ? JSON.stringify(meta)
              : "";
            return `${timestamp} ${level}: ${message} ${metaStr} ${
              stack ? "\n" + stack : ""
            }`;
          },
        ),
      ),
    }),
  );
}

export default function (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const statusCode = err.statusCode || 500;

  // Add more context: who, where, and what
  const errorContext = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    user: (req as any).user?.id || "anonymous",
    // body: req.body, // CAUTION: Avoid logging sensitive data like passwords
  };

  if (statusCode >= 500) {
    logger.error(err.message, { ...errorContext, stack: err.stack });
  } else {
    logger.warn(err.message, errorContext);
  }

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message:
      statusCode === 500 ? "Something went wrong on our end" : err.message,
    // Provide stack trace only in development
    data:
      process.env.NODE_ENV === "production"
        ? { stack: err.stack, ...errorContext }
        : {},
  });
}
