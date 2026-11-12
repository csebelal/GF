import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentTypeBadge, ProvenanceBadge } from "@/components/Badges";
import { DocumentationRenderer } from "@/components/DocumentationRenderer";
import { ArrowLeft, ArrowRight, ArrowUpRight, Download, FileText, LinkIcon, Mail } from "@/components/Icons";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectMetadata } from "@/components/ProjectMetadata";
import { ReadingProgress } from "@/components/ReadingProgress";
import { TableOfContents, type TocItem } from "@/components/TableOfContents";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import { profile } from "@/content/site";
import { shouldUnoptimizeImage } from "@/lib/image-utils";
import type { LoadedDoc } from "@/lib/markdown";
import { pageMetadata } from "@/lib/metadata";
import { safeHref } from "@/lib/security/sanitize";
import {
  getDbProjectBySlug,
  getDbProjectDocs,
  getPublishedDbProjects,
  toDbCardData,
  type ResolvedProject,
  type ResolvedVideo,
} from "@/lib/db/repository";

/** Allow dynamic resolution so newly added projects from Admin Panel load immediately. */
export const dynamicParams = true;

export async function generateStaticParams() {
  const published = await getPublishedDbProjects();
  return published.map((project) => ({ slug: project.slug }));
}

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getDbProjectBySlug(slug);
  if (!project) return {};
  return pageMetadata({
    title: project.title,
    description: project.summary,
    path: `/portfolio/${project.slug}`,
    type: "article",
  });
}

