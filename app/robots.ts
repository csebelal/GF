import type { MetadataRoute } from "next";
import { getDbProfile } from "@/lib/db/repository";
import { resolveSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const profile = await getDbProfile();
  const siteUrl = await resolveSiteUrl(profile.siteMeta?.url);

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dev/", "/admin/", "/api/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
