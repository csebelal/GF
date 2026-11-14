import { connectDB } from "./connection";
import { SiteProfileModel, type ISiteProfile } from "./models/SiteProfile";
import { ProjectModel } from "./models/Project";
import { ExperienceModel, type IExperienceData } from "./models/Experience";
import { ExpertiseModel, type IExpertiseData } from "./models/Expertise";

import { profile as staticProfile, site as staticSite, homeSettings as staticHomeSettings } from "@/content/site";
import {
  employers as staticEmployers,
  certifications as staticCertifications,
  courseCertificates as staticCourseCertificates,
  awards as staticAwards,
  education as staticEducation,
  volunteering as staticVolunteering,
  languages as staticLanguages,
  toolsInPractice as staticToolsInPractice,
} from "@/content/experience";
import { expertiseAreas as staticExpertiseAreas, workingApproach as staticWorkingApproach } from "@/content/expertise";
import { extractHeadings, loadDoc, docExists, readDoc, type LoadedDoc } from "@/lib/markdown";
import type { Project, ContentType } from "@/lib/types";
import { getContentType } from "@/lib/project-utils";
import { parseYouTubeUrl, type YouTubeParseResult } from "@/lib/youtube";

export interface ResolvedDbVideo {
  title: string;
  youtubeUrl: string;
  description?: string;
  posterImage?: string;
  aspectRatio?: "16:9" | "9:16";
  documentation?: string;
  documentationContent?: string;
  transcript?: string;
  transcriptContent?: string;
  showCaptions?: boolean;
  parsed: YouTubeParseResult;
}

export interface ResolvedDbProject extends Omit<Project, "videos"> {
  _id?: string;
  contentType: ContentType;
  isSample: boolean;
  documentationContent?: string;
  videos: ResolvedDbVideo[];
}

export type ResolvedProject = ResolvedDbProject;
export type ResolvedVideo = ResolvedDbVideo;

export function toDbCardData(project: ResolvedDbProject) {
  const firstVideo = project.videos?.[0];
  let cover:
    | { kind: "image"; src: string; alt: string }
    | { kind: "youtube"; id: string; alt: string; poster?: string }
    | { kind: "none" } = { kind: "none" };

  if (project.coverImage?.src) {
    cover = { kind: "image", src: project.coverImage.src, alt: project.coverImage.alt || project.title };
  } else if (firstVideo?.parsed?.ok) {
    cover = {
      kind: "youtube",
      id: firstVideo.parsed.id,
      alt: firstVideo.title || project.title,
      poster: firstVideo.posterImage,
    };
  }

  return {
    slug: project.slug,
    title: project.title,
    summary: project.summary,
    category: project.category,
    tools: project.tools || [],
    featured: Boolean(project.featured),
    provenance: project.provenance,
    isSample: project.isSample,
    contentType: project.contentType,
    cover,
    videoCount: project.videos?.length || 0,
  };
}

// Global per-entity cache + in-flight coalescing shared across Next.js route workers
interface CacheSlot<T> {
  value: T;
  expiresAt: number;
}

interface RepoCacheStore {
  projectsCache: CacheSlot<ResolvedDbProject[]> | null;
  profileCache: CacheSlot<ISiteProfile> | null;
  experienceCache: CacheSlot<IExperienceData> | null;
  expertiseCache: CacheSlot<IExpertiseData> | null;
  inflightProjects: Promise<ResolvedDbProject[]> | null;
  inflightProfile: Promise<ISiteProfile> | null;
  inflightExperience: Promise<IExperienceData> | null;
  inflightExpertise: Promise<IExpertiseData> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var __afrinRepoCache: RepoCacheStore | undefined;
}

const CACHE_TTL_MS = 60_000;
const FALLBACK_TTL_MS = 15_000;

const repoStore: RepoCacheStore =
  globalThis.__afrinRepoCache || {
    projectsCache: null,
    profileCache: null,
    experienceCache: null,
    expertiseCache: null,
    inflightProjects: null,
    inflightProfile: null,
    inflightExperience: null,
    inflightExpertise: null,
  };

if (!globalThis.__afrinRepoCache) {
  globalThis.__afrinRepoCache = repoStore;
}

