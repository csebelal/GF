import Link from "next/link";
import { ArrowRight } from "@/components/Icons";
import { PortfolioFilters } from "@/components/PortfolioFilters";
import { PageHeader } from "@/components/Section";
import { pageMetadata } from "@/lib/metadata";
import { getPublishedDbProjects, toDbCardData } from "@/lib/db/repository";

export const metadata = pageMetadata({
  title: "Portfolio",
  description:
    "Salesforce automation, CRM integration, data quality and reporting projects by Afrin Akter Chishti, with walkthrough videos and technical documentation.",
  path: "/portfolio",
});

export default async function PortfolioPage() {
  const published = await getPublishedDbProjects();
  const projects = published.map(toDbCardData);
  const categories = Array.from(new Set(published.map((p) => p.category))).sort();

  return (
    <>
      <PageHeader
        eyebrow="Portfolio"
        title={
          <>
            Walkthroughs and write-ups <span className="text-muted">from the admin console.</span>
          </>
        }
        intro="Each project explains the business problem, the configuration decisions and how the change was tested. Search by tool or filter by category and format."
      />

      <section className="container-page py-12 sm:py-16" aria-label="Project library" data-reveal>
        <PortfolioFilters projects={projects} categories={categories} />
      </section>

      <section className="container-page pb-24" data-reveal>
        <div className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-line bg-tint px-6 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="max-w-xl text-[0.9375rem] leading-relaxed text-body">
            <span className="font-semibold text-ink">Want to see how a project fits your team?</span> I’m happy to walk
            through any of these in more detail.
          </p>
          <Link href="/contact" className="btn btn-primary shrink-0">
            Get in touch <ArrowRight />
          </Link>
        </div>
      </section>
    </>
  );
}
