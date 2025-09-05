import { Request, Response } from "express";
import { VisitorModel } from "../models/Visitor";
import { UserModel } from "../models/User";
import { ApiResponse, VisitorStatus, UserRole } from "../types";
import { asyncHandler } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";
import { generateQRCode, generateVisitorBadge } from "../utils/qrGenerator";
import { sendNotification } from "../services/notificationService";

// @desc    Create new visitor entry
// @route   POST /api/visitors
// @access  Private
export const createVisitor = asyncHandler(
  async (req: AuthRequest, res: Response<ApiResponse<any>>) => {
    const {
      firstName,
      lastName,
      email,
      phone,
      idProof,
      purposeOfVisit,
      hostStaffId,
      expectedCheckOutTime,
    } = req.body;

    // Verify host staff exists
    const hostStaff = await UserModel.findById(hostStaffId);
    if (!hostStaff) {
      return res.status(400).json({
        success: false,
        message: "Invalid host staff ID",
      });
    }

    // Check if visitor is blacklisted
    const existingVisitor = await VisitorModel.findOne({
      $or: [{ email }, { phone }, { "idProof.number": idProof.number }],
      isBlacklisted: true,
    });

    if (existingVisitor) {
      return res.status(403).json({
        success: false,
        message: "Visitor is blacklisted and cannot enter",
      });
    }

    // Generate unique QR code
    const qrCode = await generateQRCode();

    // Create visitor
    const visitor = await VisitorModel.create({
      firstName,
      lastName,
      email,
      phone,
      idProof,
      purposeOfVisit,
      hostStaffId,
      schoolId: req.user.schoolId || req.body.schoolId,
      expectedCheckOutTime,
      qrCode,
      status: VisitorStatus.PENDING,
    });

    // Populate host staff details
    await visitor.populate("hostStaffId", "firstName lastName email");

    // Send notification to host staff
    if (hostStaff.email) {
      await sendNotification({
        type: "email",
        to: hostStaff.email,
        subject: "New Visitor Request",
        message: `${firstName} ${lastName} has requested to visit you. Purpose: ${purposeOfVisit}`,
      });
    }

    res.status(201).json({
      success: true,
      message: "Visitor entry created successfully",
      data: { visitor: visitor.toJSON() },
    });
  }
);

// @desc    Get all visitors
// @route   GET /api/visitors
// @access  Private
export const getVisitors = asyncHandler(
  async (req: AuthRequest, res: Response<ApiResponse<any>>) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const search = req.query.search as string;

    // Build query based on user role
    let query: any = {};

    if (req.user.role !== UserRole.SUPER_ADMIN) {
      query.schoolId = req.user.schoolId;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [visitors, total] = await Promise.all([
      VisitorModel.find(query)
        .populate("hostStaffId", "firstName lastName")
        .populate("schoolId", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      VisitorModel.countDocuments(query),
    ]);

    res.json({
      success: true,
      message: "Visitors retrieved successfully",
      data: {
        visitors: visitors.map((v) => v.toJSON()),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
        },
      },
    });
  }
);

// @desc    Get visitor by ID
// @route   GET /api/visitors/:id
// @access  Private
export const getVisitorById = asyncHandler(
  async (req: AuthRequest, res: Response<ApiResponse<any>>) => {
    const visitor = await VisitorModel.findById(req.params.id)
      .populate("hostStaffId", "firstName lastName email")
      .populate("schoolId", "name");

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found",
      });
    }

    // Check access permissions
    if (
      req.user.role !== UserRole.SUPER_ADMIN &&
      (visitor.schoolId as any)?._id.toString() !==
        req.user.schoolId?.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.json({
      success: true,
      message: "Visitor retrieved successfully",
      data: { visitor: visitor.toJSON() },
    });
  }
);

// @desc    Approve visitor
// @route   PUT /api/visitors/:id/approve
// @access  Private (Teachers, Staff, Admin)
export const approveVisitor = asyncHandler(
  async (req: AuthRequest, res: Response<ApiResponse<any>>) => {
    const visitor = await VisitorModel.findById(req.params.id);

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found",
      });
    }

    if (visitor.status !== VisitorStatus.PENDING) {
      return res.status(400).json({
        success: false,
        message: "Visitor is not in pending status",
      });
    }

    // Generate visitor badge
    const badgePath = await generateVisitorBadge(visitor);

    visitor.status = VisitorStatus.APPROVED;
    visitor.badge = badgePath;
    await visitor.save();

    // Send notification to visitor
    if (visitor.email) {
      await sendNotification({
        type: "email",
        to: visitor.email,
        subject: "Visit Approved",
        message: `Your visit request has been approved. Please show this QR code at entry: ${visitor.qrCode}`,
      });
    }

    res.json({
      success: true,
      message: "Visitor approved successfully",
      data: { visitor: visitor.toJSON() },
    });
  }
);

// @desc    Check in visitor
// @route   PUT /api/visitors/:id/checkin
// @access  Private (Security, Front Desk)
export const checkInVisitor = asyncHandler(
  async (req: AuthRequest, res: Response<ApiResponse<any>>) => {
    const visitor = await VisitorModel.findById(req.params.id);

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found",
      });
    }

    if (visitor.status !== VisitorStatus.APPROVED) {
      return res.status(400).json({
        success: false,
        message: "Visitor is not approved for entry",
      });
    }

    visitor.status = VisitorStatus.CHECKED_IN;
    visitor.checkInTime = new Date();
    await visitor.save();

    // Notify host staff
    const hostStaff = await UserModel.findById(visitor.hostStaffId);
    if (hostStaff?.email) {
      await sendNotification({
        type: "email",
        to: hostStaff.email,
        subject: "Visitor Checked In",
        message: `${visitor.firstName} ${visitor.lastName} has checked in and is on their way to meet you.`,
      });
    }

    res.json({
      success: true,
      message: "Visitor checked in successfully",
      data: { visitor: visitor.toJSON() },
    });
  }
);

// @desc    Check out visitor
// @route   PUT /api/visitors/:id/checkout
// @access  Private (Security, Front Desk)
export const checkOutVisitor = asyncHandler(
  async (req: AuthRequest, res: Response<ApiResponse<any>>) => {
    const visitor = await VisitorModel.findById(req.params.id);

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found",
      });
    }

    if (visitor.status !== VisitorStatus.CHECKED_IN) {
      return res.status(400).json({
        success: false,
        message: "Visitor is not checked in",
      });
    }

    visitor.status = VisitorStatus.CHECKED_OUT;
    visitor.checkOutTime = new Date();
    await visitor.save();

    res.json({
      success: true,
      message: "Visitor checked out successfully",
      data: { visitor: visitor.toJSON() },
    });
  }
);

// @desc    Blacklist visitor
// @route   PUT /api/visitors/:id/blacklist
// @access  Private (Admin only)
export const blacklistVisitor = asyncHandler(
  async (req: AuthRequest, res: Response<ApiResponse<any>>) => {
    const { reason } = req.body;

    const visitor = await VisitorModel.findById(req.params.id);

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found",
      });
    }

    visitor.isBlacklisted = true;
    await visitor.save();

    res.json({
      success: true,
      message: "Visitor blacklisted successfully",
      data: { visitor: visitor.toJSON() },
    });
  }
);
