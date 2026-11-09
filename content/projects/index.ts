import type { Project } from "@/lib/types";
import { projects } from "./projects";
import { sampleProjects } from "./sample-projects";

/**
 * Set to false once Afrin's real projects are in place. This hides every
 * project in sample-projects.ts from listings, routes, search and the sitemap.
 */
export const SHOW_SAMPLE_PROJECTS = true;

export interface ProjectSource {
  project: Project;
  isSample: boolean;
}

/** Real projects first, then the sample collection. Array order = display order. */
export const projectSources: ProjectSource[] = [
  ...projects.map((project) => ({ project, isSample: false })),
  ...(SHOW_SAMPLE_PROJECTS ? sampleProjects.map((project) => ({ project, isSample: true })) : []),
];
