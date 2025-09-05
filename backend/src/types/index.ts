export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  schoolId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
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
    document?: string; // file path
  };
  photo?: string; // file path
  purposeOfVisit: string;
  hostStaffId: string;
  schoolId: string;
  status: VisitorStatus;
  checkInTime?: Date;
  checkOutTime?: Date;
  expectedCheckOutTime?: Date;
  qrCode: string;
  badge?: string; // file path
  isBlacklisted: boolean;
  createdAt: Date;
  updatedAt: Date;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  visitorId: string;
  hostStaffId: string;
  schoolId: string;
  purpose: string;
  scheduledDateTime: Date;
  duration: number; // in minutes
  status: AppointmentStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VisitLog {
  id: string;
  visitorId: string;
  schoolId: string;
  checkInTime: Date;
  checkOutTime?: Date;
  purpose: string;
  hostStaffId: string;
  status: VisitLogStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
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

export enum VisitLogStatus {
  ACTIVE = "active",
  COMPLETED = "completed",
  OVERSTAYED = "overstayed",
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
    start: string; // HH:mm format
    end: string; // HH:mm format
  };
  workingDays: string[]; // ['monday', 'tuesday', etc.]
  maxVisitDuration: number; // in minutes
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