export function invalidateRepositoryCache() {
  repoStore.projectsCache = null;
  repoStore.profileCache = null;
  repoStore.experienceCache = null;
  repoStore.expertiseCache = null;
  repoStore.inflightProjects = null;
  repoStore.inflightProfile = null;
  repoStore.inflightExperience = null;
  repoStore.inflightExpertise = null;
}

export interface CacheSlotDiagnostic {
  status: "fresh" | "stale" | "empty";
  expiresInSeconds: number;
  inflight: boolean;
}

export interface RepositoryCacheDiagnostics {
  ttlSeconds: number;
  fallbackTtlSeconds: number;
  slots: {
    projects: CacheSlotDiagnostic;
    profile: CacheSlotDiagnostic;
    experience: CacheSlotDiagnostic;
    expertise: CacheSlotDiagnostic;
  };
}

function inspectCacheSlot<T>(
  slot: CacheSlot<T> | null,
  inflight: Promise<T> | null,
  now: number
): CacheSlotDiagnostic {
  if (!slot) {
    return { status: "empty", expiresInSeconds: 0, inflight: Boolean(inflight) };
  }
  const remainingMs = slot.expiresAt - now;
  return {
    status: remainingMs > 0 ? "fresh" : "stale",
    expiresInSeconds: Math.max(0, Math.ceil(remainingMs / 1000)),
    inflight: Boolean(inflight),
  };
}

export function getRepositoryCacheDiagnostics(): RepositoryCacheDiagnostics {
  const now = Date.now();
  return {
    ttlSeconds: Math.round(CACHE_TTL_MS / 1000),
    fallbackTtlSeconds: Math.round(FALLBACK_TTL_MS / 1000),
    slots: {
      projects: inspectCacheSlot(repoStore.projectsCache, repoStore.inflightProjects, now),
      profile: inspectCacheSlot(repoStore.profileCache, repoStore.inflightProfile, now),
      experience: inspectCacheSlot(repoStore.experienceCache, repoStore.inflightExperience, now),
      expertise: inspectCacheSlot(repoStore.expertiseCache, repoStore.inflightExpertise, now),
    },
  };
}

function toPlain<T>(value: T): T {
  if (value === null || value === undefined || typeof value !== "object") {
    return value;
  }
  if (value instanceof Date) {
    return value.toISOString() as unknown as T;
  }
  if (Array.isArray(value)) {
    const len = value.length;
    const arr = new Array(len);
    for (let i = 0; i < len; i++) {
      arr[i] = toPlain(value[i]);
    }
    return arr as unknown as T;
  }
  const obj = value as Record<string, unknown>;
  if (obj._bsontype === "ObjectId" || typeof obj.toHexString === "function") {
    return String(value) as unknown as T;
  }
  const out: Record<string, unknown> = {};
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
    if (key === "__v") continue;
    const v = obj[key];
    if (v === undefined) continue;
    out[key] = key === "_id" && v && typeof v === "object" ? String(v) : toPlain(v);
  }
  return out as T;
}

function projectFromDb(rawDoc: any): ResolvedDbProject {
  const doc = toPlain(rawDoc);
  const rawVideos = doc.videos || [];
  const videos: ResolvedDbVideo[] = rawVideos.map((v: any) => ({
    title: v.title || "Video",
    youtubeUrl: v.youtubeUrl || "",
    description: v.description,
    posterImage: v.posterImage,
    aspectRatio: v.aspectRatio || "16:9",
    documentation: v.documentation,
    documentationContent: v.documentationContent,
    transcript: v.transcript,
    transcriptContent: v.transcriptContent,
    showCaptions: v.showCaptions,
    parsed: parseYouTubeUrl(v.youtubeUrl || ""),
  }));

  const mockProject: Project = {
    slug: doc.slug,
    title: doc.title,
    summary: doc.summary,
    category: doc.category,
    tools: doc.tools || [],
    featured: Boolean(doc.featured),
    status: doc.status || "published",
    provenance: doc.provenance || "independent",
    role: doc.role,
    date: doc.date,
    coverImage: doc.coverImage,
    overview: doc.overview,
    videos: videos as any,
    documentation: doc.documentationContent ? "db-docs" : doc.documentation,
  };

  const contentType = getContentType(mockProject);

  return {
    slug: doc.slug,
    title: doc.title,
    summary: doc.summary,
    category: doc.category,
    tools: doc.tools || [],
    featured: Boolean(doc.featured),
    status: doc.status || "published",
    provenance: doc.provenance || "independent",
    role: doc.role,
    date: doc.date,
    coverImage: doc.coverImage,
    overview: doc.overview,
    videos,
    documentation: doc.documentation,
    documentationContent: doc.documentationContent,
    screenshots: doc.screenshots || [],
    attachments: doc.attachments || [],
    externalLinks: doc.externalLinks || [],
    _id: doc._id?.toString(),
    contentType,
    isSample: doc.provenance === "illustrative",
  };
}

