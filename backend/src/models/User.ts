import mongoose, { Schema, Document } from "mongoose";
import { User, UserRole } from "../types";

export interface IUser extends Omit<User, "id">, Document {}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
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
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: "School",
      required: function (this: IUser) {
        return this.role !== UserRole.SUPER_ADMIN;
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
        delete ret.password;
        return ret;
      },
    },
  }
);

// Index for efficient queries
userSchema.index({ email: 1 });
userSchema.index({ schoolId: 1, role: 1 });

export const UserModel = mongoose.model<IUser>("User", userSchema);