function docToc(doc: LoadedDoc | undefined): TocItem[] {
  return (doc?.headings ?? []).map((heading) => ({
    id: heading.id,
    text: heading.text,
    level: heading.depth === 2 ? 2 : 3,
  }));
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const published = await getPublishedDbProjects();
  const currentIndex = published.findIndex((p) => p.slug === slug);
  if (currentIndex === -1) notFound();

  const project = published[currentIndex];
  const previous = currentIndex > 0 ? published[currentIndex - 1] : undefined;
  const next = currentIndex < published.length - 1 ? published[currentIndex + 1] : undefined;

  const related = published
    .filter((p) => p.slug !== slug && (p.category === project.category || p.tools.some((t) => project.tools.includes(t))))
    .slice(0, 3)
    .map(toDbCardData);

  const docs = getDbProjectDocs(project);

  const videos = project.videos;
  const singleVideo = videos.length === 1 ? videos[0] : undefined;
  const multipleVideos = videos.length > 1;
  const singleVideoDoc = singleVideo ? docs.videoDocs[0] : undefined;
  const hasLongForm = Boolean(docs.article || docs.videoDocs.some(Boolean));
  const hasResources = Boolean(project.attachments?.length || project.externalLinks?.length);
  const overviewText = project.overview ?? (singleVideo?.description || undefined);

  // Table of contents mirrors the sections rendered below.
  const toc: TocItem[] = [{ id: "overview", text: "Overview", level: 1 }];
  if (multipleVideos) {
    toc.push({ id: "walkthroughs", text: "Walkthroughs", level: 1 });
    videos.forEach((video, index) => toc.push({ id: `walkthrough-${index + 1}`, text: video.title, level: 2 }));
  }
  if (singleVideoDoc) {
    toc.push({ id: "walkthrough-notes", text: "Walkthrough notes", level: 1 }, ...docToc(singleVideoDoc));
  }
  if (docs.article) toc.push({ id: "documentation", text: "Technical documentation", level: 1 }, ...docToc(docs.article));
  if (project.screenshots?.length) toc.push({ id: "screenshots", text: "Screenshots and diagrams", level: 1 });
  if (hasResources) toc.push({ id: "resources", text: "Files and links", level: 1 });

  const heroIsVideo = Boolean(singleVideo);
  const isPortraitHero = singleVideo?.aspectRatio === "9:16";

  return (
    <article>
      {hasLongForm ? <ReadingProgress targetId="project-body" /> : null}

      {/* Header ------------------------------------------------------------ */}
      <header className="relative overflow-hidden">
        <div aria-hidden className="grid-lines absolute inset-0" />
        <div className="container-page relative pt-8 sm:pt-10">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-muted">
              <li>
                <Link href="/" className="hover:text-ink hover:underline">
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link href="/portfolio" className="hover:text-ink hover:underline">
                  Portfolio
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="max-w-[16rem] truncate text-ink sm:max-w-none">
                {project.title}
              </li>
            </ol>
          </nav>

          <div className="grid gap-10 pb-12 pt-10 lg:grid-cols-12 lg:gap-12 lg:pb-14">
            <div className="lg:col-span-8">
              <div className="flex flex-wrap gap-2">
                <ProvenanceBadge provenance={project.provenance} />
                <ContentTypeBadge type={project.contentType} />
              </div>
              <p className="mt-6 text-sm font-semibold text-accent">{project.category}</p>
              <h1 className="mt-3 text-[clamp(2.25rem,4.8vw,3.75rem)] font-semibold leading-[1.04] tracking-[-0.035em]">
                {project.title}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-body sm:text-xl sm:leading-relaxed">
                {project.summary}
              </p>
            </div>
            <aside aria-label="Project details" className="lg:col-span-4">
              <ProjectMetadata project={project} />
            </aside>
          </div>
        </div>
      </header>

      {/* Hero media ------------------------------------------------------- */}
      {heroIsVideo && singleVideo ? (
        <div className="container-page">
          {isPortraitHero ? (
            <div className="rounded-[1.5rem] border border-line bg-mist px-5 py-10 sm:py-14">
              <VideoPlayer video={singleVideo} priority />
            </div>
          ) : (
            <div className="mx-auto max-w-[66rem]">
              <VideoPlayer video={singleVideo} priority />
            </div>
          )}
        </div>
      ) : project.coverImage ? (
        <div className="container-page">
          <figure className="mx-auto max-w-[66rem]">
            <Image
              src={project.coverImage.src}
              alt={project.coverImage.alt}
              width={1200}
              height={750}
              sizes="(min-width: 1024px) 66rem, 100vw"
              priority
              unoptimized={shouldUnoptimizeImage(project.coverImage.src)}
              className="aspect-[16/10] w-full rounded-[var(--radius-card)] border border-line bg-surface object-cover shadow-lift"
            />
            {project.coverImage.caption ? (
              <figcaption className="mt-3 text-sm text-muted">{project.coverImage.caption}</figcaption>
            ) : null}
          </figure>
        </div>
      ) : null}

      {/* Body --------------------------------------------------------------- */}
      <div id="project-body" className="container-page py-16 sm:py-20">
        <div className={hasLongForm ? "grid gap-10 lg:grid-cols-12 lg:gap-12" : "mx-auto max-w-3xl"}>
          {hasLongForm ? (
            <aside className="lg:col-span-3">
              <div className="lg:hidden">
                <TableOfContents items={toc} variant="mobile" />
              </div>
              <div className="sticky top-28 hidden max-h-[calc(100vh-8rem)] overflow-y-auto pb-6 lg:block">
                <TableOfContents items={toc} variant="desktop" />
              </div>
            </aside>
          ) : null}

          <div className={hasLongForm ? "min-w-0 lg:col-span-9 lg:max-w-[46rem]" : "min-w-0"}>
            <section aria-labelledby="overview" className="scroll-mt-28">
              <h2 id="overview" className="text-2xl font-semibold tracking-tight">
                Overview
              </h2>
              {overviewText ? (
                <DocumentationRenderer markdown={overviewText} className="mt-4" />
              ) : (
                <p className="mt-4 text-[1.0625rem] leading-relaxed text-body">{project.summary}</p>
              )}
              {singleVideo?.transcript && docs.transcripts[0] ? (
                <Transcript markdown={docs.transcripts[0]} title={singleVideo.title} />
              ) : null}
            </section>

            {multipleVideos ? (
              <section aria-labelledby="walkthroughs" className="mt-16">
                <h2 id="walkthroughs" className="text-2xl font-semibold tracking-tight">
                  Walkthroughs
                </h2>
                <p className="mt-3 text-[1.0625rem] leading-relaxed text-body">
                  {videos.length} videos, each with its own notes.
                </p>
                <ol className="mt-10 grid gap-16">
                  {videos.map((video, index) => (
                    <li key={`${video.title}-${index}`}>
                      <h3 id={`walkthrough-${index + 1}`} className="flex items-baseline gap-3 text-xl font-semibold tracking-tight">
                        <span className="text-sm font-semibold tabular-nums text-muted">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        {video.title}
                      </h3>
                      <div className="mt-5">
                        <VideoPlayer video={video} />
                      </div>
                      {video.description ? (
                        <p className="mt-5 text-[1.0625rem] leading-relaxed text-body">{video.description}</p>
                      ) : null}
                      {docs.videoDocs[index] ? (
                        <div className="mt-6 rounded-[var(--radius-card)] border border-line bg-surface p-6 sm:p-8">
                          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                            Notes for this video
                          </p>
                          <DocumentationRenderer
                            markdown={docs.videoDocs[index]!.markdown}
                            idPrefix={docs.videoDocs[index]!.idPrefix}
                            headingOffset={2}
                            className="prose-compact"
                          />
                        </div>
                      ) : null}
                      {docs.transcripts[index] ? <Transcript markdown={docs.transcripts[index]!} title={video.title} /> : null}
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}

            {singleVideoDoc ? (
              <section aria-labelledby="walkthrough-notes" className="mt-16 border-t border-line pt-12">
                <h2 id="walkthrough-notes" className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  Walkthrough notes
                </h2>
                <DocumentationRenderer
                  markdown={singleVideoDoc.markdown}
                  idPrefix={singleVideoDoc.idPrefix}
                  headingOffset={1}
                  className="mt-6"
                />
              </section>
            ) : null}

            {docs.article ? (
              <section aria-labelledby="documentation" className="mt-16 border-t border-line pt-12">
                <h2 id="documentation" className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  Technical documentation
                </h2>
                <DocumentationRenderer
                  markdown={docs.article.markdown}
                  idPrefix={docs.article.idPrefix}
                  headingOffset={1}
                  className="mt-6"
                />
              </section>
            ) : null}

            {project.screenshots?.length ? (
              <section aria-labelledby="screenshots" className="mt-16 border-t border-line pt-12">
                <h2 id="screenshots" className="text-2xl font-semibold tracking-tight">
                  Screenshots and diagrams
                </h2>
                <div className={`mt-8 grid gap-8 ${project.screenshots.length > 1 && !hasLongForm ? "sm:grid-cols-2" : ""}`}>
                  {project.screenshots.map((shot) => (
                    <figure key={shot.src + shot.alt}>
                      <a href={safeHref(shot.src)} target="_blank" rel="noopener noreferrer" className="group block" aria-label={`Open full-size image: ${shot.alt} (new tab)`}>
                        <Image
                          src={shot.src}
                          alt={shot.alt}
                          width={1200}
                          height={750}
                          sizes="(min-width: 1024px) 52rem, 100vw"
                          unoptimized={shouldUnoptimizeImage(shot.src)}
                          className="h-auto w-full rounded-[0.875rem] border border-line bg-surface transition-shadow group-hover:shadow-lift"
                        />
                      </a>
                      {shot.caption ? <figcaption className="mt-3 text-sm leading-relaxed text-muted">{shot.caption}</figcaption> : null}
                    </figure>
                  ))}
                </div>
              </section>
            ) : null}

            {hasResources ? (
              <section aria-labelledby="resources" className="mt-16 border-t border-line pt-12">
                <h2 id="resources" className="text-2xl font-semibold tracking-tight">
                  Files and links
                </h2>
                <ul className="mt-6 grid gap-3">
                  {project.attachments?.map((file) => (
                    <li key={file.url}>
                      <a
                        href={safeHref(file.url)}
                        download
                        className="card group flex items-center gap-4 p-4 transition-shadow hover:shadow-lift"
                      >
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-tint text-lg text-ink">
                          <FileText />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold text-ink">{file.label}</span>
                          {file.description ? <span className="block text-sm text-muted">{file.description}</span> : null}
                        </span>
                        <Download className="shrink-0 text-lg text-muted group-hover:text-accent" />
                      </a>
                    </li>
                  ))}
                  {project.externalLinks?.map((link) => (
                    <li key={link.url}>
                      <a
                        href={safeHref(link.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="card group flex items-center gap-4 p-4 transition-shadow hover:shadow-lift"
                      >
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-tint text-lg text-ink">
                          <LinkIcon />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold text-ink">{link.label}</span>
                          {link.description ? <span className="block text-sm text-muted">{link.description}</span> : null}
                        </span>
                        <ArrowUpRight className="shrink-0 text-lg text-muted group-hover:text-accent" />
                        <span className="sr-only">(opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        </div>
      </div>

      {/* Previous / next ------------------------------------------------- */}
      {previous && next ? (
        <nav aria-label="More projects" className="border-t border-line">
          <div className="container-page grid sm:grid-cols-2">
            <AdjacentLink project={previous} direction="previous" />
            <AdjacentLink project={next} direction="next" />
          </div>
        </nav>
      ) : null}

      {/* Related ---------------------------------------------------------- */}
      {related.length > 0 ? (
        <section aria-labelledby="related-title" className="border-t border-line bg-tint py-20" data-reveal>
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="related-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Related projects
              </h2>
              <Link href="/portfolio" className="link-arrow">
                All projects <ArrowRight />
              </Link>
            </div>
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-reveal="stagger">
              {related.map((item) => (
                <li key={item.slug}>
                  <ProjectCard project={item} variant="compact" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* Contact ---------------------------------------------------------- */}
      <section aria-labelledby="project-contact" className="py-20" data-reveal>
        <div className="container-page">
          <div className="card flex flex-col gap-6 p-8 sm:p-10 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <h2 id="project-contact" className="text-2xl font-semibold tracking-tight">
                Questions about this project?
              </h2>
              <p className="mt-2 leading-relaxed text-body">
                I’m happy to talk through the decisions behind it, or how a similar approach could work for your team.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href={`mailto:${profile.email}?subject=${encodeURIComponent(`About: ${project.title}`)}`} className="btn btn-primary">
                <Mail /> Email Afrin
              </a>
              <Link href="/contact" className="btn btn-secondary">
                Contact options
              </Link>
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}

function VideoPlayer({ video, priority = false }: { video: ResolvedVideo; priority?: boolean }) {
  return (
    <YouTubeEmbed
      url={video.youtubeUrl}
      title={video.title}
      posterImage={video.posterImage}
      aspectRatio={video.aspectRatio ?? (video.parsed.ok && video.parsed.isShort ? "9:16" : "16:9")}
      showCaptions={video.showCaptions}
      priority={priority}
    />
  );
}

function Transcript({ markdown, title }: { markdown: string; title: string }) {
  return (
    <details className="group mt-8 rounded-[var(--radius-card)] border border-line bg-surface">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 font-semibold text-ink [&::-webkit-details-marker]:hidden">
        <span>
          Transcript <span className="sr-only">for {title}</span>
        </span>
        <span aria-hidden className="text-sm font-medium text-muted group-open:hidden">
          Show
        </span>
        <span aria-hidden className="hidden text-sm font-medium text-muted group-open:inline">
          Hide
        </span>
      </summary>
      <div className="border-t border-line px-5 py-5">
        <DocumentationRenderer markdown={markdown} className="text-[0.9375rem]" />
      </div>
    </details>
  );
}

function AdjacentLink({ project, direction }: { project: ResolvedProject; direction: "previous" | "next" }) {
  const isNext = direction === "next";
  return (
    <Link
      href={`/portfolio/${project.slug}`}
      className={`group flex flex-col gap-2 py-8 sm:py-10 ${isNext ? "border-t border-line sm:items-end sm:border-l sm:border-t-0 sm:pl-10 sm:text-right" : "sm:pr-10"}`}
    >
      <span className="inline-flex items-center gap-2 text-sm font-medium text-muted">
        {isNext ? null : <ArrowLeft className="transition-transform motion-safe:group-hover:-translate-x-1" />}
        {isNext ? "Next project" : "Previous project"}
        {isNext ? <ArrowRight className="transition-transform motion-safe:group-hover:translate-x-1" /> : null}
      </span>
      <span className="text-lg font-semibold tracking-tight text-ink group-hover:text-accent sm:text-xl">{project.title}</span>
      <span className="text-sm text-muted">{project.category}</span>
    </Link>
  );
}
