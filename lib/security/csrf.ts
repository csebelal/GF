import { logSecurityEvent } from "./audit";

/**
 * CSRF Protection via Origin & Referer Verification
 * Verifies that state-changing requests (POST, PUT, DELETE, PATCH) originate
 * from the same application origin.
 */

export function verifyCsrfOrigin(request: Request): { valid: boolean; reason?: string } {
  const method = request.method.toUpperCase();
  // Safe idempotent methods do not need CSRF verification
  if (["GET", "HEAD", "OPTIONS"].includes(method)) {
    return { valid: true };
  }

  const hostHeader = request.headers.get("host");
  const originHeader = request.headers.get("origin");
  const refererHeader = request.headers.get("referer");

  // If no host header exists, we cannot verify origin
  if (!hostHeader) {
    logSecurityEvent("CSRF_DETECTED", {
      req: request,
      status: "BLOCKED",
      details: { reason: "Missing Host header" },
    });
    return { valid: false, reason: "Missing Host header" };
  }

  // 1. Verify Origin header if present
  if (originHeader) {
    try {
      const originUrl = new URL(originHeader);
      if (originUrl.host.toLowerCase() === hostHeader.toLowerCase()) {
        return { valid: true };
      }
    } catch {
      // Invalid origin URL format
    }

    logSecurityEvent("CSRF_DETECTED", {
      req: request,
      status: "BLOCKED",
      details: { origin: originHeader, host: hostHeader },
    });
    return { valid: false, reason: "Cross-origin request rejected" };
  }

  // 2. Fallback to Referer header if Origin is absent
  if (refererHeader) {
    try {
      const refererUrl = new URL(refererHeader);
      if (refererUrl.host.toLowerCase() === hostHeader.toLowerCase()) {
        return { valid: true };
      }
    } catch {
      // Invalid referer URL format
    }

    logSecurityEvent("CSRF_DETECTED", {
      req: request,
      status: "BLOCKED",
      details: { referer: refererHeader, host: hostHeader },
    });
    return { valid: false, reason: "Cross-origin referer rejected" };
  }

  // If neither Origin nor Referer is present on a mutation request in a browser context,
  // we check if this is a direct fetch or same-site request.
  // Sec-Fetch-Site header: 'same-origin' or 'none'
  const secFetchSite = request.headers.get("sec-fetch-site");
  if (secFetchSite && !["same-origin", "same-site", "none"].includes(secFetchSite)) {
    logSecurityEvent("CSRF_DETECTED", {
      req: request,
      status: "BLOCKED",
      details: { secFetchSite },
    });
    return { valid: false, reason: "Cross-site fetch rejected" };
  }

  return { valid: true };
}