export async function getDbProjects(): Promise<ResolvedDbProject[]> {
  const now = Date.now();
  if (repoStore.projectsCache && now < repoStore.projectsCache.expiresAt) {
    return repoStore.projectsCache.value;
  }
  if (repoStore.inflightProjects) {
    return repoStore.inflightProjects;
  }

  const promise = (async () => {
    let dbFailed = false;
    try {
      await connectDB();
      const docs = await ProjectModel.find({}).sort({ sortOrder: 1, createdAt: -1 }).lean();
      if (docs && docs.length > 0) {
        const resolved = docs.map(projectFromDb);
        repoStore.projectsCache = { value: resolved, expiresAt: Date.now() + CACHE_TTL_MS };
        return resolved;
      }
    } catch (err) {
      dbFailed = true;
      console.warn("MongoDB fetch failed, falling back to static:", err);
    }

    // Fallback to static projects if DB empty or unavailable
    const { projectSources } = await import("@/content/projects");
    const fallback = projectSources.map(({ project, isSample }) => {
      const rawVideos = project.videos || [];
      const videos: ResolvedDbVideo[] = rawVideos.map((v) => ({
        ...v,
        parsed: parseYouTubeUrl(v.youtubeUrl || ""),
      }));

      const contentType = getContentType(project);

      return {
        ...project,
        tools: project.tools || [],
        contentType,
        isSample,
        videos,
      };
    });
    repoStore.projectsCache = {
      value: fallback,
      expiresAt: Date.now() + (dbFailed ? FALLBACK_TTL_MS : CACHE_TTL_MS),
    };
    return fallback;
  })().finally(() => {
    repoStore.inflightProjects = null;
  });

  repoStore.inflightProjects = promise;
  return promise;
}

export async function getPublishedDbProjects(): Promise<ResolvedDbProject[]> {
  const all = await getDbProjects();
  return all.filter((p) => p.status === "published");
}

export async function getDbProjectBySlug(slug: string): Promise<ResolvedDbProject | undefined> {
  const all = await getDbProjects();
  return all.find((p) => p.slug === slug);
}

export async function reorderDbProjects(slugs: string[]): Promise<void> {
  await connectDB();
  const operations = slugs.map((slug, index) => ({
    updateOne: {
      filter: { slug },
      update: { $set: { sortOrder: index } },
    },
  }));
  if (operations.length > 0) {
    await ProjectModel.bulkWrite(operations);
  }
  invalidateRepositoryCache();
}

export async function getDbFeaturedProjects(limit = 3): Promise<ResolvedDbProject[]> {
  const published = await getPublishedDbProjects();
  const profile = await getDbProfile();
  const configured = profile.homeSettings?.featuredProjectSlugs || [];

  if (configured.length > 0) {
    const list = configured.map((slug) => published.find((p) => p.slug === slug)).filter(Boolean) as ResolvedDbProject[];
    if (list.length > 0) return list.slice(0, limit);
  }

  const explicit = published.filter((p) => p.featured);
  if (explicit.length >= limit) return explicit.slice(0, limit);

  const remaining = published.filter((p) => !p.featured);
  return [...explicit, ...remaining].slice(0, limit);
}

