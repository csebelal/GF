import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Project } from "@/lib/types";
import { validateProjects } from "@/lib/validate";

const context = {
  docExists: (p: string) => p === "docs/ok.md",
  publicFileExists: (p: string) => p === "/images/ok.png",
};

const base: Project = {
  slug: "valid-project",
  title: "Valid project",
  summary: "A short summary.",
  category: "Data Quality",
  tools: ["Data Loader"],
  status: "published",
  provenance: "independent",
  documentation: "docs/ok.md",
};

const errorsFor = (projects: Project[]) =>
  validateProjects(projects, context).filter((issue) => issue.level === "error");

describe("validateProjects", () => {
  it("accepts a valid documentation-only project", () => {
    assert.deepEqual(errorsFor([base]), []);
  });

  it("accepts a valid video-only project", () => {
    const { documentation: _omit, ...rest } = base;
    assert.deepEqual(
      errorsFor([{ ...rest, videos: [{ title: "Demo", youtubeUrl: "https://youtu.be/M7lc1UVf-VE" }] }]),
      []
    );
  });

  it("rejects duplicate slugs", () => {
    const errors = errorsFor([base, { ...base }]);
    assert.ok(errors.some((e) => e.field === "slug" && e.message.includes("Duplicate")));
  });

  it("rejects badly formatted slugs", () => {
    assert.ok(errorsFor([{ ...base, slug: "Bad Slug" }]).some((e) => e.field === "slug"));
  });

  it("requires title and summary", () => {
    const errors = errorsFor([{ ...base, title: "", summary: " " }]);
    const fields = errors.map((e) => e.field);
    assert.ok(fields.includes("title"));
    assert.ok(fields.includes("summary"));
  });

  it("rejects unknown status and provenance", () => {
    const errors = errorsFor([{ ...base, status: "live" as never, provenance: "client" as never }]);
    const fields = errors.map((e) => e.field);
    assert.ok(fields.includes("status"));
    assert.ok(fields.includes("provenance"));
  });

  it("published projects need a working video or an article", () => {
    const { documentation: _omit, ...rest } = base;
    const errors = errorsFor([{ ...rest, videos: [{ title: "Broken", youtubeUrl: "not a url" }] }]);
    assert.ok(errors.some((e) => e.field === "content"));
    assert.ok(errors.some((e) => e.field === "videos[0].youtubeUrl"));
  });

  it("drafts may hold unfinished video links (warning only)", () => {
    const issues = validateProjects(
      [{ ...base, status: "draft", videos: [{ title: "Later", youtubeUrl: "paste-link-here" }] }],
      context
    );
    assert.deepEqual(issues.filter((i) => i.level === "error"), []);
    assert.ok(issues.some((i) => i.level === "warning"));
  });

  it("rejects missing documentation files and path traversal", () => {
    assert.ok(errorsFor([{ ...base, documentation: "docs/missing.md" }]).some((e) => e.field === "documentation"));
    assert.ok(errorsFor([{ ...base, documentation: "../secret.md" }]).some((e) => e.field === "documentation"));
  });

  it("rejects invalid URLs and missing images", () => {
    const errors = errorsFor([
      {
        ...base,
        coverImage: { src: "/images/missing.png", alt: "" },
        externalLinks: [{ label: "Bad", url: "ftp://example.com" }],
        attachments: [{ label: "File", url: "/files/missing.csv" }],
      },
    ]);
    const fields = errors.map((e) => e.field);
    assert.ok(fields.includes("coverImage"));
    assert.ok(fields.includes("externalLinks[0]"));
    assert.ok(fields.includes("attachments[0]"));
  });

  it("validates date format", () => {
    assert.ok(errorsFor([{ ...base, date: "June 2025" }]).some((e) => e.field === "date"));
    assert.deepEqual(errorsFor([{ ...base, date: "2025-06" }]), []);
  });
});
