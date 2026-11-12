import mongoose, { Schema, type Model } from "mongoose";

export interface IAnalyticsDaily {
  date: string;
  views: number;
  uniqueVisitorHashes: string[];
  routes: Map<string, number> | Record<string, number>;
  referrers: Map<string, number> | Record<string, number>;
  devices: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const AnalyticsDailySchema = new Schema<IAnalyticsDaily>(
  {
    date: { type: String, required: true, unique: true },
    views: { type: Number, default: 0 },
    uniqueVisitorHashes: { type: [String], default: [] },
    routes: { type: Map, of: Number, default: {} },
    referrers: { type: Map, of: Number, default: {} },
    devices: {
      desktop: { type: Number, default: 0 },
      mobile: { type: Number, default: 0 },
      tablet: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

AnalyticsDailySchema.index({ date: -1 });

export const AnalyticsDailyModel: Model<IAnalyticsDaily> =
  mongoose.models.AnalyticsDaily ||
  mongoose.model<IAnalyticsDaily>("AnalyticsDaily", AnalyticsDailySchema);
