import Link from "next/link";
import type { ProjectCardData } from "@/lib/projects";
import { ContentTypeBadge, ProvenanceBadge, ToolList } from "./Badges";
import { ArrowRight } from "./Icons";
import { ProjectCover } from "./ProjectCover";

interface ProjectCardProps {
  project: ProjectCardData;
  variant?: "default" | "feature" | "compact";
  headingLevel?: "h2" | "h3";
  priority?: boolean;
}

/**
 * Project preview. The whole card is clickable through the title link's
 * stretched pseudo-element, so there is a single, well-labelled link per card.
 */
export function ProjectCard({ project, variant = "default", headingLevel = "h3", priority }: ProjectCardProps) {
  const Heading = headingLevel;
  const hasVideo = project.contentType !== "documentation";
  const href = `/portfolio/${project.slug}`;

  if (variant === "feature") {
    return (
      <article className="group card relative grid overflow-hidden transition-shadow duration-300 hover:shadow-lift lg:grid-cols-12">
        <ProjectCover
          cover={project.cover}
          category={project.category}
          title={project.title}
          hasVideo={hasVideo}
          priority={priority}
          className="aspect-[16/10] lg:col-span-7"
        />
        <div className="flex flex-col p-6 sm:p-8 lg:col-span-5 lg:p-10">
          <div className="flex flex-wrap gap-2">
            <ProvenanceBadge provenance={project.provenance} />
            <ContentTypeBadge type={project.contentType} />
          </div>
          <p className="mt-6 text-sm font-medium text-accent">{project.category}</p>
          <Heading className="mt-2 text-2xl font-semibold leading-tight tracking-tight sm:text-[1.875rem]">
            <Link href={href} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
              {project.title}
            </Link>
          </Heading>
          <p className="mt-4 text-[1.0625rem] leading-relaxed text-body">{project.summary}</p>
          <ToolList tools={project.tools} className="mt-6" />
          <span aria-hidden className="mt-auto inline-flex items-center gap-2 pt-8 text-[0.9375rem] font-semibold text-ink">
            View project <ArrowRight className="motion-safe:transition-transform duration-200 motion-safe:group-hover:translate-x-1" />
          </span>
        </div>
        <FocusRing />
      </article>
    );
  }

  const compact = variant === "compact";
  return (
    <article className="group card relative flex h-full flex-col overflow-hidden transition-[box-shadow,border-color] duration-200 hover:border-line-strong hover:shadow-lift">
      <ProjectCover
        cover={project.cover}
        category={project.category}
        title={project.title}
        hasVideo={hasVideo}
        priority={priority}
        className="aspect-[16/10] border-b border-line"
      />
      <div className={`flex flex-1 flex-col ${compact ? "p-5" : "p-6"}`}>
        <div className="flex flex-wrap items-center gap-2">
          <ProvenanceBadge provenance={project.provenance} />
          <ContentTypeBadge type={project.contentType} />
        </div>
        <p className="mt-4 text-[0.8125rem] font-medium text-accent">{project.category}</p>
        <Heading className={`mt-1.5 font-semibold leading-snug tracking-tight ${compact ? "text-lg" : "text-xl"}`}>
          <Link href={href} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
            {project.title}
          </Link>
        </Heading>
        {!compact ? <p className="mt-3 text-[0.9375rem] leading-relaxed text-body">{project.summary}</p> : null}
        <ToolList tools={project.tools} limit={compact ? 3 : 4} className="mt-auto pt-5" />
      </div>
      <FocusRing />
    </article>
  );
}

/** Visible focus outline for the stretched card link. */
function FocusRing() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-[var(--radius-card)] ring-2 ring-accent ring-offset-2 ring-offset-canvas opacity-0 transition-opacity group-has-[a:focus-visible]:opacity-100"
    />
  );
}
