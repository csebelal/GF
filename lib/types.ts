/**
 * Content types for the portfolio.
 *
 * Authors edit the typed collections in `content/projects/` and the Markdown
 * files in `content/docs/`. Layout components never need to change when a new
 * project is added.
 */

export type ProjectStatus = "draft" | "published";

/**
 * Where a project came from. This is shown on every card and project page.
 * - professional: work done in a real job (only publish what you may share)
 * - independent: a self-directed exercise, e.g. in a Developer Edition org
 * - illustrative: a demonstration or concept, not a delivered system
 */
export type Provenance = "professional" | "independent" | "illustrative";

export type VideoAspectRatio = "16:9" | "9:16";

export interface ProjectImage {
  /** Path inside /public (e.g. "/images/projects/flow.png") or an https URL. */
  src: string;
  /** Describe what the image shows for people using screen readers. */
  alt: string;
  caption?: string;
}

export interface ProjectLink {
  label: string;
  /** https URL, mailto: link, or a path to a file inside /public. */
  url: string;
  description?: string;
}

export interface ProjectVideo {
  title: string;
  /** Paste a normal YouTube link: watch, youtu.be, shorts or embed formats all work. */
  youtubeUrl: string;
  /** One or two sentences shown under the video. */
  description?: string;
  /** Optional custom poster shown before playback. Falls back to YouTube's thumbnail. */
  posterImage?: string;
  /** Use "9:16" for vertical videos such as Shorts. Defaults to "16:9". */
  aspectRatio?: VideoAspectRatio;
  /** Markdown file inside content/docs/ with notes for this video only. */
  documentation?: string;
  /** Markdown or text file inside content/docs/ with the transcript. */
  transcript?: string;
  /** Ask YouTube to show captions by default when the video has them. */
  showCaptions?: boolean;
}

export interface Project {
  /** URL segment: lowercase words separated by hyphens. Must be unique. */
  slug: string;
  title: string;
  /** One or two sentences used on cards, search and page headers. */
  summary: string;
  /** Categories are generated from the projects themselves. */
  category: string;
  tools: string[];
  featured?: boolean;
  status: ProjectStatus;
  provenance: Provenance;
  coverImage?: ProjectImage;
  role?: string;
  /** Verified date as "YYYY" or "YYYY-MM". Leave empty if unsure. */
  date?: string;
  /** Short overview paragraph(s) shown above the documentation. Markdown allowed. */
  overview?: string;
  videos?: ProjectVideo[];
  /** Markdown file inside content/docs/ with the project-level technical article. */
  documentation?: string;
  screenshots?: ProjectImage[];
  /** Downloadable files, usually stored in /public/files/. */
  attachments?: ProjectLink[];
  externalLinks?: ProjectLink[];
}

export type ContentType = "video" | "documentation" | "video+documentation";

export interface ValidationIssue {
  level: "error" | "warning";
  slug: string;
  field: string;
  message: string;
}
