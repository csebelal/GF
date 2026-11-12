import type { ResolvedDbProject } from "@/lib/db/repository";

export interface FaqItem {
  question: string;
  answer: string;
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

/** Escapes `<` to prevent script-tag breakout when embedding JSON-LD. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/** Resolves a non-localhost canonical origin for static/SSG JSON-LD schemas. */
export function getCanonicalSiteUrl(configuredUrl?: string): string {
  if (configuredUrl && !/localhost|127\.0\.0\.1/i.test(configuredUrl)) {
    return configuredUrl.trim().replace(/\/+$/, "");
  }
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl && !/localhost|127\.0\.0\.1/i.test(envUrl)) {
    return envUrl.trim().replace(/\/+$/, "");
  }
  return "https://afrinchishti.site";
}

export function buildWebSiteSchema(
  siteUrl: string,
  profile: { name: string; description?: string }
) {
  const cleanUrl = siteUrl.replace(/\/+$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: profile.name,
    url: cleanUrl,
    inLanguage: "en",
    ...(profile.description ? { description: profile.description } : {}),
    author: {
      "@type": "Person",
      name: profile.name,
      url: cleanUrl,
    },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "main p:first-of-type"],
    },
  };
}

export function buildBreadcrumbSchema(siteUrl: string, items: BreadcrumbItem[]) {
  const cleanUrl = siteUrl.replace(/\/+$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.path === "/" ? cleanUrl : `${cleanUrl}${item.path}`,
    })),
  };
}

export function buildCollectionPageSchema(
  siteUrl: string,
  projects: Array<{ title: string; slug: string; summary: string }>
) {
  const cleanUrl = siteUrl.replace(/\/+$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Salesforce & CRM Portfolio",
    url: `${cleanUrl}/portfolio`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: projects.map((project, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `${cleanUrl}/portfolio/${project.slug}`,
        name: project.title,
        description: project.summary,
      })),
    },
  };
}

export function buildTechArticleSchema(
  siteUrl: string,
  project: Pick<
    ResolvedDbProject,
    "title" | "slug" | "summary" | "date" | "category" | "tools" | "coverImage" | "videos"
  >,
  author: { name: string; linkedinUrl?: string }
) {
  const cleanUrl = siteUrl.replace(/\/+$/, "");
  const pageUrl = `${cleanUrl}/portfolio/${project.slug}`;
  const validDate = project.date && !Number.isNaN(new Date(project.date).getTime())
    ? new Date(project.date).toISOString()
    : undefined;

  const videoObjects = (project.videos || []).flatMap((v) => {
    if (!v.parsed?.ok || !v.parsed.id) return [];
    return [
      {
        "@type": "VideoObject",
        name: v.title || project.title,
        description: v.description || project.summary,
        thumbnailUrl: v.posterImage
          ? v.posterImage.startsWith("http")
            ? v.posterImage
            : `${cleanUrl}${v.posterImage}`
          : `https://i.ytimg.com/vi/${v.parsed.id}/hqdefault.jpg`,
        embedUrl: `https://www.youtube-nocookie.com/embed/${v.parsed.id}`,
        ...(validDate ? { uploadDate: validDate } : {}),
      },
    ];
  });

  const imageUrl = project.coverImage?.src
    ? project.coverImage.src.startsWith("http")
      ? project.coverImage.src
      : `${cleanUrl}${project.coverImage.src}`
    : `${pageUrl}/opengraph-image`;

  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: project.title,
    description: project.summary,
    url: pageUrl,
    mainEntityOfPage: pageUrl,
    image: imageUrl,
    articleSection: project.category,
    keywords: (project.tools || []).join(", "),
    ...(validDate ? { datePublished: validDate, dateModified: validDate } : {}),
    author: {
      "@type": "Person",
      name: author.name,
      url: cleanUrl,
      ...(author.linkedinUrl ? { sameAs: [author.linkedinUrl] } : {}),
    },
    ...(videoObjects.length > 0 ? { video: videoObjects } : {}),
  };
}

export function buildFaqSchema(faqs: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
