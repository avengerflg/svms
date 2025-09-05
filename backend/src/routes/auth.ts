import express from "express";
import {
  register,
  login,
  getMe,
  refreshToken,
  changePassword,
} from "../controllers/authController";
import { authenticateToken } from "../middleware/auth";
import { validateRequest } from "../middleware/validation";
import { body } from "express-validator";

const router = express.Router();

// Validation schemas
const registerValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("firstName").trim().notEmpty().withMessage("First name is required"),
  body("lastName").trim().notEmpty().withMessage("Last name is required"),
  body("role").notEmpty().withMessage("Role is required"),
];

const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

const changePasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters"),
];

// Routes
router.post("/register", registerValidation, validateRequest, register);
router.post("/login", loginValidation, validateRequest, login);
router.post("/refresh", refreshToken);
router.get("/me", authenticateToken, getMe);
router.put(
  "/change-password",
  authenticateToken,
  changePasswordValidation,
  validateRequest,
  changePassword
);

export default router;