const defaultHero = {
  badgeDot: true,
  badgeText: "Salesforce Administrator at Field Nation",
  headlineMain: "Salesforce that sales, marketing and support teams",
  headlineMuted: "can rely on.",
  description:
    "I’m Afrin Akter Chishti. I look after Sales Cloud and Service Cloud at Field Nation — the automation, access rules, data standards and connected tools like HubSpot, Gong and 6sense that go-to-market teams work from.",
  primaryButtonText: "Explore portfolio",
  primaryButtonUrl: "/portfolio",
  showCvButton: true,
  highlights: [
    { icon: "location" as const, text: "Dhaka, Bangladesh" },
    { icon: "award" as const, text: "Certified 6sense Administrator" },
    { icon: "check" as const, text: "Working in Salesforce since 2022" },
  ],
  languagesCard: {
    show: true,
    label: "Languages",
    text: "Bangla · English · Hindi",
  },
  careerStepCard: {
    show: true,
    label: "Career step",
    text: "Promoted to Salesforce Administrator, January 2025",
  },
  techStack: {
    label: "Works across",
    items: [
      "Sales Cloud",
      "Service Cloud",
      "Flow",
      "Data Loader",
      "HubSpot",
      "Gong",
      "6sense",
      "Tableau",
      "Agentforce",
    ],
  },
};

const defaultHomeIntro = {
  eyebrow: "How I got here",
  headline: "From the support desk to the admin console.",
  stats: [
    { label: "Joined Field Nation", value: "2022" },
    { label: "Promoted", value: "2025" },
    { label: "Languages", value: "3" },
  ],
  paragraphs: [
    "My career started on the customer side of the system. At Chaldal.com I resolved complaints, processed account adjustments and kept customer records accurate. At Sheba Platform I designed quality standards and trained the people who applied them. At Biztech Solutions I managed a customer service team — hiring, coaching and reporting on service performance to management.",
    "In April 2022 I joined Field Nation as a Junior Salesforce Administrator. The work felt like a natural next step: access requests, Flow debugging, bulk data operations and sync issues between Salesforce and the tools around it. In January 2025 I was promoted to Salesforce Administrator, and I now own the org’s day-to-day administration, automation and release process.",
    "That background still shapes how I build. I start from the person who will use the screen, document every change for the people it affects, and keep a log of recurring questions so they can be fixed at the source.",
  ],
};

