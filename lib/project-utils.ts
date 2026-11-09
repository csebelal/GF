import type { ContentType, Project, Provenance } from "./types";
import { parseYouTubeUrl } from "./youtube";

/** Pure helpers shared by server and client components. */

export function hasPlayableVideo(project: Project): boolean {
  return (project.videos ?? []).some((video) => parseYouTubeUrl(video.youtubeUrl).ok);
}

export function hasDocumentation(project: Project): boolean {
  return Boolean(project.documentation) || (project.videos ?? []).some((video) => Boolean(video.documentation));
}

export function getContentType(project: Project): ContentType {
  const video = hasPlayableVideo(project);
  const docs = hasDocumentation(project);
  if (video && docs) return "video+documentation";
  if (video) return "video";
  return "documentation";
}

export const contentTypeLabels: Record<ContentType, string> = {
  video: "Video",
  documentation: "Documentation",
  "video+documentation": "Video + Documentation",
};

export const provenanceLabels: Record<Provenance, string> = {
  professional: "Professional work",
  independent: "Independent Demo",
  illustrative: "Illustrative",
};

export const provenanceDescriptions: Record<Provenance, string> = {
  professional: "Work completed in a professional role. Confidential details have been removed.",
  independent: "A self-directed exercise built outside a client or employer environment.",
  illustrative: "A demonstration of an approach. It does not describe a delivered production system.",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "2025-01" → "Jan 2025"; "2025" → "2025"; "present" → "Present". */
export function formatMonth(value: string, style: "short" | "long" = "short"): string {
  if (value === "present") return "Present";
  const [year, month] = value.split("-");
  if (!month) return year;
  const names = style === "long" ? MONTHS_LONG : MONTHS;
  return `${names[Number(month) - 1]} ${year}`;
}

export function formatRange(start: string, end: string): string {
  return `${formatMonth(start)} – ${formatMonth(end)}`;
}

/** Whole months between two "YYYY-MM" values (inclusive of both ends). */
export function monthsBetween(start: string, end: string, now = new Date()): number {
  const [sy, sm] = start.split("-").map(Number);
  const [ey, em] =
    end === "present" ? [now.getFullYear(), now.getMonth() + 1] : end.split("-").map(Number);
  return (ey - sy) * 12 + (em - sm) + 1;
}

export function formatDuration(months: number): string {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts = [];
  if (years) parts.push(`${years} yr${years > 1 ? "s" : ""}`);
  if (rest) parts.push(`${rest} mo${rest > 1 ? "s" : ""}`);
  return parts.join(" ") || "Less than a month";
}
