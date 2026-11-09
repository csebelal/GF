import type { MetadataRoute } from "next";
import { site as staticSite } from "@/content/site";
import { getDbProfile } from "@/lib/db/repository";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const profile = await getDbProfile();
  const siteUrl = (profile.siteMeta?.url || staticSite.url).replace(/\/$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dev/", "/admin/", "/api/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
