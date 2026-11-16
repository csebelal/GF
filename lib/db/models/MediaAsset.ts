import mongoose, { Schema, type Model } from "mongoose";

export interface IMediaAsset {
  filename: string;
  title?: string;
  alt?: string;
  caption?: string;
  tags: string[];
  uploadedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const MediaAssetSchema = new Schema<IMediaAsset>(
  {
    filename: { type: String, required: true, unique: true, index: true },
    title: { type: String, default: "" },
    alt: { type: String, default: "" },
    caption: { type: String, default: "" },
    tags: { type: [String], default: [], index: true },
    uploadedBy: { type: String, default: "" },
  },
  { timestamps: true }
);

export const MediaAssetModel: Model<IMediaAsset> =
  mongoose.models.MediaAsset || mongoose.model<IMediaAsset>("MediaAsset", MediaAssetSchema);