const defaultHeaderSettings = {
  showAvatar: true,
  brandTitle: "",
  brandSubtitle: "",
  navItems: [
    { label: "Home", href: "/" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Expertise", href: "/expertise" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  highlightLink: {
    show: true,
    label: "Experience",
    href: "/experience",
  },
  showCvButton: true,
  cvButtonLabel: "Download CV",
  mobileEmailButtonLabel: "Email Afrin",
};

const defaultFooterSettings = {
  bioSummary:
    "Salesforce Administrator at Field Nation. Automation, CRM data quality, access management and the connected tools around Sales Cloud and Service Cloud.",
  showEmailButton: true,
  emailButtonLabel: "",
  showCvButton: true,
  cvButtonLabel: "Download CV",
  pageLinksTitle: "Pages",
  pageLinks: [
    { label: "Home", href: "/" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Expertise", href: "/expertise" },
    { label: "Experience", href: "/experience" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  connectTitle: "Connect",
  showLocation: true,
  locationLabel: "",
  socialLinks: [
    { platform: "email", label: "Email", url: "mailto:chishtiafrin@gmail.com", show: true },
    {
      platform: "linkedin",
      label: "LinkedIn",
      url: "https://www.linkedin.com/in/afrin-chishti-2661961b8",
      show: true,
    },
  ],
  copyrightText: "© {year} {name}",
  showBottomNotice: true,
  bottomNotice: "Projects marked “Sample” are placeholder content that shows how the portfolio works.",
};

const defaultContactSettings = {
  eyebrow: "Contact",
  headline: "Let’s talk about your Salesforce team.",
  intro:
    "I’m glad to hear from recruiters and hiring managers about Salesforce administration and CRM operations roles, and from anyone interested in product work where CRM data and AI meet.",
  helpfulHeading: "Helpful to include",
  helpful: [
    "The role or project, and the team it supports",
    "Which Salesforce clouds and connected tools are involved",
    "Your timeline and preferred way to talk",
  ],
  emailCard: {
    badge: "Email",
    customEmail: "",
    writeButtonText: "Write an email",
    showWriteButton: true,
    copyButtonText: "Copy address",
    showCopyButton: true,
  },
  linkedinCard: {
    show: true,
    label: "LinkedIn",
    displayText: "Connect on LinkedIn",
    customText: "",
    customUrl: "",
  },
  locationCard: {
    show: true,
    label: "Location",
    customText: "",
  },
  cvCard: {
    show: true,
    label: "CV",
    subtext: "Curriculum Vitae",
    customSizeLabel: "",
    buttonLabel: "Download CV",
  },
  bottomBanner: {
    show: true,
    boldPrefix: "Not sure yet?",
    text: "The portfolio and experience pages show how I work and what I’ve done.",
    primaryButton: {
      show: true,
      label: "Portfolio",
      url: "/portfolio",
    },
    secondaryButton: {
      show: true,
      label: "Experience",
      url: "/experience",
    },
  },
};

export async function getDbProfile(): Promise<ISiteProfile> {
  const now = Date.now();
  if (repoStore.profileCache && now < repoStore.profileCache.expiresAt) {
    return repoStore.profileCache.value;
  }
  if (repoStore.inflightProfile) {
    return repoStore.inflightProfile;
  }

  const promise = (async () => {
    let dbFailed = false;
    try {
      await connectDB();
      const rawDoc = await SiteProfileModel.findOne({}).lean();
      if (rawDoc) {
        const doc = toPlain(rawDoc) as any;
        const cleanProfile: ISiteProfile = {
        name: doc.name || staticProfile.name,
        shortName: doc.shortName || staticProfile.shortName,
        jobTitle: doc.jobTitle || staticProfile.jobTitle,
        employer: doc.employer || staticProfile.employer,
        location: {
          city: doc.location?.city || staticProfile.location.city,
          country: doc.location?.country || staticProfile.location.country,
        },
        email: doc.email || staticProfile.email,
        linkedin: {
          url: doc.linkedin?.url || staticProfile.linkedin.url,
          label: doc.linkedin?.label || staticProfile.linkedin.label,
        },
        portrait: {
          src: doc.portrait?.src || staticProfile.portrait.src,
          fallback: doc.portrait?.fallback || staticProfile.portrait.fallback,
          small: doc.portrait?.small || staticProfile.portrait.small,
          avatar: doc.portrait?.avatar || staticProfile.portrait.avatar,
          width: doc.portrait?.width || 600,
          height: doc.portrait?.height || 719,
          alt: doc.portrait?.alt || staticProfile.portrait.alt,
        },
        cv: {
          href: doc.cv?.href || staticProfile.cv.href,
          downloadName: doc.cv?.downloadName || staticProfile.cv.downloadName,
          sizeLabel: doc.cv?.sizeLabel || staticProfile.cv.sizeLabel,
        },
        siteMeta: {
          titleSuffix: doc.siteMeta?.titleSuffix || staticSite.titleSuffix,
          description: doc.siteMeta?.description || staticSite.description,
          url: doc.siteMeta?.url || staticSite.url,
          googleAnalyticsId: doc.siteMeta?.googleAnalyticsId || "",
        },
        homeSettings: {
          featuredProjectSlugs: doc.homeSettings?.featuredProjectSlugs || [...staticHomeSettings.featuredProjectSlugs],
          featuredWalkthrough: doc.homeSettings?.featuredWalkthrough || { ...staticHomeSettings.featuredWalkthrough },
        },
        hero: {
          ...defaultHero,
          ...(doc.hero || {}),
          languagesCard: { ...defaultHero.languagesCard, ...(doc.hero?.languagesCard || {}) },
          careerStepCard: { ...defaultHero.careerStepCard, ...(doc.hero?.careerStepCard || {}) },
          techStack: {
            ...defaultHero.techStack,
            ...(doc.hero?.techStack || {}),
            items: doc.hero?.techStack?.items || defaultHero.techStack.items,
          },
          highlights: (doc.hero?.highlights && doc.hero.highlights.length > 0 ? doc.hero.highlights : defaultHero.highlights).map((h: any) => ({
            icon: h.icon,
            text: h.text,
          })),
        },
        homeIntro: {
          ...defaultHomeIntro,
          ...(doc.homeIntro || {}),
          stats: (doc.homeIntro?.stats && doc.homeIntro.stats.length > 0 ? doc.homeIntro.stats : defaultHomeIntro.stats).map((s: any) => ({
            label: s.label,
            value: s.value,
          })),
          paragraphs: doc.homeIntro?.paragraphs && doc.homeIntro.paragraphs.length > 0 ? doc.homeIntro.paragraphs : defaultHomeIntro.paragraphs,
        },
        aboutStory: {
          introHeadline: doc.aboutStory?.introHeadline,
          introParagraph: doc.aboutStory?.introParagraph,
          chapters: (doc.aboutStory?.chapters || []).map((c: any) => ({
            id: c.id,
            label: c.label,
            title: c.title,
            body: Array.isArray(c.body) ? c.body : [c.body].filter(Boolean),
          })),
          principles: (doc.aboutStory?.principles || []).map((p: any) => ({
            title: p.title,
            body: p.body,
          })),
        },
        contactSettings: {
          ...defaultContactSettings,
          ...(doc.contactSettings || {}),
          helpful: doc.contactSettings?.helpful?.length ? doc.contactSettings.helpful : defaultContactSettings.helpful,
          emailCard: {
            ...defaultContactSettings.emailCard,
            ...(doc.contactSettings?.emailCard || {}),
            badge:
              doc.contactSettings?.emailCard?.badge &&
              doc.contactSettings.emailCard.badge !== "Email · quickest reply"
                ? doc.contactSettings.emailCard.badge
                : defaultContactSettings.emailCard.badge,
          },
          linkedinCard: {
            ...defaultContactSettings.linkedinCard,
            ...(doc.contactSettings?.linkedinCard || {}),
            displayText:
              doc.contactSettings?.linkedinCard?.displayText ||
              (doc.contactSettings?.linkedinCard?.customText &&
              !doc.contactSettings.linkedinCard.customText.includes("linkedin.com")
                ? doc.contactSettings.linkedinCard.customText
                : defaultContactSettings.linkedinCard.displayText),
          },
          locationCard: {
            ...defaultContactSettings.locationCard,
            ...(doc.contactSettings?.locationCard || {}),
          },
          cvCard: {
            ...defaultContactSettings.cvCard,
            ...(doc.contactSettings?.cvCard || {}),
            subtext:
              doc.contactSettings?.cvCard?.subtext !== undefined
                ? doc.contactSettings.cvCard.subtext
                : defaultContactSettings.cvCard.subtext,
          },
          bottomBanner: {
            ...defaultContactSettings.bottomBanner,
            ...(doc.contactSettings?.bottomBanner || {}),
            primaryButton: {
              ...defaultContactSettings.bottomBanner.primaryButton,
              ...(doc.contactSettings?.bottomBanner?.primaryButton || {}),
            },
            secondaryButton: {
              ...defaultContactSettings.bottomBanner.secondaryButton,
              ...(doc.contactSettings?.bottomBanner?.secondaryButton || {}),
            },
          },
        },
        headerSettings: {
          ...defaultHeaderSettings,
          ...(doc.headerSettings || {}),
          navItems: doc.headerSettings?.navItems?.length
            ? doc.headerSettings.navItems.map((item: any) => ({ label: item.label, href: item.href }))
            : defaultHeaderSettings.navItems,
          highlightLink: {
            ...defaultHeaderSettings.highlightLink,
            ...(doc.headerSettings?.highlightLink || {}),
          },
        },
        footerSettings: {
          ...defaultFooterSettings,
          ...(doc.footerSettings || {}),
          pageLinks: doc.footerSettings?.pageLinks?.length
            ? doc.footerSettings.pageLinks.map((item: any) => ({ label: item.label, href: item.href }))
            : defaultFooterSettings.pageLinks,
          socialLinks: doc.footerSettings?.socialLinks?.length
            ? doc.footerSettings.socialLinks.map((item: any) => ({
                platform: item.platform || "custom",
                label: item.label || "",
                url: item.url || "",
                show: item.show !== false,
              }))
            : defaultFooterSettings.socialLinks,
        },
        };
        repoStore.profileCache = { value: cleanProfile, expiresAt: Date.now() + CACHE_TTL_MS };
        return cleanProfile;
      }
    } catch (err) {
      dbFailed = true;
      console.warn("MongoDB profile fetch failed, falling back to static:", err);
    }

    // Fallback
    const fallbackProfile: ISiteProfile = {
    name: staticProfile.name,
    shortName: staticProfile.shortName,
    jobTitle: staticProfile.jobTitle,
    employer: staticProfile.employer,
    location: { ...staticProfile.location },
    email: staticProfile.email,
    linkedin: { ...staticProfile.linkedin },
    portrait: { ...staticProfile.portrait },
    cv: { ...staticProfile.cv },
    siteMeta: {
      titleSuffix: staticSite.titleSuffix,
      description: staticSite.description,
      url: staticSite.url,
      googleAnalyticsId: "",
    },
    homeSettings: {
      featuredProjectSlugs: [...staticHomeSettings.featuredProjectSlugs],
      featuredWalkthrough: { ...staticHomeSettings.featuredWalkthrough },
    },
    hero: defaultHero,
    homeIntro: defaultHomeIntro,
    headerSettings: defaultHeaderSettings,
    footerSettings: defaultFooterSettings,
    aboutStory: {
      introHeadline:
        "I came to Salesforce from the support desk, and I still build for the person filing the ticket.",
      introParagraph:
        "I’m a Salesforce Administrator at Field Nation, based in Dhaka, Bangladesh. Before Salesforce I worked in customer service, quality assurance and team training — experience that still shapes how I gather requirements, test changes and help people adopt them.",
      chapters: [
        {
          id: "beginnings",
          label: "Where I started",
          title: "Learning what a system feels like from the other side",
          body: [
            "I started my career on the frontline: handling customer accounts at Chaldal.com, moving into QA and training at Sheba Platform, and leading customer service at Biztech Solutions.",
            "Those years taught me that behind every data entry error or missing picklist value is a person trying to finish their workday. That user empathy became my foundation when I moved into Salesforce administration.",
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
      ],
      principles: [
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
      ],
    },
    contactSettings: defaultContactSettings,
  };
  repoStore.profileCache = {
    value: fallbackProfile,
    expiresAt: Date.now() + (dbFailed ? FALLBACK_TTL_MS : CACHE_TTL_MS),
  };
  return fallbackProfile;
  })().finally(() => {
    repoStore.inflightProfile = null;
  });

  repoStore.inflightProfile = promise;
  return promise;
}

export async function getDbExperience(): Promise<IExperienceData> {
  const now = Date.now();
  if (repoStore.experienceCache && now < repoStore.experienceCache.expiresAt) {
    return repoStore.experienceCache.value;
  }
  if (repoStore.inflightExperience) {
    return repoStore.inflightExperience;
  }

  const promise = (async () => {
    let dbFailed = false;
    try {
      await connectDB();
      const doc = await ExperienceModel.findOne({}).lean();
      if (doc) {
        const plain = toPlain(doc) as any;
        const resolved: IExperienceData = {
        employers: (plain.employers || []).map((emp: any) => ({
          company: emp.company,
          promotion: emp.promotion ? { date: emp.promotion.date, label: emp.promotion.label } : undefined,
          roles: (emp.roles || []).map((r: any) => ({
            title: r.title,
            start: r.start,
            end: r.end,
            responsibilities: (r.responsibilities || []).map((resp: any) => ({
              theme: resp.theme,
              text: resp.text,
            })),
          })),
        })),
        certifications: (plain.certifications || []).map((c: any) => ({
          name: c.name,
          issuer: c.issuer,
          kind: c.kind,
        })),
        courseCertificates: (plain.courseCertificates || []).map((c: any) => ({
          name: c.name,
          issuer: c.issuer,
          kind: c.kind,
        })),
        awards: (plain.awards || []).map((a: any) => ({
          name: a.name,
          issuer: a.issuer,
        })),
        education: (plain.education || []).map((e: any) => ({
          qualification: e.qualification,
          institution: e.institution,
          year: e.year,
        })),
        volunteering: (plain.volunteering || []).map((v: any) => ({
          title: v.title,
          role: v.role,
          organization: v.organization,
          start: v.start,
          end: v.end,
          description: v.description,
        })),
        languages: (plain.languages || []).map((l: any) => ({
          name: l.name,
          level: l.level,
          note: l.note,
        })),
        toolsInPractice: (plain.toolsInPractice || []).map((t: any) => ({
          name: t.name,
          use: t.use,
        })),
      };
        repoStore.experienceCache = { value: resolved, expiresAt: Date.now() + CACHE_TTL_MS };
        return resolved;
      }
    } catch (err) {
      dbFailed = true;
      console.warn("MongoDB experience fetch failed, falling back to static:", err);
    }

    const fallbackExp: IExperienceData = {
      employers: staticEmployers as any,
      certifications: staticCertifications as any,
      courseCertificates: staticCourseCertificates as any,
      awards: staticAwards as any,
      education: staticEducation as any,
      volunteering: staticVolunteering as any,
      languages: staticLanguages as any,
      toolsInPractice: staticToolsInPractice as any,
    };
    repoStore.experienceCache = {
      value: fallbackExp,
      expiresAt: Date.now() + (dbFailed ? FALLBACK_TTL_MS : CACHE_TTL_MS),
    };
    return fallbackExp;
  })().finally(() => {
    repoStore.inflightExperience = null;
  });

  repoStore.inflightExperience = promise;
  return promise;
}

export async function getDbExpertise(): Promise<IExpertiseData> {
  const now = Date.now();
  if (repoStore.expertiseCache && now < repoStore.expertiseCache.expiresAt) {
    return repoStore.expertiseCache.value;
  }
  if (repoStore.inflightExpertise) {
    return repoStore.inflightExpertise;
  }

  const promise = (async () => {
    let dbFailed = false;
    try {
      await connectDB();
      const doc = await ExpertiseModel.findOne({}).lean();
      if (doc) {
        const plain = toPlain(doc) as any;
        const resolved: IExpertiseData = {
        areas: (plain.areas || []).map((a: any) => ({
          id: a.id,
          title: a.title,
          shortTitle: a.shortTitle,
          icon: a.icon,
          problem: a.problem,
          practices: a.practices || [],
          tools: a.tools || [],
          match: {
            categories: a.match?.categories || [],
            tools: a.match?.tools || [],
          },
          onHome: Boolean(a.onHome),
        })),
        workingApproach: (plain.workingApproach || []).map((w: any) => ({
          title: w.title,
          body: w.body,
          detail: w.detail,
        })),
      };
        repoStore.expertiseCache = { value: resolved, expiresAt: Date.now() + CACHE_TTL_MS };
        return resolved;
      }
    } catch (err) {
      dbFailed = true;
      console.warn("MongoDB expertise fetch failed, falling back to static:", err);
    }

    const fallbackExpertise: IExpertiseData = {
      areas: staticExpertiseAreas as any,
      workingApproach: staticWorkingApproach as any,
    };
    repoStore.expertiseCache = {
      value: fallbackExpertise,
      expiresAt: Date.now() + (dbFailed ? FALLBACK_TTL_MS : CACHE_TTL_MS),
    };
    return fallbackExpertise;
  })().finally(() => {
    repoStore.inflightExpertise = null;
  });

  repoStore.inflightExpertise = promise;
  return promise;
}

export function getDbProjectDocs(project: ResolvedDbProject): {
  article?: LoadedDoc;
  videoDocs: (LoadedDoc | undefined)[];
  transcripts: (string | undefined)[];
} {
  let article: LoadedDoc | undefined;

  if (project.documentationContent) {
    article = {
      path: project.documentation || `${project.slug}.md`,
      markdown: project.documentationContent,
      headings: extractHeadings(project.documentationContent, "doc-"),
      idPrefix: "doc-",
    };
  } else if (project.documentation && docExists(project.documentation)) {
    article = loadDoc(project.documentation, "doc-");
  }

  const videoDocs = (project.videos || []).map((video, index) => {
    const idPrefix = `v${index + 1}-`;
    if (video.documentationContent) {
      return {
        path: video.documentation || `video-${index + 1}.md`,
        markdown: video.documentationContent,
        headings: extractHeadings(video.documentationContent, idPrefix),
        idPrefix,
      };
    }
    if (video.documentation && docExists(video.documentation)) {
      return loadDoc(video.documentation, idPrefix);
    }
    return undefined;
  });

  const transcripts = (project.videos || []).map((video) => {
    if (video.transcriptContent) return video.transcriptContent;
    if (video.transcript && docExists(video.transcript)) return readDoc(video.transcript);
    return undefined;
  });

  return { article, videoDocs, transcripts };
}
