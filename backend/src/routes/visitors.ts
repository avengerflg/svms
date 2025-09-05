import express from "express";
import {
  createVisitor,
  getVisitors,
  getVisitorById,
  approveVisitor,
  checkInVisitor,
  checkOutVisitor,
  blacklistVisitor,
} from "../controllers/visitorController";
import { authenticateToken, authorizeRoles } from "../middleware/auth";
import { validateRequest } from "../middleware/validation";
import { UserRole } from "../types";
import { body, param } from "express-validator";

const router = express.Router();

// Validation schemas
const createVisitorValidation = [
  body("firstName").trim().notEmpty().withMessage("First name is required"),
  body("lastName").trim().notEmpty().withMessage("Last name is required"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("phone")
    .isMobilePhone("any")
    .withMessage("Valid phone number is required"),
  body("idProof.type").notEmpty().withMessage("ID proof type is required"),
  body("idProof.number")
    .trim()
    .notEmpty()
    .withMessage("ID proof number is required"),
  body("purposeOfVisit")
    .trim()
    .notEmpty()
    .withMessage("Purpose of visit is required"),
  body("hostStaffId")
    .isMongoId()
    .withMessage("Valid host staff ID is required"),
];

const idValidation = [
  param("id").isMongoId().withMessage("Valid visitor ID is required"),
];

// Apply authentication to all routes
router.use(authenticateToken);

// Routes
router.post("/", createVisitorValidation, validateRequest, createVisitor);
router.get("/", getVisitors);
router.get("/:id", idValidation, validateRequest, getVisitorById);

// Teacher, Staff, and Admin can approve visitors
router.put(
  "/:id/approve",
  idValidation,
  validateRequest,
  authorizeRoles(
    UserRole.TEACHER,
    UserRole.STAFF,
    UserRole.SCHOOL_ADMIN,
    UserRole.SUPER_ADMIN
  ),
  approveVisitor
);

// Security and Front Desk can check in/out visitors
router.put(
  "/:id/checkin",
  idValidation,
  validateRequest,
  authorizeRoles(
    UserRole.SECURITY_GUARD,
    UserRole.FRONT_DESK,
    UserRole.SCHOOL_ADMIN,
    UserRole.SUPER_ADMIN
  ),
  checkInVisitor
);

router.put(
  "/:id/checkout",
  idValidation,
  validateRequest,
  authorizeRoles(
    UserRole.SECURITY_GUARD,
    UserRole.FRONT_DESK,
    UserRole.SCHOOL_ADMIN,
    UserRole.SUPER_ADMIN
  ),
  checkOutVisitor
);

// Only admins can blacklist visitors
router.put(
  "/:id/blacklist",
  idValidation,
  validateRequest,
  authorizeRoles(UserRole.SCHOOL_ADMIN, UserRole.SUPER_ADMIN),
  blacklistVisitor
);

export default router;
