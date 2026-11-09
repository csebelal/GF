import { contentTypeLabels, provenanceDescriptions, provenanceLabels } from "@/lib/project-utils";
import type { ContentType, Provenance } from "@/lib/types";
import { FileText, Video } from "./Icons";

export function ContentTypeBadge({ type }: { type: ContentType }) {
  return (
    <span className="chip">
      {type !== "documentation" ? <Video className="text-[0.95em] text-muted" /> : null}
      {type !== "video" ? <FileText className="text-[0.95em] text-muted" /> : null}
      {contentTypeLabels[type]}
    </span>
  );
}

/** Professional work gets no badge; independent and illustrative work is always labelled. */
export function ProvenanceBadge({ provenance }: { provenance: Provenance }) {
  if (provenance === "professional") return null;
  return (
    <span
      className="chip border-accent-line bg-accent-soft font-semibold text-accent-strong"
      title={provenanceDescriptions[provenance]}
    >
      {provenanceLabels[provenance]}
    </span>
  );
}

export function SampleBadge() {
  return <span className="chip border-amber-line bg-amber-soft font-semibold text-amber">Sample</span>;
}

export function ToolList({ tools, limit, className = "" }: { tools: string[]; limit?: number; className?: string }) {
  const visible = limit ? tools.slice(0, limit) : tools;
  const hidden = tools.length - visible.length;
  return (
    <ul className={`flex flex-wrap gap-x-3 gap-y-1 text-[0.8125rem] text-muted ${className}`} aria-label="Tools">
      {visible.map((tool, i) => (
        <li key={tool} className="flex items-center gap-3">
          {i > 0 ? <span aria-hidden className="size-1 rounded-full bg-line-strong" /> : null}
          {tool}
        </li>
      ))}
      {hidden > 0 ? (
        <li className="flex items-center gap-3">
          <span aria-hidden className="size-1 rounded-full bg-line-strong" />+{hidden} more
        </li>
      ) : null}
    </ul>
  );
}
