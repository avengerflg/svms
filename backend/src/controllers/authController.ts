import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { UserModel } from "../models/User";
import { SchoolModel } from "../models/School";
import { config } from "../config";
import { ApiResponse, UserRole } from "../types";
import { asyncHandler } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";

// Generate JWT tokens
const generateTokens = (userId: string) => {
  const payload = { userId };

  const accessTokenOptions: SignOptions = {
    expiresIn: config.jwt.expiresIn as any,
  };

  const refreshTokenOptions: SignOptions = {
    expiresIn: config.jwt.refreshExpiresIn as any,
  };

  const accessToken = jwt.sign(payload, config.jwt.secret, accessTokenOptions);
  const refreshToken = jwt.sign(
    payload,
    config.jwt.refreshSecret,
    refreshTokenOptions
  );

  return { accessToken, refreshToken };
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public (for initial super admin) / Private (for other users)
export const register = asyncHandler(
  async (req: Request, res: Response<ApiResponse<any>>) => {
    const { email, password, firstName, lastName, role, schoolId } = req.body;

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // If registering non-super-admin, verify school exists
    if (role !== UserRole.SUPER_ADMIN && schoolId) {
      const school = await SchoolModel.findById(schoolId);
      if (!school) {
        return res.status(400).json({
          success: false,
          message: "Invalid school ID",
        });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await UserModel.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      schoolId: role !== UserRole.SUPER_ADMIN ? schoolId : undefined,
    });

    const { accessToken, refreshToken } = generateTokens(
      (user._id as any).toString()
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: user.toJSON(),
        accessToken,
        refreshToken,
      },
    });
  }
);

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(
  async (req: Request, res: Response<ApiResponse<any>>) => {
    const { email, password } = req.body;

    // Check if user exists
    const user = await UserModel.findOne({ email }).populate(
      "schoolId",
      "name"
    );
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const { accessToken, refreshToken } = generateTokens(
      (user._id as any).toString()
    );

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: user.toJSON(),
        accessToken,
        refreshToken,
      },
    });
  }
);

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(
  async (req: AuthRequest, res: Response<ApiResponse<any>>) => {
    const user = await UserModel.findById(req.user.id).populate(
      "schoolId",
      "name"
    );

    res.json({
      success: true,
      message: "User profile retrieved successfully",
      data: { user: user?.toJSON() },
    });
  }
);

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
export const refreshToken = asyncHandler(
  async (req: Request, res: Response<ApiResponse<any>>) => {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required",
      });
    }

    try {
      const decoded = jwt.verify(token, config.jwt.refreshSecret) as any;
      const user = await UserModel.findById(decoded.userId);

      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: "Invalid refresh token",
        });
      }

      const { accessToken, refreshToken: newRefreshToken } = generateTokens(
        (user._id as any).toString()
      );

      res.json({
        success: true,
        message: "Token refreshed successfully",
        data: {
          accessToken,
          refreshToken: newRefreshToken,
        },
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }
  }
);

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = asyncHandler(
  async (req: AuthRequest, res: Response<ApiResponse<null>>) => {
    const { currentPassword, newPassword } = req.body;

    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedNewPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  }
);
