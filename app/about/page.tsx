import Image from "next/image";
import Link from "next/link";
import { CVDownload } from "@/components/CVDownload";
import { shouldUnoptimizeImage } from "@/lib/image-utils";
import { ArrowRight, Award, Globe, MapPin, TrendingUp } from "@/components/Icons";
import { pageMetadata } from "@/lib/metadata";
import { formatMonth } from "@/lib/project-utils";
import { getDbProfile, getDbExperience } from "@/lib/db/repository";
import { buildBreadcrumbSchema, getCanonicalSiteUrl, serializeJsonLd } from "@/lib/seo/schema";

export const metadata = pageMetadata({
  title: "About",
  description:
    "How Afrin Akter Chishti transitioned from customer service, QA, and training into Salesforce administration at Field Nation—and how she works with teams.",
  path: "/about",
  type: "profile",
});

const defaultPrinciples = [
  {
    title: "Ask who the change is for",
    body: "A request usually arrives as a solution — “add a field”, “make it required”. I ask who will use it, when and why, because the answer often changes what should be built.",
  },
  {
    title: "Write it down",
    body: "Every release gets a short note for the people it affects, and recurring fixes go into a guide. Documentation is what lets a change outlast the conversation that started it.",
  },
  {
    title: "Train in the user’s language",
    body: "Guides and walkthroughs describe the task a person is trying to finish, not the Salesforce feature behind it. That habit comes straight from my years in support and training.",
  },
  {
    title: "Fix the cause, not the ticket",
    body: "A sync error or a confusing layout that comes back twice is a process problem. I keep a log of recurring issues so they can be solved at the source.",
  },
];

const defaultChapters = [
  {
    id: "beginnings",
    label: "Where I started",
    title: "Learning what a system feels like from the other side",
    body: [
      "My first roles were customer-facing. As a Senior Customer Service Executive at Chaldal.com, I resolved complaints, processed account adjustments and kept records of every customer interaction. It taught me how much a customer’s experience depends on the accuracy of the data behind it.",
      "At Sheba Platform I moved into quality assurance and training: designing quality standards, agreeing procedures with teams, analysing error reports and coaching the people who applied the standards. I also worked with the development team on improving products and services. At Biztech Solutions I managed a customer service department — setting satisfaction goals, hiring and training agents, and reporting service statistics to management.",
    ],
  },
  {
    id: "salesforce",
    label: "Moving into Salesforce",
    title: "From handling requests to owning the platform",
    body: [
      "I joined Field Nation in April 2022 as a Junior Salesforce Administrator. Day to day, that meant user and access requests, debugging record-triggered and screen Flows, careful Data Loader work, and tracking down sync failures between Salesforce, HubSpot, Gong and 6sense. I documented fixes, wrote user guides and kept a log of recurring problems.",
      "That work led to a promotion to Salesforce Administrator in January 2025. I now own day-to-day administration of Sales Cloud and Service Cloud: the security model, automation, configuration, release management, reporting and data governance, along with the connected go-to-market stack. I also work with Agentforce on AI-assisted workflows grounded in CRM data.",
    ],
  },
  {
    id: "people",
    label: "How I work with people",
    title: "Most Salesforce work is a conversation first",
    body: [
      "I partner with Sales, Marketing and Customer Success leaders to turn business needs into practical improvements. The technical part is often the smaller part. Understanding how a team actually works, what slows them down and what they would rather not change takes more time — and saves more of it later.",
      "Training is part of every change. I write guides and walkthroughs, communicate releases to the people they affect, and follow up after launch. My background in QA and team training makes that feel like a core part of the job rather than an extra step.",
    ],
  },
  {
    id: "next",
    label: "What I’m exploring next",
    title: "Product management, built on an AI foundation",
    body: [
      "Admin work already involves a lot of product thinking: gathering requirements, prioritizing a backlog, deciding what not to build and rolling changes out to real users. I’m exploring a move toward product management, and I’m developing the skills for it deliberately rather than claiming them early.",
      "Alongside my admin role, I’ve completed Anthropic Academy courses (Claude 101, Claude Code 101 and Claude Code in Action) and use Claude AI for documentation, requirement summaries and analysis. Product-thinking exercises in my portfolio are labelled as independent or illustrative work, so it’s always clear what is practice and what is production.",
    ],
  },
];

