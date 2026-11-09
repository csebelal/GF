/**
 * Input Sanitization & NoSQL Injection Protection
 * Protects MongoDB queries from operator injection, cleans redirect paths,
 * and validates URL protocols to prevent XSS.
 */

/**
 * Deep sanitization for MongoDB input.
 * Strips any object keys starting with '$' or containing '.' to eliminate NoSQL operator injections.
 */
export function sanitizeNoSql<T>(input: T): T {
  if (input === null || input === undefined) {
    return input;
  }

  if (Array.isArray(input)) {
    return input.map((item) => sanitizeNoSql(item)) as unknown as T;
  }

  if (typeof input === "object" && input.constructor === Object) {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
      // Disallow MongoDB operators ($where, $ne, $gt, etc.) and dot notation
      if (key.startsWith("$") || key.includes(".")) {
        continue;
      }
      cleaned[key] = sanitizeNoSql(value);
    }
    return cleaned as T;
  }

  return input;
}

/**
 * Validates and sanitizes internal redirection paths to eliminate Open Redirect vulnerabilities.
 * Guarantees the destination is a safe relative path.
 */
export function sanitizeRedirectPath(from: unknown, fallback: string = "/admin"): string {
  if (typeof from !== "string" || !from) {
    return fallback;
  }

  const trimmed = from.trim();

  // Reject CRLF, null bytes, backslashes
  if (/[\r\n\0\\]/.test(trimmed)) {
    return fallback;
  }

  // Must begin with a single slash, not protocol-relative (//)
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }

  // Reject if it contains a protocol scheme (e.g. /http:// or /javascript:)
  if (/^\/[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return fallback;
  }

  return trimmed;
}

/**
 * Validates external or internal URLs to ensure they only use safe protocols (https, http, mailto, relative).
 * Rejects javascript:, vbscript:, data:, and file: URIs.
 */
export function isSafeUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();

  // Safe relative paths & anchors
  if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.includes("\\")) {
    return true;
  }
  if (trimmed.startsWith("#")) {
    return true;
  }

  try {
    const parsed = new URL(trimmed);
    return ["https:", "http:", "mailto:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Sanitize plain text strings, trimming whitespace and enforcing max length.
 */
export function sanitizeText(val: unknown, maxLength: number = 5000): string {
  if (typeof val !== "string") return "";
  return val.trim().slice(0, maxLength);
}

/**
 * Whitelist filter for Project model to prevent mass assignment / unexpected field injection.
 */
export function filterProjectPayload(raw: Record<string, unknown>) {
  const allowedKeys = new Set([
    "slug",
    "title",
    "summary",
    "category",
    "tools",
    "featured",
    "status",
    "provenance",
    "role",
    "date",
    "coverImage",
    "overview",
    "videos",
    "documentation",
    "documentationContent",
    "screenshots",
    "attachments",
    "externalLinks",
  ]);

  const sanitized = sanitizeNoSql(raw);
  const result: Record<string, unknown> = {};

  for (const key of Object.keys(sanitized)) {
    if (allowedKeys.has(key)) {
      result[key] = sanitized[key];
    }
  }

  return result;
}

