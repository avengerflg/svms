import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { ApiResponse } from "../types";

export const validateRequest = (
  req: Request,
  res: Response<ApiResponse<null>>,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((error) => error.msg),
    });
    return;
  }

  next();
};
