import { describe, expect, test } from "bun:test";
import {
  getAllProjectsIncludingDrafts,
  getCategories,
  getContentIssues,
  getProjectBySlug,
  getProjectDocs,
  getPublishedProjects,
} from "@/lib/projects";

describe("portfolio content", () => {
  test("has no validation errors", () => {
    const errors = getContentIssues().filter((issue) => issue.level === "error");
    expect(errors).toEqual([]);
  });

  test("drafts are excluded from published lists and routes", () => {
    const drafts = getAllProjectsIncludingDrafts().filter((p) => p.status === "draft");
    expect(drafts.length).toBeGreaterThan(0);
    for (const draft of drafts) {
      expect(getPublishedProjects().some((p) => p.slug === draft.slug)).toBe(false);
      expect(getProjectBySlug(draft.slug)).toBeUndefined();
    }
  });

  test("categories are generated only from published projects", () => {
    const categories = getCategories();
    const published = new Set(getPublishedProjects().map((p) => p.category));
    expect(new Set(categories)).toEqual(published);
  });

  test("sample collection covers every page variant", () => {
    const published = getPublishedProjects();
    expect(published.some((p) => p.contentType === "video+documentation")).toBe(true);
    expect(published.some((p) => p.contentType === "video")).toBe(true);
    expect(published.some((p) => p.contentType === "documentation")).toBe(true);
    expect(published.some((p) => p.videos.length > 1 && p.videos.every((v) => v.documentation))).toBe(true);
    expect(published.some((p) => p.videos.some((v) => v.aspectRatio === "9:16"))).toBe(true);
  });

  test("documentation loads with headings for the table of contents", () => {
    for (const project of getPublishedProjects()) {
      const docs = getProjectDocs(project);
      if (docs.article) expect(docs.article.headings.length).toBeGreaterThan(0);
      const ids = [
        ...(docs.article?.headings ?? []),
        ...docs.videoDocs.flatMap((doc) => doc?.headings ?? []),
      ].map((h) => h.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});
