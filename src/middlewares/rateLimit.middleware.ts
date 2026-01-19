import statusCodes from "../constants/statusCodes";
import rateLimit from "express-rate-limit";
import response from "../utils/responseObject";

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per window
  message: response({
    message: "Too many requests, please try again later.",
    status: statusCodes.TOO_MANY_REQUEST,
    success: false,
    data: {},
  }),
  standardHeaders: "draft-7", // Modern 2026 standard for RateLimit headers
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 5, // Limit each IP to 100 requests per window
  message: response({
    message: "Too many login attempts from this IP.",
    status: statusCodes.TOO_MANY_REQUEST,
    success: false,
    data: {},
  }),
});
