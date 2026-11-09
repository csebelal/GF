import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@/components/Icons";
import { getFeaturedProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

const destinations = [
  { href: "/portfolio", label: "Portfolio", description: "Project walkthroughs and technical write-ups" },
  { href: "/expertise", label: "Expertise", description: "Automation, data quality, integrations and more" },
  { href: "/experience", label: "Experience", description: "Roles, dates and credentials" },
  { href: "/contact", label: "Contact", description: "Email, LinkedIn and CV" },
];

export default function NotFound() {
  const suggestions = getFeaturedProjects(3);
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="grid-lines absolute inset-0" />
      <div className="container-page relative py-20 sm:py-28">
        <p className="eyebrow">Error 404</p>
        <h1 className="mt-6 max-w-3xl text-[clamp(2.5rem,5.6vw,4.25rem)] font-semibold leading-[1.04] tracking-[-0.035em]">
          This page isn’t here. <span className="text-muted">The link may be old, or the project unpublished.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-body">
          Try one of these instead, or head back to the{" "}
          <Link href="/" className="font-semibold text-accent underline underline-offset-4">
            home page
          </Link>
          .
        </p>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {destinations.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="card group flex h-full flex-col p-6 transition-shadow hover:shadow-lift">
                <span className="flex items-center justify-between font-semibold text-ink">
                  {item.label}
                  <ArrowRight className="text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent" />
                </span>
                <span className="mt-2 text-sm leading-relaxed text-body">{item.description}</span>
              </Link>
            </li>
          ))}
        </ul>

        {suggestions.length > 0 ? (
          <div className="mt-14">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">Popular projects</h2>
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {suggestions.map((project) => (
                <li key={project.slug}>
                  <Link href={`/portfolio/${project.slug}`} className="group flex items-center justify-between gap-4 py-4">
                    <span className="font-medium text-ink group-hover:text-accent">{project.title}</span>
                    <span className="hidden text-sm text-muted sm:inline">{project.category}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
