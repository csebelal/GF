import Image from "next/image";
import Link from "next/link";
import { CVDownload } from "@/components/CVDownload";
import { shouldUnoptimizeImage } from "@/lib/image-utils";
import { ExperienceTimeline } from "@/components/ExperienceTimeline";
import { ArrowRight, Award, Book, Check, LinkedIn, Mail, MapPin, TrendingUp, expertiseIcons } from "@/components/Icons";
import { ProjectCard } from "@/components/ProjectCard";
import { SectionHeader } from "@/components/Section";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import { extractHeadings, readDoc, docExists } from "@/lib/markdown";
import { safeHref } from "@/lib/security/sanitize";
import {
  getDbProfile,
  getDbExperience,
  getDbExpertise,
  getDbFeaturedProjects,
  getPublishedDbProjects,
  toDbCardData,
  type ResolvedDbProject,
} from "@/lib/db/repository";

const stack = ["Sales Cloud", "Service Cloud", "Flow", "Data Loader", "HubSpot", "Gong", "6sense", "Tableau", "Agentforce"];

function getWalkthrough(
  featuredWalkthrough: { slug: string; videoIndex: number } | undefined,
  publishedProjects: ResolvedDbProject[]
) {
  const targetSlug = featuredWalkthrough?.slug || "lead-routing-flow";
  const configured = publishedProjects.find((p) => p.slug === targetSlug);
  const project =
    configured ?? publishedProjects.find((candidate) => candidate.videos.some((video) => video.parsed.ok));
  if (!project) return undefined;

  const videoIndex = configured ? (featuredWalkthrough?.videoIndex ?? 0) : 0;
  const video =
    project.videos[videoIndex] ??
    project.videos.find((candidate) => candidate.parsed.ok);
  if (!video || !video.parsed.ok) return undefined;

  let chapters: any[] = [];
  if (video.documentationContent) {
    chapters = extractHeadings(video.documentationContent).filter((h) => h.depth === 2).slice(0, 5);
  } else if (project.documentationContent) {
    chapters = extractHeadings(project.documentationContent).filter((h) => h.depth === 2).slice(0, 5);
  } else {
    const docPath = video.documentation ?? project.documentation;
    if (docPath && docExists(docPath)) {
      chapters = extractHeadings(readDoc(docPath)).filter((h) => h.depth === 2).slice(0, 5);
    }
  }

  return { project, video, chapters };
}

