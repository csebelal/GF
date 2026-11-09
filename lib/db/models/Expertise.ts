import mongoose, { Schema, type Model } from "mongoose";

export interface IExpertiseArea {
  id: string;
  title: string;
  shortTitle: string;
  icon: string;
  problem: string;
  practices: string[];
  tools: string[];
  match: {
    categories?: string[];
    tools?: string[];
  };
  onHome?: boolean;
}

export interface IWorkingApproachStep {
  title: string;
  body: string;
  detail: string;
}

export interface IExpertiseData {
  areas: IExpertiseArea[];
  workingApproach: IWorkingApproachStep[];
}

const ExpertiseSchema = new Schema<IExpertiseData>(
  {
    areas: [
      {
        _id: false,
        id: { type: String, required: true },
        title: { type: String, required: true },
        shortTitle: { type: String, required: true },
        icon: { type: String, required: true },
        problem: { type: String, required: true },
        practices: [String],
        tools: [String],
        match: {
          categories: [String],
          tools: [String],
        },
        onHome: { type: Boolean, default: false },
      },
    ],
    workingApproach: [
      {
        _id: false,
        title: { type: String, required: true },
        body: { type: String, required: true },
        detail: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

export const ExpertiseModel: Model<IExpertiseData> =
  mongoose.models.Expertise || mongoose.model<IExpertiseData>("Expertise", ExpertiseSchema);
