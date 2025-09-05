import { Request, Response, NextFunction } from "express";
import winston from "winston";
import { ApiResponse } from "../types";

// Configure logger
const logger = winston.createLogger({
  level: "error",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/error.log" }),
  ],
});

export const errorHandler = (
  error: any,
  req: Request,
  res: Response<ApiResponse<null>>,
  next: NextFunction
): void => {
  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal Server Error";
  let errors: string[] = [];

  // Log the error
  logger.error({
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  // Mongoose validation error
  if (error.name === "ValidationError") {
    statusCode = 400;
    message = "Validation Error";
    errors = Object.values(error.errors).map((err: any) => err.message);
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    statusCode = 400;
    message = "Duplicate field value";
    const field = Object.keys(error.keyPattern)[0];
    errors = [`${field} already exists`];
  }

  // Mongoose cast error (invalid ObjectId)
  if (error.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  }

  // JWT errors
  if (error.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (error.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  // Multer errors (file upload)
  if (error.code === "LIMIT_FILE_SIZE") {
    statusCode = 400;
    message = "File too large";
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: errors.length > 0 ? errors : undefined,
  });
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 Not Found handler
export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
};
