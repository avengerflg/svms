import mongoose, { Schema, Document, Types } from "mongoose";
import { Visitor, VisitorStatus, IdProofType } from "../types";

export interface IVisitor
  extends Omit<Visitor, "id" | "hostStaffId" | "schoolId">,
    Document {
  hostStaffId: Types.ObjectId;
  schoolId: Types.ObjectId;
}

const visitorSchema = new Schema<IVisitor>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    idProof: {
      type: {
        type: String,
        enum: Object.values(IdProofType),
        required: true,
      },
      number: {
        type: String,
        required: true,
        trim: true,
      },
      document: {
        type: String, // file path
        required: false,
      },
    },
    photo: {
      type: String, // file path
      required: false,
    },
    purposeOfVisit: {
      type: String,
      required: true,
      trim: true,
    },
    hostStaffId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(VisitorStatus),
      default: VisitorStatus.PENDING,
    },
    checkInTime: {
      type: Date,
      required: false,
    },
    checkOutTime: {
      type: Date,
      required: false,
    },
    expectedCheckOutTime: {
      type: Date,
      required: false,
    },
    qrCode: {
      type: String,
      required: true,
      unique: true,
    },
    badge: {
      type: String, // file path
      required: false,
    },
    isBlacklisted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc: any, ret: any) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for efficient queries
visitorSchema.index({ email: 1 });
visitorSchema.index({ phone: 1 });
visitorSchema.index({ schoolId: 1, status: 1 });
visitorSchema.index({ qrCode: 1 });
visitorSchema.index({ checkInTime: 1 });
visitorSchema.index({ "idProof.number": 1 });

export const VisitorModel = mongoose.model<IVisitor>("Visitor", visitorSchema);
