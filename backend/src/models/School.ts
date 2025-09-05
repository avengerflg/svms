import mongoose, { Schema, Document } from "mongoose";
import { School, SchoolSettings } from "../types";

export interface ISchool extends Omit<School, "id">, Document {}

const schoolSchema = new Schema<ISchool>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
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
    principalName: {
      type: String,
      required: true,
      trim: true,
    },
    settings: {
      visitingHours: {
        start: {
          type: String,
          required: true,
          default: "08:00",
        },
        end: {
          type: String,
          required: true,
          default: "17:00",
        },
      },
      workingDays: [
        {
          type: String,
          enum: [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ],
          default: ["monday", "tuesday", "wednesday", "thursday", "friday"],
        },
      ],
      maxVisitDuration: {
        type: Number,
        default: 480, // 8 hours in minutes
      },
      requirePreApproval: {
        type: Boolean,
        default: true,
      },
      allowPhotoCapture: {
        type: Boolean,
        default: true,
      },
      autoCheckOut: {
        type: Boolean,
        default: true,
      },
      alertsEnabled: {
        type: Boolean,
        default: true,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
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
schoolSchema.index({ name: 1 });
schoolSchema.index({ email: 1 });

export const SchoolModel = mongoose.model<ISchool>("School", schoolSchema);