export default async function HomePage() {
  const [profile, exp, expData, featuredProjects, publishedProjects] = await Promise.all([
    getDbProfile(),
    getDbExperience(),
    getDbExpertise(),
    getDbFeaturedProjects(3),
    getPublishedDbProjects(),
  ]);

  const featured = featuredProjects.map(toDbCardData);
  const walkthrough = getWalkthrough(profile.homeSettings?.featuredWalkthrough, publishedProjects);
  const homeAreas = expData.areas.filter((area: any) => area.onHome);
  const totalProjects = publishedProjects.length;

  const hero = profile.hero;
  const homeIntro = profile.homeIntro;
  const techStackItems = hero?.techStack?.items?.length ? hero.techStack.items : stack;

  return (
    <>
      {/* A. Hero ------------------------------------------------------------ */}
      <section data-nav-section="/" className="relative overflow-hidden">
        <div aria-hidden className="grid-lines absolute inset-0" />
        <div aria-hidden className="pointer-events-none absolute -right-40 top-10 size-[38rem] rounded-full bg-[radial-gradient(circle,rgba(225,238,236,0.85)_0%,transparent_70%)]" />
        <div className="container-page relative grid items-center gap-14 pb-16 pt-12 sm:pt-16 lg:grid-cols-12 lg:gap-10 lg:pb-20 lg:pt-16">
          <div className="lg:col-span-7">
            <p className="inline-flex animate-rise items-center gap-2.5 rounded-full border border-line bg-white/95 py-1.5 pl-2 pr-3.5 text-sm font-medium text-ink shadow-soft">
              {hero?.badgeDot !== false && (
                <span className="relative flex size-2.5 items-center justify-center">
                  <span className="absolute -inset-1 rounded-full bg-accent/20" />
                  <span className="relative size-2.5 rounded-full bg-accent" />
                </span>
              )}
              {hero?.badgeText || `${profile.jobTitle} at ${profile.employer}`}
            </p>
            <h1 className="mt-7 text-[clamp(2.5rem,4.7vw,4.15rem)] font-semibold leading-[1.03] tracking-[-0.04em]">
              {hero?.headlineMain || "Salesforce that sales, marketing and support teams"}{" "}
              <span className="text-muted">{hero?.headlineMuted || "can rely on."}</span>
            </h1>
            <p className="mt-7 max-w-[38rem] animate-rise text-lg leading-relaxed text-body sm:text-xl sm:leading-relaxed [animation-delay:120ms]">
              {hero?.description || (
                <>
                  I’m {profile.name}. I look after Sales Cloud and Service Cloud at {profile.employer} — the automation,
                  access rules, data standards and connected tools like HubSpot, Gong and 6sense that go-to-market teams
                  work from.
                </>
              )}
            </p>
            <div className="mt-9 flex animate-rise flex-wrap gap-3 [animation-delay:180ms]">
              <Link href={safeHref(hero?.primaryButtonUrl, "/portfolio")} className="btn btn-primary">
                {hero?.primaryButtonText || "Explore portfolio"} <ArrowRight />
              </Link>
              {hero?.showCvButton !== false && <CVDownload variant="secondary" cv={profile.cv} />}
            </div>
            {hero?.highlights && hero.highlights.length > 0 ? (
              <ul className="mt-10 flex animate-rise flex-wrap gap-x-6 gap-y-3 text-sm text-body [animation-delay:240ms]">
                {hero.highlights.map((h, i) => (
                  <li key={i} className="inline-flex items-center gap-2">
                    {h.icon === "award" ? (
                      <Award className="text-muted" />
                    ) : h.icon === "check" ? (
                      <Check className="text-muted" />
                    ) : (
                      <MapPin className="text-muted" />
                    )}
                    {h.text}
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="mt-10 flex animate-rise flex-wrap gap-x-6 gap-y-3 text-sm text-body [animation-delay:240ms]">
                <li className="inline-flex items-center gap-2">
                  <MapPin className="text-muted" /> {profile.location.city}, {profile.location.country}
                </li>
                <li className="inline-flex items-center gap-2">
                  <Award className="text-muted" /> Certified 6sense Administrator
                </li>
                <li className="inline-flex items-center gap-2">
                  <Check className="text-muted" /> Working in Salesforce since 2022
                </li>
              </ul>
            )}
          </div>

          <div className="relative mx-auto w-full max-w-md lg:col-span-5 lg:max-w-none">
            <div className="relative ml-auto w-[88%] sm:w-[82%] lg:w-[86%]">
              <div aria-hidden className="absolute -inset-3 rounded-[1.75rem] border border-line bg-white/60" />
              <Image
                src={profile.portrait.src || profile.portrait.fallback}
                alt={profile.portrait.alt || profile.name}
                width={profile.portrait.width || 600}
                height={profile.portrait.height || 719}
                sizes="(min-width: 1024px) 30vw, 80vw"
                priority
                unoptimized={shouldUnoptimizeImage(profile.portrait.src || profile.portrait.fallback)}
                className="relative aspect-[5/6] w-full rounded-[1.25rem] object-cover object-top shadow-lift"
              />
            </div>
            {hero?.careerStepCard?.show !== false && (
              <div className="absolute -left-1 bottom-8 w-[15.5rem] rounded-2xl border border-line bg-white/95 p-4 shadow-float sm:left-0">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                  {hero?.careerStepCard?.label || "Career step"}
                </p>
                <p className="mt-2 flex items-start gap-2 text-[0.9375rem] font-semibold leading-snug text-ink">
                  <TrendingUp className="mt-0.5 shrink-0 text-accent" />
                  {hero?.careerStepCard?.text || "Promoted to Salesforce Administrator, January 2025"}
                </p>
              </div>
            )}
            {hero?.languagesCard?.show !== false && (
              <div className="absolute right-0 top-6 hidden rounded-2xl border border-line bg-white/95 px-4 py-3 shadow-float sm:block lg:-right-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                  {hero?.languagesCard?.label || "Languages"}
                </p>
                <p className="mt-1 text-sm font-semibold text-ink">
                  {hero?.languagesCard?.text || "Bangla · English · Hindi"}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="relative border-y border-line bg-white/70">
          <div className="container-page flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:gap-8">
            <p className="shrink-0 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              {hero?.techStack?.label || "Works across"}
            </p>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[0.9375rem] font-medium text-ink-soft">
              {techStackItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* B. Featured projects ---------------------------------------------- */}
      {featured.length > 0 ? (
        <section data-nav-section="/portfolio" aria-labelledby="featured-title" className="py-24 sm:py-28 [contain:layout_style] [content-visibility:auto] [contain-intrinsic-size:auto_650px]">
          <div className="container-page">
            <div data-reveal>
              <SectionHeader
                id="featured-title"
                eyebrow="Selected work"
                title={
                  <>
                    Projects with the reasoning <span className="text-muted">behind each decision.</span>
                  </>
                }
                intro="Each project pairs a walkthrough video or technical write-up with the requirements, configuration choices and tests behind it."
                action={{ href: "/portfolio", label: `Browse all ${totalProjects} projects` }}
              />
            </div>
            <div className="mt-12 grid gap-6" data-reveal>
              <ProjectCard project={featured[0]} variant="feature" />
              {featured.length > 1 ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {featured.slice(1).map((project) => (
                    <ProjectCard key={project.slug} project={project} />
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {/* C. Professional introduction ------------------------------------- */}
      <section data-nav-section="/about" aria-labelledby="intro-title" className="border-y border-line bg-tint py-24 sm:py-28 [contain:layout_style] [content-visibility:auto] [contain-intrinsic-size:auto_550px]">
        <div className="container-page grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5" data-reveal>
            <p className="eyebrow">{homeIntro?.eyebrow || "How I got here"}</p>
            <h2 id="intro-title" className="mt-5 text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-[1.06] tracking-[-0.035em]">
              {homeIntro?.headline || "From the support desk to the admin console."}
            </h2>
            {homeIntro?.stats && homeIntro.stats.length > 0 ? (
              <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-line-strong pt-8">
                {homeIntro.stats.map((stat, i) => (
                  <div key={i}>
                    <dt className="text-sm text-muted">{stat.label}</dt>
                    <dd className="mt-1 text-3xl font-semibold tracking-tight text-ink">{stat.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-line-strong pt-8">
                <div>
                  <dt className="text-sm text-muted">Joined Field Nation</dt>
                  <dd className="mt-1 text-3xl font-semibold tracking-tight text-ink">2022</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted">Promoted</dt>
                  <dd className="mt-1 text-3xl font-semibold tracking-tight text-ink">2025</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted">Languages</dt>
                  <dd className="mt-1 text-3xl font-semibold tracking-tight text-ink">3</dd>
                </div>
              </dl>
            )}
          </div>
          <div className="space-y-6 text-[1.0625rem] leading-[1.8] text-body lg:col-span-7 lg:pt-12" data-reveal>
            {homeIntro?.paragraphs && homeIntro.paragraphs.length > 0 ? (
              homeIntro.paragraphs.map((p, i) => (
                <p key={i} className={i === homeIntro.paragraphs.length - 1 ? "text-ink" : ""}>
                  {p}
                </p>
              ))
            ) : (
              <>
                <p>
                  My career started on the customer side of the system. At Chaldal.com I resolved complaints, processed
                  account adjustments and kept customer records accurate. At Sheba Platform I designed quality standards
                  and trained the people who applied them. At Biztech Solutions I managed a customer service team —
                  hiring, coaching and reporting on service performance to management.
                </p>
                <p>
                  In April 2022 I joined Field Nation as a Junior Salesforce Administrator. The work felt like a natural
                  next step: access requests, Flow debugging, bulk data operations and sync issues between Salesforce and
                  the tools around it. In January 2025 I was promoted to Salesforce Administrator, and I now own the
                  org’s day-to-day administration, automation and release process.
                </p>
                <p className="text-ink">
                  That background still shapes how I build. I start from the person who will use the screen, document
                  every change for the people it affects, and keep a log of recurring questions so they can be fixed at
                  the source.
                </p>
              </>
            )}
            <Link href="/about" className="link-arrow">
              Read more about me <ArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* D. Areas of expertise -------------------------------------------- */}
      <section data-nav-section="/expertise" aria-labelledby="expertise-title" className="py-24 sm:py-28 [contain:layout_style] [content-visibility:auto] [contain-intrinsic-size:auto_650px]">
        <div className="container-page">
          <div data-reveal>
            <SectionHeader
              id="expertise-title"
              eyebrow="Areas of expertise"
              title={
                <>
                  The parts of Salesforce <span className="text-muted">people notice when they break.</span>
                </>
              }
              intro="Most of my work keeps everyday processes reliable: records arrive complete, the right people have access, and reports agree with each other."
              action={{ href: "/expertise", label: "Explore expertise in detail" }}
            />
          </div>
          <ul className="mt-14 grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line sm:grid-cols-2 lg:grid-cols-3" data-reveal="stagger">
            {homeAreas.map((area: any) => {
              const Icon = expertiseIcons[area.icon as keyof typeof expertiseIcons] || expertiseIcons.automation;
              return (
                <li key={area.id} className="group relative flex flex-col bg-surface p-7 transition-colors hover:bg-[#fdfcfa]">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-accent-soft text-[1.35rem] text-accent">
                    <Icon />
                  </span>
                  <h3 className="mt-6 text-lg font-semibold tracking-tight">
                    <Link href={`/expertise#${area.id}`} className="after:absolute after:inset-0 after:content-['']">
                      {area.shortTitle}
                    </Link>
                  </h3>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-body">{area.problem}</p>
                  <p className="mt-auto pt-6 text-[0.8125rem] font-medium text-muted">{(area.tools || []).join(" · ")}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* E. Featured walkthrough ------------------------------------------ */}
      {walkthrough ? (
        <section data-nav-section="/portfolio" aria-labelledby="walkthrough-title" className="border-y border-line bg-mist py-24 sm:py-28 [contain:layout_style] [content-visibility:auto] [contain-intrinsic-size:auto_550px]">
          <div className="container-page grid gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8" data-reveal>
              <YouTubeEmbed
                url={walkthrough.video.youtubeUrl}
                title={walkthrough.video.title}
                posterImage={walkthrough.video.posterImage}
                aspectRatio={walkthrough.video.aspectRatio}
                showCaptions={walkthrough.video.showCaptions}
              />
            </div>
            <div className="lg:col-span-4" data-reveal>
              <p className="eyebrow">Featured walkthrough</p>
              <h2 id="walkthrough-title" className="mt-4 text-[1.75rem] font-semibold leading-tight tracking-tight sm:text-[2rem]">
                {walkthrough.project.title}
              </h2>
              <p className="mt-4 leading-relaxed text-body">{walkthrough.video.description ?? walkthrough.project.summary}</p>
              {walkthrough.chapters.length > 0 ? (
                <div className="mt-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">The write-up covers</p>
                  <ol className="mt-3 grid gap-2">
                    {walkthrough.chapters.map((chapter: any, index: number) => (
                      <li key={chapter.id} className="flex items-baseline gap-3 text-[0.9375rem] text-ink">
                        <span className="w-5 shrink-0 text-xs font-semibold tabular-nums text-muted">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <Link href={`/portfolio/${walkthrough.project.slug}#${chapter.id}`} className="hover:text-accent hover:underline">
                          {chapter.text}
                        </Link>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}
              <Link href={`/portfolio/${walkthrough.project.slug}`} className="btn btn-primary mt-8">
                Open the full project <ArrowRight />
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* F. Working approach ---------------------------------------------- */}
      <section data-nav-section="/expertise" aria-labelledby="approach-title" className="py-24 sm:py-28 [contain:layout_style] [content-visibility:auto] [contain-intrinsic-size:auto_550px]">
        <div className="container-page">
          <div data-reveal>
            <SectionHeader
              id="approach-title"
              eyebrow="Working approach"
              align="stack"
              title={
                <>
                  How a request becomes a change <span className="text-muted">people actually use.</span>
                </>
              }
              intro="The same five steps apply whether the request is a new picklist value or a new automated process. Smaller changes move through them in an afternoon."
            />
          </div>
          <div className="relative mt-16">
            <span aria-hidden className="absolute left-[1.1875rem] top-2 hidden h-px w-[calc(100%-2.375rem)] bg-line-strong lg:block" />
            <span aria-hidden className="absolute bottom-2 left-[1.1875rem] top-2 w-px bg-line-strong lg:hidden" />
          <ol data-reveal="stagger" className="relative grid gap-10 lg:grid-cols-5 lg:gap-6">
            {(expData.workingApproach || []).map((step: any, index: number) => (
              <li key={step.title} className="relative grid grid-cols-[2.375rem_1fr] gap-x-5 lg:block">
                <span className="relative z-10 flex size-[2.375rem] items-center justify-center rounded-full border border-line-strong bg-canvas text-sm font-semibold tabular-nums text-ink lg:-mt-[1.0625rem]">
                  {index + 1}
                </span>
                <div className="lg:mt-6 lg:pr-2">
                  <h3 className="text-lg font-semibold tracking-tight">{step.title}</h3>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-body">{step.body}</p>
                  <p className="mt-4 border-t border-line pt-3 text-[0.8125rem] font-medium text-muted">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
          </div>
        </div>
      </section>

      {/* G. Experience and learning --------------------------------------- */}
      <section data-nav-section="/experience" aria-labelledby="experience-title" className="border-y border-line bg-tint py-24 sm:py-28 [contain:layout_style] [content-visibility:auto] [contain-intrinsic-size:auto_650px]">
        <div className="container-page">
          <div data-reveal>
            <SectionHeader
              id="experience-title"
              eyebrow="Experience and learning"
              title={
                <>
                  Customer service first. <span className="text-muted">Salesforce since 2022.</span>
                </>
              }
              intro="Customer service, quality assurance and team management came first. Each role added something I still use as an admin."
              action={{ href: "/experience", label: "See full experience" }}
            />
          </div>
          <div className="mt-14 grid gap-8 lg:grid-cols-12">
            <div className="card p-7 sm:p-9 lg:col-span-7" data-reveal>
              <ExperienceTimeline employers={exp.employers} variant="compact" />
            </div>
            <div className="grid content-start gap-6 lg:col-span-5" data-reveal>
              <div className="card p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Certification</p>
                {(exp.certifications || []).map((cert: any) => (
                  <div key={cert.name} className="mt-4 flex items-start gap-4">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-xl text-white">
                      <Award />
                    </span>
                    <div>
                      <p className="font-semibold text-ink">{cert.name}</p>
                      <p className="text-sm text-muted">Issued by {cert.issuer}</p>
                    </div>
                  </div>
                ))}
                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Course certificates</p>
                <ul className="mt-3 grid gap-2.5">
                  {(exp.courseCertificates || []).map((course: any) => (
                    <li key={course.name} className="flex items-center gap-3 text-[0.9375rem] text-ink">
                      <Book className="shrink-0 text-muted" />
                      <span>
                        {course.name} <span className="text-muted">· {course.issuer}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Currently exploring</p>
                <p className="mt-3 font-semibold text-ink">Product management with an AI foundation</p>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-body">
                  I’m building on admin work — gathering requirements, prioritizing a backlog, rolling out changes — to
                  learn how products are defined and shipped, with a focus on AI-assisted workflows.
                </p>
                {exp.education?.[0] && (
                  <p className="mt-5 border-t border-line pt-4 text-sm text-muted">
                    {exp.education[0].qualification}, {exp.education[0].institution} ({exp.education[0].year})
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* H. Contact invitation -------------------------------------------- */}
      <section data-nav-section="/contact" aria-labelledby="contact-title" className="py-24 sm:py-28 [contain:layout_style] [content-visibility:auto] [contain-intrinsic-size:auto_420px]">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-[1.5rem] border border-line bg-surface p-8 shadow-lift sm:p-12 lg:p-16" data-reveal>
            <div aria-hidden className="grid-lines absolute inset-0 opacity-70" />
            <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-[radial-gradient(circle,rgba(225,238,236,0.9)_0%,transparent_70%)]" />
            <div className="relative grid gap-10 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-7">
                <p className="eyebrow">Get in touch</p>
                <h2 id="contact-title" className="mt-5 text-[clamp(2rem,4.2vw,3.25rem)] font-semibold leading-[1.06] tracking-[-0.035em]">
                  Hiring for Salesforce or CRM operations? <span className="text-muted">Let’s talk.</span>
                </h2>
                <p className="mt-5 max-w-xl text-lg leading-relaxed text-body">
                  I’m happy to talk about Salesforce administration and CRM operations roles, and to compare notes with
                  anyone working where CRM data, product thinking and AI meet. Email is the quickest way to reach me.
                </p>
              </div>
              <div className="flex flex-col gap-3 lg:col-span-5 lg:items-end">
                <a href={`mailto:${profile.email}`} className="btn btn-primary w-full sm:w-auto">
                  <Mail /> {profile.email}
                </a>
                <div className="flex flex-wrap gap-3 lg:justify-end">
                  <a href={safeHref(profile.linkedin.url, "https://www.linkedin.com")} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                    <LinkedIn /> LinkedIn <span className="sr-only">(opens in a new tab)</span>
                  </a>
                  <CVDownload cv={profile.cv} />
                </div>
                <p className="mt-1 inline-flex items-center gap-2 text-sm text-muted">
                  <MapPin /> Based in {profile.location.city}, {profile.location.country}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
