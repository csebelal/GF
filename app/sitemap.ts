import type { MetadataRoute } from "next";
import { getPublishedDbProjects, getDbProfile } from "@/lib/db/repository";
import { resolveSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

function resolveLastModified(dateInput?: string): Date {
  if (dateInput) {
    const parsed = new Date(dateInput);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return new Date();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [profile, projects] = await Promise.all([getDbProfile(), getPublishedDbProjects()]);
  const siteUrl = await resolveSiteUrl(profile.siteMeta?.url);
  const now = new Date();

  const staticRoutes = ["", "/portfolio", "/expertise", "/experience", "/about", "/contact"].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const projectRoutes = projects.map((project) => ({
    url: `${siteUrl}/portfolio/${project.slug}`,
    lastModified: resolveLastModified(project.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...projectRoutes];
}
