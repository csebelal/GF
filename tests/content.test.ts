import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getAllProjectsIncludingDrafts,
  getCategories,
  getContentIssues,
  getProjectBySlug,
  getProjectDocs,
  getPublishedProjects,
} from "@/lib/projects";

describe("portfolio content", () => {
  it("has no validation errors", () => {
    const errors = getContentIssues().filter((issue) => issue.level === "error");
    assert.deepEqual(errors, []);
  });

  it("drafts are excluded from published lists and routes", () => {
    const drafts = getAllProjectsIncludingDrafts().filter((p) => p.status === "draft");
    assert.ok(drafts.length > 0);
    for (const draft of drafts) {
      assert.equal(getPublishedProjects().some((p) => p.slug === draft.slug), false);
      assert.equal(getProjectBySlug(draft.slug), undefined);
    }
  });

  it("categories are generated only from published projects", () => {
    const categories = getCategories();
    const published = new Set(getPublishedProjects().map((p) => p.category));
    assert.deepEqual(new Set(categories), published);
  });

  it("sample collection covers every page variant", () => {
    const published = getPublishedProjects();
    assert.ok(published.some((p) => p.contentType === "video+documentation"));
    assert.ok(published.some((p) => p.contentType === "video"));
    assert.ok(published.some((p) => p.contentType === "documentation"));
    assert.ok(published.some((p) => p.videos.length > 1 && p.videos.every((v) => v.documentation)));
    assert.ok(published.some((p) => p.videos.some((v) => v.aspectRatio === "9:16")));
  });

  it("documentation loads with headings for the table of contents", () => {
    for (const project of getPublishedProjects()) {
      const docs = getProjectDocs(project);
      if (docs.article) assert.ok(docs.article.headings.length > 0);
      const ids = [
        ...(docs.article?.headings ?? []),
        ...docs.videoDocs.flatMap((doc) => doc?.headings ?? []),
      ].map((h) => h.id);
      assert.equal(new Set(ids).size, ids.length);
    }
  });
});