export default async function AboutPage() {
  const [profile, exp] = await Promise.all([getDbProfile(), getDbExperience()]);
  const { education, languages, certifications, volunteering, awards } = exp;

  const chapters = profile.aboutStory?.chapters?.length ? profile.aboutStory.chapters : defaultChapters;
  const principles = profile.aboutStory?.principles?.length ? profile.aboutStory.principles : defaultPrinciples;

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div aria-hidden className="grid-lines absolute inset-0" />
        <div className="container-page relative grid gap-12 pb-20 pt-14 sm:pt-20 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <p className="eyebrow animate-rise">About {profile.shortName || profile.name}</p>
            <h1 className="mt-6 text-[clamp(2.5rem,5.4vw,4.1rem)] font-semibold leading-[1.04] tracking-[-0.035em]">
              {profile.aboutStory?.introHeadline || "I came to Salesforce from the support desk, and I still build for the person filing the ticket."}
            </h1>
            <p className="mt-7 max-w-2xl animate-rise text-lg leading-relaxed text-body sm:text-xl sm:leading-relaxed [animation-delay:120ms]">
              {profile.aboutStory?.introParagraph ||
                `I’m a Salesforce Administrator at ${profile.employer}, based in ${profile.location.city}, ${profile.location.country}. Before Salesforce I worked in customer service, quality assurance and team training — experience that still shapes how I gather requirements, test changes and help people adopt them.`}
            </p>
            <div className="mt-9 flex animate-rise flex-wrap gap-3 [animation-delay:180ms]">
              <Link href="/experience" className="btn btn-primary">
                View experience <ArrowRight />
              </Link>
              <CVDownload cv={profile.cv} />
            </div>
          </div>

          <aside aria-label="At a glance" className="lg:col-span-5">
            <div className="card overflow-hidden">
              <Image
                src={profile.portrait.src || profile.portrait.fallback}
                alt={profile.portrait.alt || profile.name}
                width={profile.portrait.width || 600}
                height={profile.portrait.height || 719}
                sizes="(min-width: 1024px) 34vw, 90vw"
                priority
                unoptimized={shouldUnoptimizeImage(profile.portrait.src || profile.portrait.fallback)}
                className="aspect-[4/3] w-full object-cover object-[50%_18%]"
              />
              <dl className="grid gap-4 p-6 text-[0.9375rem]">
                <div className="flex items-start gap-3">
                  <TrendingUp className="mt-0.5 shrink-0 text-accent" />
                  <div>
                    <dt className="sr-only">Current role</dt>
                    <dd className="font-semibold text-ink">
                      {profile.jobTitle}, {profile.employer}
                    </dd>
                    <dd className="text-sm text-muted">Since January 2025 · Salesforce work since April 2022</dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 shrink-0 text-muted" />
                  <div>
                    <dt className="sr-only">Location</dt>
                    <dd className="font-semibold text-ink">{profile.location.city}, {profile.location.country}</dd>
                    <dd className="text-sm text-muted">Remote-friendly</dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Award className="mt-0.5 shrink-0 text-muted" />
                  <div>
                    <dt className="sr-only">Certification</dt>
                    <dd className="font-semibold text-ink">Certified 6sense Administrator</dd>
                    <dd className="text-sm text-muted">Plus Claude 101, Claude Code 101, Claude Code in Action</dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Globe className="mt-0.5 shrink-0 text-muted" />
                  <div>
                    <dt className="sr-only">Languages</dt>
                    <dd className="font-semibold text-ink">Bangla, English (IELTS 8.0), Hindi</dd>
                    <dd className="text-sm text-muted">Working comfortably with global teams</dd>
                  </div>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </section>

      <section aria-labelledby="collaboration-title" className="py-20 sm:py-24">
        <div className="container-page">
          <h2 id="collaboration-title" className="text-[clamp(1.75rem,3.2vw,2.5rem)] font-semibold tracking-[-0.03em]">
            How I collaborate with teams
          </h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-body">
            Four habits drawn from earlier roles that keep Salesforce work predictable and clear.
          </p>
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" data-reveal="stagger">
            {principles.map((principle: any) => (
              <li key={principle.title} className="card flex flex-col p-6">
                <h3 className="text-lg font-semibold tracking-tight text-ink">{principle.title}</h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-body">{principle.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="chapters-title" className="border-t border-line bg-tint py-20 sm:py-24">
        <div className="container-page">
          <p className="eyebrow" id="chapters-title">
            The full story
          </p>
          <div className="mt-12 grid gap-16 lg:grid-cols-12 lg:gap-16">
            <nav aria-label="Story chapters" className="lg:col-span-4">
              <ol className="sticky top-28 space-y-3">
                {chapters.map((chapter: any, index: number) => (
                  <li key={chapter.id}>
                    <a
                      href={`#${chapter.id}`}
                      className="group flex items-baseline gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-canvas hover:text-ink"
                    >
                      <span className="text-xs font-semibold tabular-nums text-muted group-hover:text-accent">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>{chapter.label}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="space-y-16 lg:col-span-8">
              {chapters.map((chapter: any) => (
                <article key={chapter.id} id={chapter.id} className="scroll-mt-28" data-reveal>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{chapter.label}</p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{chapter.title}</h3>
                  <div className="mt-5 space-y-4 text-[1.0625rem] leading-[1.8] text-body">
                    {chapter.body.map((p: string, pIndex: number) => (
                      <p key={pIndex}>{p}</p>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Education, volunteering and awards" className="border-t border-line py-20 sm:py-24">
        <div className="container-page grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6" data-reveal>
            <h2 className="text-xl font-semibold tracking-tight">Education</h2>
            <ol className="mt-6 divide-y divide-line border-y border-line">
              {(education || []).map((item: any) => (
                <li key={item.qualification} className="flex items-baseline justify-between py-4">
                  <div>
                    <p className="font-semibold text-ink">{item.qualification}</p>
                    <p className="text-sm text-body">{item.institution}</p>
                  </div>
                  <p className="text-sm font-medium tabular-nums text-muted">{item.year}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="lg:col-span-6" data-reveal>
            <h2 className="text-xl font-semibold tracking-tight">Awards and volunteering</h2>
            <div className="mt-6 space-y-4">
              {(awards || []).map((award: any) => (
                <div key={award.name} className="card p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Award</p>
                  <p className="mt-1 text-lg font-semibold text-ink">{award.name}</p>
                  <p className="text-sm text-muted">{award.issuer}</p>
                </div>
              ))}
              {(volunteering || []).slice(0, 2).map((item: any) => (
                <div key={item.title} className="card p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                    Volunteering · {formatMonth(item.start)} – {formatMonth(item.end)}
                  </p>
                  <p className="mt-1 font-semibold text-ink">{item.title}</p>
                  <p className="text-sm text-muted">{item.organization}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-tint py-16">
        <div className="container-page flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-[1.0625rem] leading-relaxed text-body">
            <span className="font-semibold text-ink">Want to see the work?</span> The portfolio includes Flow
            walkthroughs, data cleanup examples and technical documentation.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/portfolio" className="btn btn-primary">
              View portfolio <ArrowRight />
            </Link>
            <Link href="/contact" className="btn btn-secondary">
              Get in touch
            </Link>
          </div>
        </div>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(
            buildBreadcrumbSchema(getCanonicalSiteUrl(), [
              { name: "Home", path: "/" },
              { name: "About", path: "/about" },
            ])
          ),
        }}
      />
    </>
  );
}
