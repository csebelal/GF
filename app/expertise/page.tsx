import Link from "next/link";
import { AnchorSpyNav } from "@/components/AnchorSpyNav";
import { ArrowRight, Check, expertiseIcons } from "@/components/Icons";
import { PageHeader } from "@/components/Section";
import { pageMetadata } from "@/lib/metadata";
import { contentTypeLabels } from "@/lib/project-utils";
import { getDbExpertise, getDbExperience, getPublishedDbProjects, type ResolvedDbProject } from "@/lib/db/repository";

export const metadata = pageMetadata({
  title: "Salesforce and CRM expertise",
  description:
    "How Afrin Akter Chishti approaches Salesforce automation, CRM data quality, integrations with HubSpot, Gong and 6sense, access management, reporting, releases, user adoption and AI-assisted workflows.",
  path: "/expertise",
});

function matchesArea(project: ResolvedDbProject, match: { categories?: string[]; tools?: string[] }) {
  if (match.categories?.includes(project.category)) return true;
  if (match.tools?.some((tool) => project.tools.includes(tool))) return true;
  return false;
}

export default async function ExpertisePage() {
  const [expertise, exp, publishedProjects] = await Promise.all([
    getDbExpertise(),
    getDbExperience(),
    getPublishedDbProjects(),
  ]);

  const expertiseAreas = expertise.areas;
  const toolsInPractice = exp.toolsInPractice;

  return (
    <>
      <PageHeader
        eyebrow="Expertise"
        title={
          <>
            Salesforce and CRM expertise, <span className="text-muted">organized around the problems it solves.</span>
          </>
        }
        intro="Each area below explains the business problem, what I do about it day to day, the tools involved, and where to see it in the portfolio."
      >
        <AnchorSpyNav
          ariaLabel="Expertise areas"
          items={expertiseAreas.map((area: any) => ({ id: area.id, label: area.shortTitle }))}
        />
      </PageHeader>

      <div>
        {expertiseAreas.map((area: any, index: number) => {
          const Icon = expertiseIcons[area.icon as keyof typeof expertiseIcons] || expertiseIcons.automation;
          const examples = publishedProjects.filter((p) => matchesArea(p, area.match || {})).slice(0, 3);
          return (
            <section
              key={area.id}
              id={area.id}
              aria-labelledby={`${area.id}-title`}
              className={`scroll-mt-24 border-b border-line py-16 sm:py-20 ${index % 2 === 1 ? "bg-tint" : ""}`}
            >
              <div className="container-page grid gap-10 lg:grid-cols-12 lg:gap-12" data-reveal>
                <div className="lg:col-span-5">
                  <div className="flex items-center gap-4">
                    <span className="flex size-12 items-center justify-center rounded-xl bg-accent-soft text-2xl text-accent">
                      <Icon />
                    </span>
                    <span className="text-sm font-semibold tabular-nums text-muted">
                      {String(index + 1).padStart(2, "0")} / {String(expertiseAreas.length).padStart(2, "0")}
                    </span>
                  </div>
                  <h2 id={`${area.id}-title`} className="mt-6 text-[clamp(1.6rem,2.8vw,2.25rem)] font-semibold leading-tight tracking-[-0.025em]">
                    {area.title}
                  </h2>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted">The business problem</p>
                  <p className="mt-2 text-[1.0625rem] leading-relaxed text-body">{area.problem}</p>
                </div>

                <div className="grid gap-8 lg:col-span-7">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">What I do</h3>
                    <ul className="mt-4 grid gap-3">
                      {(area.practices || []).map((practice: string) => (
                        <li key={practice} className="flex gap-3 text-[1rem] leading-relaxed text-ink-soft">
                          <Check className="mt-1 shrink-0 text-accent" />
                          {practice}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Tools</h3>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {(area.tools || []).map((tool: string) => (
                        <li key={tool} className="chip">
                          {tool}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">In the portfolio</h3>
                    {examples.length > 0 ? (
                      <ul className="mt-3 grid gap-2">
                        {examples.map((project) => (
                          <li key={project.slug}>
                            <Link
                              href={`/portfolio/${project.slug}`}
                              className="group flex items-center justify-between gap-4 rounded-xl border border-line bg-surface px-4 py-3 transition-shadow hover:shadow-soft"
                            >
                              <span className="min-w-0">
                                <span className="block font-semibold text-ink group-hover:text-accent">{project.title}</span>
                                <span className="block text-sm text-muted">
                                  {contentTypeLabels[project.contentType]}
                                </span>
                              </span>
                              <ArrowRight className="shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-[0.9375rem] text-body">
                        No published example yet.{" "}
                        <Link href="/contact" className="font-semibold text-accent underline underline-offset-4">
                          Ask me about this area
                        </Link>
                        .
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <section aria-labelledby="tools-title" className="border-t border-line py-20 sm:py-24">
        <div className="container-page">
          <div data-reveal>
            <h2 id="tools-title" className="text-[clamp(1.75rem,3.2vw,2.5rem)] font-semibold tracking-[-0.03em]">
              Tools and platforms in practice
            </h2>
            <p className="mt-3 max-w-2xl leading-relaxed text-body">
              How the tools listed on my CV connect to day-to-day admin work.
            </p>
          </div>
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" data-reveal="stagger">
            {(toolsInPractice || []).map((tool: any) => (
              <li key={tool.name} className="card flex flex-col p-6">
                <h3 className="text-lg font-semibold tracking-tight text-ink">{tool.name}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-body">{tool.use}</p>
              </li>
            ))}
          </ul>
          <div className="mt-14 flex flex-wrap items-center gap-4">
            <Link href="/portfolio" className="btn btn-primary">
              See these tools in the portfolio <ArrowRight />
            </Link>
            <Link href="/experience" className="btn btn-secondary">
              Review my employment history
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
