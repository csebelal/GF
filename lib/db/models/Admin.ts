import mongoose, { Schema, type Model } from "mongoose";

export interface IAdmin {
  email: string;
  passwordHash: string;
  name: string;
  role: "admin";
  tokenVersion: number;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, default: "Admin", trim: true },
    role: { type: String, enum: ["admin"], default: "admin" },
    tokenVersion: { type: Number, default: 0 },
    lastLogin: { type: Date },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const AdminModel: Model<IAdmin> =
  mongoose.models.Admin || mongoose.model<IAdmin>("Admin", AdminSchema);
