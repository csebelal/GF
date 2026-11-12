import crypto from "node:crypto";

export type DeviceType = "desktop" | "mobile" | "tablet";
export type AnalyticsRange = "7d" | "30d" | "90d";

const BOT_UA_REGEX =
  /bot|crawler|spider|slurp|bingpreview|lighthouse|pagespeed|headlesschrome|phantomjs|pingdom|uptime|curl|wget|python-requests|go-http-client|axios|node-fetch/i;

const TABLET_UA_REGEX = /ipad|tablet|playbook|silk|(android(?!.*mobile))/i;
const MOBILE_UA_REGEX = /mobile|iphone|ipod|android.*mobile|blackberry|opera mini|iemobile|wpdesktop/i;

/**
 * Normalize a public pathname for analytics aggregation.
 * Returns null for admin, API, internal Next.js routes, or invalid paths.
 */
export function normalizeTrackPath(rawPath: unknown): string | null {
  if (typeof rawPath !== "string") return null;
  const trimmed = rawPath.trim();
  if (!trimmed.startsWith("/")) return null;

  const withoutQuery = trimmed.split("?")[0]?.split("#")[0] || "/";
  const collapsed = withoutQuery.replace(/\/{2,}/g, "/");
  const normalized = collapsed.length > 1 && collapsed.endsWith("/")
    ? collapsed.slice(0, -1)
    : collapsed;

  if (
    normalized.startsWith("/admin") ||
    normalized.startsWith("/api") ||
    normalized.startsWith("/_next") ||
    normalized === "/favicon.ico"
  ) {
    return null;
  }

  return normalized.slice(0, 160);
}

/**
 * Extract a sanitized external referrer hostname, or "direct" for empty/same-origin referrers.
 */
export function extractReferrerHost(rawReferrer: unknown, ownHost?: string): string {
  if (typeof rawReferrer !== "string" || !rawReferrer.trim()) {
    return "direct";
  }

  try {
    const parsed = new URL(rawReferrer.trim());
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "direct";
    }
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    if (!host) return "direct";

    if (ownHost) {
      const normalizedOwn = ownHost.split(":")[0]?.toLowerCase().replace(/^www\./, "");
      if (normalizedOwn && host === normalizedOwn) {
        return "direct";
      }
    }

    return host.slice(0, 120);
  } catch {
    return "direct";
  }
}

export function detectDeviceType(userAgent?: string): DeviceType {
  if (!userAgent) return "desktop";
  if (TABLET_UA_REGEX.test(userAgent)) return "tablet";
  if (MOBILE_UA_REGEX.test(userAgent)) return "mobile";
  return "desktop";
}

export function isLikelyBot(userAgent?: string): boolean {
  if (!userAgent) return false;
  return BOT_UA_REGEX.test(userAgent);
}

/**
 * Encode Map keys so dots and leading `$` never create nested MongoDB paths during `$inc`.
 */
export function encodeAnalyticsKey(key: string): string {
  return key.replace(/\./g, "__dot__").replace(/^\$/, "_");
}

export function decodeAnalyticsKey(key: string): string {
  return key.replace(/__dot__/g, ".");
}

/**
 * Format a UTC Date as YYYY-MM-DD.
 */
export function formatUtcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Build a privacy-preserving daily visitor hash (no raw IP or PII stored).
 */
export function createDailyVisitorHash(dateKey: string, ip: string, userAgent: string): string {
  const salt = process.env.AUTH_SECRET || "afrin-portfolio-analytics-salt";
  return crypto
    .createHash("sha256")
    .update(`${dateKey}|${salt}|${ip}|${userAgent.slice(0, 120)}`)
    .digest("hex")
    .slice(0, 16);
}

export function parseAnalyticsRange(raw?: string | null): AnalyticsRange {
  if (raw === "7d" || raw === "30d" || raw === "90d") return raw;
  return "30d";
}

export function getRangeDays(range: AnalyticsRange): number {
  if (range === "7d") return 7;
  if (range === "90d") return 90;
  return 30;
}
