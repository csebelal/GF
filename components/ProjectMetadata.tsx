import { contentTypeLabels, formatMonth, provenanceDescriptions, provenanceLabels } from "@/lib/project-utils";
import type { ResolvedProject } from "@/lib/projects";

/** Definition list of project facts. Optional fields are omitted when empty. */
export function ProjectMetadata({ project }: { project: ResolvedProject }) {
  const videoCount = project.videos.filter((video) => video.parsed.ok).length;
  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "Category", value: project.category },
    {
      label: "Format",
      value: `${contentTypeLabels[project.contentType]}${videoCount > 1 ? ` · ${videoCount} videos` : ""}`,
    },
  ];
  if (project.role) rows.push({ label: "Role", value: project.role });
  if (project.date) rows.push({ label: "Date", value: formatMonth(project.date, "long") });
  rows.push({
    label: "Tools",
    value: (
      <ul className="flex flex-wrap gap-1.5">
        {project.tools.map((tool) => (
          <li key={tool} className="chip">
            {tool}
          </li>
        ))}
      </ul>
    ),
  });

  return (
    <div className="card p-6">
      <dl className="grid gap-5">
        {rows.map((row) => (
          <div key={row.label} className="grid gap-1.5">
            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{row.label}</dt>
            <dd className="text-[0.9375rem] font-medium leading-snug text-ink">{row.value}</dd>
          </div>
        ))}
        <div className="grid gap-1.5 border-t border-line pt-5">
          <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Provenance</dt>
          <dd>
            <span className="text-[0.9375rem] font-semibold text-accent-strong">{provenanceLabels[project.provenance]}</span>
            <p className="mt-1 text-sm leading-relaxed text-body">{provenanceDescriptions[project.provenance]}</p>
          </dd>
        </div>
      </dl>
    </div>
  );
}
