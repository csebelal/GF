import { headers } from "next/headers";
import { site as staticSite } from "@/content/site";

function isLocalhostUrl(value?: string): boolean {
  if (!value) return true;
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(value.trim());
}

function normalizeOrigin(value: string): string {
  return value.trim().replace(/\/+$/, "");
}

/**
 * Resolves the canonical public site origin for sitemap.xml and robots.txt.
 * Prefers a non-localhost CMS/env URL, then the incoming request host headers,
 * and finally falls back to the static site configuration.
 */
export async function resolveSiteUrl(configuredUrl?: string): Promise<string> {
  if (configuredUrl && !isLocalhostUrl(configuredUrl)) {
    return normalizeOrigin(configuredUrl);
  }

  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl && !isLocalhostUrl(envUrl)) {
    return normalizeOrigin(envUrl);
  }

  try {
    const reqHeaders = await headers();
    const rawHost = reqHeaders.get("x-forwarded-host") || reqHeaders.get("host");
    if (rawHost) {
      const host = rawHost.split(",")[0].trim();
      const rawProto = reqHeaders.get("x-forwarded-proto");
      const proto = rawProto
        ? rawProto.split(",")[0].trim()
        : host.startsWith("localhost") || host.startsWith("127.0.0.1")
          ? "http"
          : "https";
      return `${proto}://${host}`;
    }
  } catch {
    // No active Next.js request scope (e.g., unit tests)
  }

  return normalizeOrigin(configuredUrl || staticSite.url);
}
