/**
 * Checks the portfolio content without starting Next.js.
 * Run: bun run validate   (the production build runs the same checks)
 */
import { projectSources } from "@/content/projects";
import { docExists } from "@/lib/markdown";
import { publicFileExists } from "@/lib/projects";
import { formatIssues, validateProjects } from "@/lib/validate";

const issues = validateProjects(
  projectSources.map((source) => source.project),
  { docExists, publicFileExists },
);
const errors = issues.filter((issue) => issue.level === "error");
const warnings = issues.filter((issue) => issue.level === "warning");

const published = projectSources.filter((source) => source.project.status === "published");
console.log(
  `Checked ${projectSources.length} projects (${published.length} published, ${projectSources.length - published.length} draft).`,
);
if (issues.length) console.log(formatIssues(issues));
console.log(`${errors.length} error(s), ${warnings.length} warning(s).`);
process.exit(errors.length ? 1 : 0);
