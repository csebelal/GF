import { describe, expect, test } from "bun:test";
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
  test("accepts a valid documentation-only project", () => {
    expect(errorsFor([base])).toEqual([]);
  });

  test("accepts a valid video-only project", () => {
    const { documentation: _omit, ...rest } = base;
    expect(errorsFor([{ ...rest, videos: [{ title: "Demo", youtubeUrl: "https://youtu.be/M7lc1UVf-VE" }] }])).toEqual([]);
  });

  test("rejects duplicate slugs", () => {
    const errors = errorsFor([base, { ...base }]);
    expect(errors.some((e) => e.field === "slug" && e.message.includes("Duplicate"))).toBe(true);
  });

  test("rejects badly formatted slugs", () => {
    expect(errorsFor([{ ...base, slug: "Bad Slug" }]).some((e) => e.field === "slug")).toBe(true);
  });

  test("requires title and summary", () => {
    const errors = errorsFor([{ ...base, title: "", summary: " " }]);
    expect(errors.map((e) => e.field)).toEqual(expect.arrayContaining(["title", "summary"]));
  });

  test("rejects unknown status and provenance", () => {
    const errors = errorsFor([{ ...base, status: "live" as never, provenance: "client" as never }]);
    expect(errors.map((e) => e.field)).toEqual(expect.arrayContaining(["status", "provenance"]));
  });

  test("published projects need a working video or an article", () => {
    const { documentation: _omit, ...rest } = base;
    const errors = errorsFor([{ ...rest, videos: [{ title: "Broken", youtubeUrl: "not a url" }] }]);
    expect(errors.some((e) => e.field === "content")).toBe(true);
    expect(errors.some((e) => e.field === "videos[0].youtubeUrl")).toBe(true);
  });

  test("drafts may hold unfinished video links (warning only)", () => {
    const issues = validateProjects(
      [{ ...base, status: "draft", videos: [{ title: "Later", youtubeUrl: "paste-link-here" }] }],
      context,
    );
    expect(issues.filter((i) => i.level === "error")).toEqual([]);
    expect(issues.some((i) => i.level === "warning")).toBe(true);
  });

  test("rejects missing documentation files and path traversal", () => {
    expect(errorsFor([{ ...base, documentation: "docs/missing.md" }]).some((e) => e.field === "documentation")).toBe(true);
    expect(errorsFor([{ ...base, documentation: "../secret.md" }]).some((e) => e.field === "documentation")).toBe(true);
  });

  test("rejects invalid URLs and missing images", () => {
    const errors = errorsFor([
      {
        ...base,
        coverImage: { src: "/images/missing.png", alt: "" },
        externalLinks: [{ label: "Bad", url: "ftp://example.com" }],
        attachments: [{ label: "File", url: "/files/missing.csv" }],
      },
    ]);
    const fields = errors.map((e) => e.field);
    expect(fields).toEqual(expect.arrayContaining(["coverImage", "externalLinks[0]", "attachments[0]"]));
  });

  test("validates date format", () => {
    expect(errorsFor([{ ...base, date: "June 2025" }]).some((e) => e.field === "date")).toBe(true);
    expect(errorsFor([{ ...base, date: "2025-06" }])).toEqual([]);
  });
});
