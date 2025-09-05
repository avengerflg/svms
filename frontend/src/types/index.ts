export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  schoolId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Visitor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idProof: {
    type: IdProofType;
    number: string;
    document?: string;
  };
  photo?: string;
  purposeOfVisit: string;
  hostStaffId: string;
  schoolId: string;
  status: VisitorStatus;
  checkInTime?: string;
  checkOutTime?: string;
  expectedCheckOutTime?: string;
  qrCode: string;
  badge?: string;
  isBlacklisted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface School {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  principalName: string;
  settings: SchoolSettings;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  visitorId: string;
  hostStaffId: string;
  schoolId: string;
  purpose: string;
  scheduledDateTime: string;
  duration: number;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  SUPER_ADMIN = "super_admin",
  SCHOOL_ADMIN = "school_admin",
  SECURITY_GUARD = "security_guard",
  FRONT_DESK = "front_desk",
  TEACHER = "teacher",
  STAFF = "staff",
}

export enum VisitorStatus {
  PENDING = "pending",
  APPROVED = "approved",
  CHECKED_IN = "checked_in",
  CHECKED_OUT = "checked_out",
  REJECTED = "rejected",
  EXPIRED = "expired",
}

export enum AppointmentStatus {
  SCHEDULED = "scheduled",
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
  NO_SHOW = "no_show",
}

export enum IdProofType {
  DRIVERS_LICENSE = "drivers_license",
  PASSPORT = "passport",
  NATIONAL_ID = "national_id",
  VOTER_ID = "voter_id",
  OTHER = "other",
}

export interface SchoolSettings {
  visitingHours: {
    start: string;
    end: string;
  };
  workingDays: string[];
  maxVisitDuration: number;
  requirePreApproval: boolean;
  allowPhotoCapture: boolean;
  autoCheckOut: boolean;
  alertsEnabled: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface PaginationData<T> {
  items: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  schoolId?: string;
}

export interface VisitorFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idProof: {
    type: IdProofType;
    number: string;
  };
  purposeOfVisit: string;
  hostStaffId: string;
  expectedCheckOutTime?: string;
}
