import mongoose, { Schema, type Model } from "mongoose";

export interface IProjectVideo {
  title: string;
  youtubeUrl: string;
  description?: string;
  posterImage?: string;
  aspectRatio?: "16:9" | "9:16";
  documentation?: string; // relative path or direct markdown
  documentationContent?: string; // direct markdown text
  transcript?: string;
  transcriptContent?: string;
  showCaptions?: boolean;
}

export interface IProject {
  slug: string;
  title: string;
  summary: string;
  category: string;
  tools: string[];
  featured: boolean;
  status: "draft" | "published";
  provenance: "professional" | "independent" | "illustrative";
  role?: string;
  date?: string;
  coverImage?: {
    src: string;
    alt: string;
    caption?: string;
  };
  overview?: string;
  videos: IProjectVideo[];
  documentation?: string; // file path
  documentationContent?: string; // full markdown text stored in db
  screenshots: {
    src: string;
    alt: string;
    caption?: string;
  }[];
  attachments: {
    label: string;
    url: string;
    description?: string;
  }[];
  externalLinks: {
    label: string;
    url: string;
    description?: string;
  }[];
  sortOrder: number;
}

const ProjectVideoSchema = new Schema<IProjectVideo>(
  {
    title: { type: String, required: true },
    youtubeUrl: { type: String, required: true },
    description: String,
    posterImage: String,
    aspectRatio: { type: String, enum: ["16:9", "9:16"], default: "16:9" },
    documentation: String,
    documentationContent: String,
    transcript: String,
    transcriptContent: String,
    showCaptions: { type: Boolean, default: false },
  },
  { _id: false }
);

const ProjectSchema = new Schema<IProject>(
  {
    slug: { type: String, required: true, unique: true, index: true, trim: true },
    title: { type: String, required: true, trim: true },
    summary: { type: String, required: true },
    category: { type: String, required: true },
    tools: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
    status: { type: String, enum: ["draft", "published"], default: "published" },
    provenance: {
      type: String,
      enum: ["professional", "independent", "illustrative"],
      default: "independent",
    },
    role: String,
    date: String,
    coverImage: {
      src: String,
      alt: String,
      caption: String,
    },
    overview: String,
    videos: { type: [ProjectVideoSchema], default: [] },
    documentation: String,
    documentationContent: String,
    screenshots: [
      {
        _id: false,
        src: String,
        alt: String,
        caption: String,
      },
    ],
    attachments: [
      {
        _id: false,
        label: String,
        url: String,
        description: String,
      },
    ],
    externalLinks: [
      {
        _id: false,
        label: String,
        url: String,
        description: String,
      },
    ],
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ProjectSchema.index({ status: 1, sortOrder: 1, createdAt: -1 });

export const ProjectModel: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);
