import type { Metadata } from "next";
import { site } from "@/content/site";

interface PageMetadataInput {
  title: string;
  description: string;
  path: string;
  /** Absolute or root-relative image; defaults to the route's opengraph-image. */
  image?: string;
  type?: "website" | "article" | "profile";
}

/** Page-specific title, description, canonical URL and social metadata. */
export function pageMetadata({ title, description, path, image, type = "website" }: PageMetadataInput): Metadata {
  const resolvedImage = image || "/opengraph-image";
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} · ${site.name}`,
      description,
      url: path,
      siteName: site.name,
      type,
      images: [{ url: resolvedImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · ${site.name}`,
      description,
      images: [resolvedImage],
    },
  };
}
