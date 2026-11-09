import fs from "node:fs";
import path from "node:path";
import { projectSources } from "@/content/projects";
import { homeSettings } from "@/content/site";
import { docExists, loadDoc, type LoadedDoc } from "./markdown";
import { getContentType } from "./project-utils";
import type { ContentType, Project, ProjectVideo, ValidationIssue } from "./types";
import { formatIssues, validateProjects } from "./validate";
import { parseYouTubeUrl, type YouTubeParseResult } from "./youtube";

/**
 * Server-side project access. Loads the typed collection, validates it once,
 * and exposes published projects to pages. Drafts never leave this module
 * except through getAllProjectsIncludingDrafts (used by tests and tooling).
 */

export interface ResolvedVideo extends ProjectVideo {
  parsed: YouTubeParseResult;
}

export interface ResolvedProject extends Omit<Project, "videos"> {
  isSample: boolean;
  contentType: ContentType;
  videos: ResolvedVideo[];
}

/** Serializable card data passed to client components. */
export interface ProjectCardData {
  slug: string;
  title: string;
  summary: string;
  category: string;
  tools: string[];
  featured: boolean;
  provenance: Project["provenance"];
  isSample: boolean;
  contentType: ContentType;
  cover:
    | { kind: "image"; src: string; alt: string }
    | { kind: "youtube"; id: string; alt: string; poster?: string }
    | { kind: "none" };
  videoCount: number;
}

const PUBLIC_DIR = path.join(process.cwd(), "public");

export function publicFileExists(publicPath: string): boolean {
  const clean = decodeURIComponent(publicPath.split(/[?#]/)[0]);
  const resolved = path.resolve(PUBLIC_DIR, "." + clean);
  return resolved.startsWith(PUBLIC_DIR + path.sep) && fs.existsSync(resolved);
}

let cache: { all: ResolvedProject[]; issues: ValidationIssue[] } | null = null;

function load() {
  if (cache) return cache;

  const rawProjects = projectSources.map((source) => source.project);
  const issues = validateProjects(rawProjects, { docExists, publicFileExists });
  const errors = issues.filter((issue) => issue.level === "error");

  if (errors.length > 0 && process.env.NODE_ENV === "production") {
    throw new Error(`Portfolio content has ${errors.length} error(s):\n${formatIssues(errors)}`);
  }
  // Warnings are shown while editing; `bun run validate` reports them on demand.
  if (issues.length > 0 && process.env.NODE_ENV === "development") {
    console.warn(`\n[portfolio content]\n${formatIssues(issues)}\n`);
  }

  const all = projectSources.map(({ project, isSample }) => ({
    ...project,
    isSample,
    contentType: getContentType(project),
    videos: (project.videos ?? []).map((video) => ({ ...video, parsed: parseYouTubeUrl(video.youtubeUrl) })),
  }));

  cache = { all, issues };
  return cache;
}

export function getContentIssues(): ValidationIssue[] {
  return load().issues;
}

export function getAllProjectsIncludingDrafts(): ResolvedProject[] {
  return load().all;
}

export function getPublishedProjects(): ResolvedProject[] {
  return load().all.filter((project) => project.status === "published");
}

export function getProjectBySlug(slug: string): ResolvedProject | undefined {
  return getPublishedProjects().find((project) => project.slug === slug);
}

export function getFeaturedProjects(limit = 3): ResolvedProject[] {
  const published = getPublishedProjects();
  const chosen = homeSettings.featuredProjectSlugs.length
    ? homeSettings.featuredProjectSlugs
        .map((slug) => published.find((project) => project.slug === slug))
        .filter((project): project is ResolvedProject => Boolean(project))
    : published.filter((project) => project.featured);
  return (chosen.length ? chosen : published).slice(0, limit);
}

/** Categories generated from published projects, in first-seen order. */
export function getCategories(projects = getPublishedProjects()): string[] {
  return [...new Set(projects.map((project) => project.category))];
}

export function getAdjacentProjects(slug: string) {
  const published = getPublishedProjects();
  const index = published.findIndex((project) => project.slug === slug);
  if (index === -1 || published.length < 2) return { previous: undefined, next: undefined };
  return {
    previous: published[(index - 1 + published.length) % published.length],
    next: published[(index + 1) % published.length],
  };
}

export function getRelatedProjects(project: ResolvedProject, limit = 3): ResolvedProject[] {
  const toolSet = new Set(project.tools.map((tool) => tool.toLowerCase()));
  return getPublishedProjects()
    .filter((candidate) => candidate.slug !== project.slug)
    .map((candidate) => {
      const sharedTools = candidate.tools.filter((tool) => toolSet.has(tool.toLowerCase())).length;
      const score = (candidate.category === project.category ? 3 : 0) + sharedTools;
      return { candidate, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}

export function getProjectsMatching(match: { categories?: string[]; tools?: string[] }): ResolvedProject[] {
  const categories = new Set(match.categories ?? []);
  const tools = new Set((match.tools ?? []).map((tool) => tool.toLowerCase()));
  return getPublishedProjects().filter(
    (project) =>
      categories.has(project.category) || project.tools.some((tool) => tools.has(tool.toLowerCase())),
  );
}

export function toCardData(project: ResolvedProject): ProjectCardData {
  const firstVideo = project.videos.find((video) => video.parsed.ok);
  let cover: ProjectCardData["cover"] = { kind: "none" };
  if (project.coverImage) {
    cover = { kind: "image", src: project.coverImage.src, alt: project.coverImage.alt };
  } else if (firstVideo && firstVideo.parsed.ok) {
    cover = {
      kind: "youtube",
      id: firstVideo.parsed.id,
      alt: `Video thumbnail for ${firstVideo.title}`,
      poster: firstVideo.posterImage,
    };
  }
  return {
    slug: project.slug,
    title: project.title,
    summary: project.summary,
    category: project.category,
    tools: project.tools,
    featured: Boolean(project.featured),
    provenance: project.provenance,
    isSample: project.isSample,
    contentType: project.contentType,
    cover,
    videoCount: project.videos.filter((video) => video.parsed.ok).length,
  };
}

/** Documentation for a project page: project article plus per-video notes. */
export interface ProjectDocs {
  article?: LoadedDoc;
  videoDocs: (LoadedDoc | undefined)[];
  transcripts: (string | undefined)[];
}

export function getProjectDocs(project: ResolvedProject): ProjectDocs {
  const multipleVideos = project.videos.length > 1;
  return {
    article: project.documentation ? loadDoc(project.documentation) : undefined,
    videoDocs: project.videos.map((video, index) =>
      video.documentation
        ? loadDoc(video.documentation, multipleVideos || project.documentation ? `part-${index + 1}-` : "")
        : undefined,
    ),
    transcripts: project.videos.map((video) =>
      video.transcript ? loadDoc(video.transcript).markdown : undefined,
    ),
  };
}
