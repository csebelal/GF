/**
 * Profile and site-wide settings. Source of truth: Afrin's CV
 * (public/cv/Afrin-Akter-Chishti-Salesforce-Administrator-CV.pdf).
 */

export const profile = {
  name: "Afrin Akter Chishti",
  shortName: "Afrin",
  jobTitle: "Salesforce Administrator",
  employer: "Field Nation",
  location: { city: "Dhaka", country: "Bangladesh" },
  email: "chishtiafrin@gmail.com",
  linkedin: {
    url: "https://www.linkedin.com/in/afrin-chishti-2661961b8",
    label: "linkedin.com/in/afrin-chishti-2661961b8",
  },
  portrait: {
    src: "/images/profile/afrin-chishti-portrait.webp",
    fallback: "/images/profile/afrin-chishti-portrait.jpg",
    small: "/images/profile/afrin-chishti-portrait-400.webp",
    avatar: "/images/profile/afrin-chishti-avatar.webp",
    width: 600,
    height: 719,
    alt: "Portrait of Afrin Akter Chishti wearing a navy blazer",
  },
  cv: {
    href: "/cv/Afrin-Akter-Chishti-Salesforce-Administrator-CV.pdf",
    downloadName: "Afrin-Akter-Chishti-Salesforce-Administrator-CV.pdf",
    /** Update when you replace the PDF. */
    sizeLabel: "PDF, 812 KB",
  },
} as const;

export const site = {
  name: "Afrin Akter Chishti",
  /** Used in <title> templates and social cards. */
  titleSuffix: "Afrin Akter Chishti — Salesforce Administrator",
  description:
    "Salesforce Administrator at Field Nation (Dhaka). Sales Cloud & Service Cloud automation, Flow, CRM data quality, HubSpot sync, and analytics.",
  /** Set NEXT_PUBLIC_SITE_URL in production so canonical URLs and the sitemap are correct. */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  locale: "en_US",
} as const;

export const primaryNav = [
  { href: "/", label: "Home" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/expertise", label: "Expertise" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export const homeSettings = {
  /** Slugs for the featured row on the home page. Empty = use projects marked `featured`. */
  featuredProjectSlugs: [] as string[],
  /** Project (and video index) used for the large walkthrough section on the home page. */
  featuredWalkthrough: { slug: "lead-routing-flow", videoIndex: 0 },
};
