import type { Project, ProjectImage, ProjectLink, ValidationIssue } from "./types";
import { parseYouTubeUrl } from "./youtube";

/**
 * Content validation. Pure: file checks are injected so this can run inside
 * Next.js, in tests and in the `validate` script.
 */

export interface ValidationContext {
  /** Does content/docs/<path> exist? */
  docExists: (relativePath: string) => boolean;
  /** Does public/<path> exist? (path starts with "/") */
  publicFileExists: (publicPath: string) => boolean;
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_PATTERN = /^\d{4}(?:-(0[1-9]|1[0-2]))?$/;
const STATUSES = new Set(["draft", "published"]);
const PROVENANCES = new Set(["professional", "independent", "illustrative"]);
const ASPECT_RATIOS = new Set(["16:9", "9:16"]);

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function validateProjects(
  projects: Project[],
  context: ValidationContext,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const seenSlugs = new Map<string, number>();

  projects.forEach((project, index) => {
    const slug = isNonEmptyString(project?.slug) ? project.slug : `#${index + 1}`;
    const isPublished = project?.status === "published";
    const add = (level: ValidationIssue["level"], field: string, message: string) =>
      issues.push({ level, slug, field, message });

    // --- Identity -----------------------------------------------------------
    if (!isNonEmptyString(project?.slug)) {
      add("error", "slug", "A slug is required.");
    } else {
      if (!SLUG_PATTERN.test(project.slug)) {
        add("error", "slug", `"${project.slug}" must use lowercase letters, numbers and hyphens.`);
      }
      const previous = seenSlugs.get(project.slug);
      if (previous !== undefined) {
        add("error", "slug", `Duplicate slug — also used by project #${previous + 1}.`);
      } else {
        seenSlugs.set(project.slug, index);
      }
    }

    if (!isNonEmptyString(project?.title)) add("error", "title", "A title is required.");
    if (!isNonEmptyString(project?.summary)) {
      add("error", "summary", "A summary is required.");
    } else if (project.summary.length > 240) {
      add("warning", "summary", "Summaries over 240 characters are hard to scan on cards.");
    }
    if (!isNonEmptyString(project?.category)) add("error", "category", "A category is required.");

    if (!STATUSES.has(project?.status as string)) {
      add("error", "status", `Status must be "draft" or "published" (got "${String(project?.status)}").`);
    }
    if (!PROVENANCES.has(project?.provenance as string)) {
      add(
        "error",
        "provenance",
        `Provenance must be "professional", "independent" or "illustrative" (got "${String(project?.provenance)}").`,
      );
    }

    if (!Array.isArray(project?.tools) || project.tools.some((tool) => !isNonEmptyString(tool))) {
      add("error", "tools", "Tools must be a list of names.");
    }

    if (project?.date !== undefined && !DATE_PATTERN.test(project.date)) {
      add("error", "date", `Date must look like "2025" or "2025-06" (got "${project.date}").`);
    }

    // --- Media and documents ----------------------------------------------
    const checkImage = (image: ProjectImage | undefined, field: string) => {
      if (!image) return;
      if (!isNonEmptyString(image.src)) {
        add("error", field, "Image src is required.");
      } else if (image.src.startsWith("/")) {
        if (!context.publicFileExists(image.src)) add("error", field, `Image not found in /public: ${image.src}`);
      } else if (!isHttpUrl(image.src)) {
        add("error", field, `Image src must be a /public path or an https URL: ${image.src}`);
      }
      if (!isNonEmptyString(image.alt)) add("error", field, "Image alt text is required.");
    };

    const checkDoc = (docPath: string | undefined, field: string) => {
      if (docPath === undefined) return;
      if (!isNonEmptyString(docPath) || !/\.(md|txt)$/.test(docPath)) {
        add("error", field, `Documentation must reference a .md or .txt file (got "${String(docPath)}").`);
      } else if (docPath.includes("..")) {
        add("error", field, "Documentation paths cannot contain '..'.");
      } else if (!context.docExists(docPath)) {
        add("error", field, `File not found in content/docs: ${docPath}`);
      }
    };

    const checkLinks = (links: ProjectLink[] | undefined, field: string) => {
      links?.forEach((link, linkIndex) => {
        const where = `${field}[${linkIndex}]`;
        if (!isNonEmptyString(link?.label)) add("error", where, "Link label is required.");
        const url = link?.url;
        if (!isNonEmptyString(url)) {
          add("error", where, "Link URL is required.");
        } else if (url.startsWith("/")) {
          if (!context.publicFileExists(url)) add("error", where, `File not found in /public: ${url}`);
        } else if (!isHttpUrl(url) && !url.startsWith("mailto:")) {
          add("error", where, `Not a valid URL: ${url}`);
        }
      });
    };

    checkImage(project?.coverImage, "coverImage");
    project?.screenshots?.forEach((shot, shotIndex) => checkImage(shot, `screenshots[${shotIndex}]`));
    checkDoc(project?.documentation, "documentation");
    checkLinks(project?.attachments, "attachments");
    checkLinks(project?.externalLinks, "externalLinks");

    let playableVideos = 0;
    project?.videos?.forEach((video, videoIndex) => {
      const where = `videos[${videoIndex}]`;
      if (!isNonEmptyString(video?.title)) add("error", `${where}.title`, "Each video needs a title.");
      const parsed = parseYouTubeUrl(video?.youtubeUrl);
      if (parsed.ok) {
        playableVideos += 1;
      } else {
        // Drafts may hold unfinished links; published pages must not.
        add(isPublished ? "error" : "warning", `${where}.youtubeUrl`, parsed.reason);
      }
      if (video?.aspectRatio !== undefined && !ASPECT_RATIOS.has(video.aspectRatio)) {
        add("error", `${where}.aspectRatio`, `Aspect ratio must be "16:9" or "9:16".`);
      }
      if (video?.posterImage !== undefined) {
        checkImage({ src: video.posterImage, alt: video.title || "poster" }, `${where}.posterImage`);
      }
      checkDoc(video?.documentation, `${where}.documentation`);
      checkDoc(video?.transcript, `${where}.transcript`);
    });

    const hasArticle =
      isNonEmptyString(project?.documentation) ||
      (project?.videos ?? []).some((video) => isNonEmptyString(video?.documentation));

    if (isPublished && playableVideos === 0 && !hasArticle) {
      add("error", "content", "A published project needs at least one working video or a documentation file.");
    }
  });

  return issues;
}

export function formatIssues(issues: ValidationIssue[]): string {
  return issues
    .map((issue) => `  ${issue.level === "error" ? "✖" : "⚠"} [${issue.slug}] ${issue.field}: ${issue.message}`)
    .join("\n");
}
