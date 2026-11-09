import mongoose, { Schema, type Model } from "mongoose";

export interface IResponsibility {
  theme?: string;
  text: string;
}

export interface IRole {
  title: string;
  start: string;
  end: string;
  responsibilities: IResponsibility[];
}

export interface IEmployer {
  company: string;
  promotion?: {
    date: string;
    label: string;
  };
  roles: IRole[];
}

export interface ICertification {
  name: string;
  issuer: string;
  kind?: string;
}

export interface IAward {
  name: string;
  issuer: string;
}

export interface IEducation {
  qualification: string;
  institution: string;
  year: string;
}

export interface IVolunteering {
  title: string;
  role?: string;
  organization: string;
  start: string;
  end: string;
  description: string;
}

export interface ILanguage {
  name: string;
  level: string;
  note?: string;
}

export interface IToolInPractice {
  name: string;
  use: string;
}

export interface IExperienceData {
  employers: IEmployer[];
  certifications: ICertification[];
  courseCertificates: ICertification[];
  awards: IAward[];
  education: IEducation[];
  volunteering: IVolunteering[];
  languages: ILanguage[];
  toolsInPractice: IToolInPractice[];
}

const ExperienceSchema = new Schema<IExperienceData>(
  {
    employers: [
      {
        _id: false,
        company: { type: String, required: true },
        promotion: {
          date: String,
          label: String,
        },
        roles: [
          {
            _id: false,
            title: { type: String, required: true },
            start: { type: String, required: true },
            end: { type: String, required: true },
            responsibilities: [
              {
                _id: false,
                theme: String,
                text: { type: String, required: true },
              },
            ],
          },
        ],
      },
    ],
    certifications: [
      {
        _id: false,
        name: String,
        issuer: String,
        kind: String,
      },
    ],
    courseCertificates: [
      {
        _id: false,
        name: String,
        issuer: String,
        kind: String,
      },
    ],
    awards: [
      {
        _id: false,
        name: String,
        issuer: String,
      },
    ],
    education: [
      {
        _id: false,
        qualification: String,
        institution: String,
        year: String,
      },
    ],
    volunteering: [
      {
        _id: false,
        title: String,
        role: String,
        organization: String,
        start: String,
        end: String,
        description: String,
      },
    ],
    languages: [
      {
        _id: false,
        name: String,
        level: String,
        note: String,
      },
    ],
    toolsInPractice: [
      {
        _id: false,
        name: String,
        use: String,
      },
    ],
  },
  { timestamps: true }
);

export const ExperienceModel: Model<IExperienceData> =
  mongoose.models.Experience || mongoose.model<IExperienceData>("Experience", ExperienceSchema);
