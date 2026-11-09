import type { MetadataRoute } from "next";
import { site as staticSite } from "@/content/site";
import { getPublishedDbProjects, getDbProfile } from "@/lib/db/repository";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [profile, projects] = await Promise.all([getDbProfile(), getPublishedDbProjects()]);
  const siteUrl = (profile.siteMeta?.url || staticSite.url).replace(/\/$/, "");

  const staticRoutes = ["", "/portfolio", "/expertise", "/experience", "/about", "/contact"].map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const projectRoutes = projects.map((project) => ({
    url: `${siteUrl}/portfolio/${project.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...projectRoutes];
}
