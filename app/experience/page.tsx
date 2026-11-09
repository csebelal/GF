import Link from "next/link";
import { CVDownload } from "@/components/CVDownload";
import { ExperienceTimeline } from "@/components/ExperienceTimeline";
import { ArrowRight, Award, Book, Globe } from "@/components/Icons";
import { PageHeader } from "@/components/Section";
import { pageMetadata } from "@/lib/metadata";
import { formatMonth } from "@/lib/project-utils";
import { getDbExperience } from "@/lib/db/repository";

export const metadata = pageMetadata({
  title: "Experience and credentials",
  description:
    "Career history of Afrin Akter Chishti: Salesforce Administrator and Junior Salesforce Administrator at Field Nation, with earlier roles in customer service, quality assurance and training. Certifications, courses, education and languages.",
  path: "/experience",
});

export default async function ExperiencePage() {
  const exp = await getDbExperience();
  const { employers, certifications, courseCertificates, awards, education, languages, volunteering } = exp;
  return (
    <>
      <PageHeader
        eyebrow="Experience"
        title={
          <>
            Career and credentials. <span className="text-muted">Titles and dates as they appear on my CV.</span>
          </>
        }
        intro="Salesforce administration at Field Nation since April 2022, including a promotion in January 2025, after earlier roles in customer service, quality assurance and team training."
      >
        <div className="flex flex-wrap gap-3">
          <CVDownload variant="primary" showMeta />
          <Link href="/contact" className="btn btn-secondary">
            Contact
          </Link>
        </div>
      </PageHeader>

      <section aria-labelledby="summary-title" className="border-b border-line bg-surface">
        <h2 id="summary-title" className="sr-only">
          Summary
        </h2>
        <dl className="container-page grid divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="py-6 sm:pr-8">
            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Current role</dt>
            <dd className="mt-2 font-semibold text-ink">Salesforce Administrator, Field Nation</dd>
            <dd className="text-sm text-muted">January 2025 – present</dd>
          </div>
          <div className="py-6 sm:px-8">
            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Salesforce experience</dt>
            <dd className="mt-2 font-semibold text-ink">Since April 2022</dd>
            <dd className="text-sm text-muted">Sales Cloud and Service Cloud</dd>
          </div>
          <div className="py-6 sm:pl-8">
            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Certification</dt>
            <dd className="mt-2 font-semibold text-ink">Certified 6sense Administrator</dd>
            <dd className="text-sm text-muted">Plus three Anthropic Academy courses</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="career-title" className="py-20 sm:py-24">
        <div className="container-page">
          <h2 id="career-title" className="text-[clamp(1.75rem,3.2vw,2.5rem)] font-semibold tracking-[-0.03em]">
            Employment history
          </h2>
          <div className="mt-12">
            <ExperienceTimeline employers={employers} />
          </div>
        </div>
      </section>

      <section aria-labelledby="credentials-title" className="border-y border-line bg-tint py-20 sm:py-24">
        <div className="container-page">
          <h2 id="credentials-title" className="text-[clamp(1.75rem,3.2vw,2.5rem)] font-semibold tracking-[-0.03em]">
            Certifications and learning
          </h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-body">
            Formal certifications are listed separately from course completions.
          </p>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <div className="card p-7" data-reveal>
              <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                <Award className="text-base text-accent" /> Professional certification
              </h3>
              <ul className="mt-5 grid gap-4">
                {certifications.map((cert) => (
                  <li key={cert.name}>
                    <p className="text-lg font-semibold text-ink">{cert.name}</p>
                    <p className="text-sm text-muted">Issued by {cert.issuer}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-7" data-reveal>
              <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                <Book className="text-base text-accent" /> Course completions
              </h3>
              <ul className="mt-5 grid gap-4">
                {courseCertificates.map((course) => (
                  <li key={course.name}>
                    <p className="font-semibold text-ink">{course.name}</p>
                    <p className="text-sm text-muted">
                      {course.issuer} · {course.kind}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-7" data-reveal>
              <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                <Award className="text-base text-accent" /> Award
              </h3>
              <ul className="mt-5 grid gap-4">
                {awards.map((award) => (
                  <li key={award.name}>
                    <p className="font-semibold text-ink">{award.name}</p>
                    <p className="text-sm text-muted">{award.issuer}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Education and languages" className="py-20 sm:py-24">
        <div className="container-page grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7" data-reveal>
            <h2 className="text-[clamp(1.5rem,2.6vw,2rem)] font-semibold tracking-[-0.025em]">Education</h2>
            <ol className="mt-8 divide-y divide-line border-y border-line">
              {education.map((item) => (
                <li key={item.qualification} className="flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                  <div>
                    <p className="font-semibold text-ink">{item.qualification}</p>
                    <p className="text-[0.9375rem] text-body">{item.institution}</p>
                  </div>
                  <p className="text-sm font-medium tabular-nums text-muted">{item.year}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="lg:col-span-5" data-reveal>
            <h2 className="text-[clamp(1.5rem,2.6vw,2rem)] font-semibold tracking-[-0.025em]">Languages</h2>
            <ul className="mt-8 grid gap-3">
              {languages.map((language) => (
                <li key={language.name} className="card flex items-center justify-between gap-4 px-5 py-4">
                  <span className="flex items-center gap-3 font-semibold text-ink">
                    <Globe className="text-muted" /> {language.name}
                  </span>
                  <span className="text-sm text-body">
                    {language.level}
                    {language.note ? <span className="text-muted"> · {language.note}</span> : null}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="volunteering-title" className="border-t border-line py-20 sm:py-24">
        <div className="container-page">
          <h2 id="volunteering-title" className="text-[clamp(1.5rem,2.6vw,2rem)] font-semibold tracking-[-0.025em]">
            Projects and volunteering
          </h2>
          <ul className="mt-8 grid gap-6 md:grid-cols-3">
            {volunteering.map((item) => (
              <li key={item.title} className="card flex flex-col p-6" data-reveal>
                <p className="text-sm text-muted">
                  {formatMonth(item.start)} – {formatMonth(item.end)}
                </p>
                <h3 className="mt-2 text-lg font-semibold leading-snug">{item.title}</h3>
                {item.role ? <p className="text-sm font-medium text-accent">{item.role}</p> : null}
                <p className="mt-1 text-sm text-muted">{item.organization}</p>
                <p className="mt-4 text-[0.9375rem] leading-relaxed text-body">{item.description}</p>
              </li>
            ))}
          </ul>
          <div className="mt-14 flex flex-wrap items-center gap-4">
            <CVDownload variant="primary" showMeta />
            <Link href="/expertise" className="link-arrow">
              See how this experience maps to expertise <ArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
