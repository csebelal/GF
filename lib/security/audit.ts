/**
 * Security Audit Logging
 * Records auditable security events (logins, failed attempts, privilege actions, data mutations)
 * with timestamps, client IP context, and sanitization to prevent log injection.
 */

export type AuditAction =
  | "AUTH_LOGIN_SUCCESS"
  | "AUTH_LOGIN_FAILED"
  | "AUTH_LOGOUT"
  | "AUTH_PASSWORD_CHANGED"
  | "AUTH_PASSWORD_CHANGE_FAILED"
  | "AUTH_PROFILE_UPDATED"
  | "PROJECT_CREATED"
  | "PROJECT_UPDATED"
  | "PROJECT_DELETED"
  | "PROJECTS_REORDERED"
  | "EXPERIENCE_UPDATED"
  | "EXPERTISE_UPDATED"
  | "PROFILE_UPDATED"
  | "FILE_UPLOAD_SUCCESS"
  | "FILE_UPLOAD_BLOCKED"
  | "RATE_LIMIT_TRIGGERED"
  | "CSRF_DETECTED"
  | "UNAUTHORIZED_ACCESS"
  | "FORBIDDEN_ACCESS"
  | "ADMIN_USER_CREATED"
  | "ADMIN_USER_UPDATED"
  | "ADMIN_USER_DELETED"
  | "CACHE_INVALIDATED";

export interface AuditLogEntry {
  timestamp: string;
  action: AuditAction;
  ip: string;
  userAgent?: string;
  user?: string;
  details?: Record<string, unknown>;
  status: "SUCCESS" | "FAILURE" | "WARNING" | "BLOCKED";
}

/** Sanitize input strings to prevent CRLF log injection */
function cleanLogString(str: unknown): string {
  if (typeof str !== "string") return "";
  return str.replace(/[\r\n\t]/g, " ").slice(0, 500);
}

export function extractClientIp(headers: Headers | { get(name: string): string | null }): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return cleanLogString(first);
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) return cleanLogString(realIp);
  const cfConnectingIp = headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cleanLogString(cfConnectingIp);
  return "127.0.0.1";
}

export function logSecurityEvent(
  action: AuditAction,
  options: {
    req?: Request | Headers | { headers: Headers };
    user?: string;
    status?: "SUCCESS" | "FAILURE" | "WARNING" | "BLOCKED";
    details?: Record<string, unknown>;
  }
) {
  let ip = "unknown";
  let userAgent = "unknown";

  if (options.req) {
    let headers: Headers | null = null;
    if ("headers" in options.req && options.req.headers instanceof Headers) {
      headers = options.req.headers;
    } else if (options.req instanceof Headers) {
      headers = options.req;
    } else if ("headers" in options.req) {
      headers = options.req.headers as Headers;
    }

    if (headers) {
      ip = extractClientIp(headers);
      userAgent = cleanLogString(headers.get("user-agent") || "unknown");
    }
  }

  const entry: AuditLogEntry = {
    timestamp: new Date().toISOString(),
    action,
    ip,
    userAgent,
    user: cleanLogString(options.user || "anonymous"),
    status: options.status || "SUCCESS",
    details: options.details ? JSON.parse(JSON.stringify(options.details)) : undefined,
  };

  // Structured security log output
  const level = entry.status === "FAILURE" || entry.status === "BLOCKED" ? "warn" : "info";
  console[level](`[SECURITY AUDIT] ${JSON.stringify(entry)}`);

  pushAuditBuffer(entry);
}

const MAX_RECENT_EVENTS = 50;

declare global {
  // eslint-disable-next-line no-var
  var __afrinSecurityAuditLog: AuditLogEntry[] | undefined;
}

function getAuditBuffer(): AuditLogEntry[] {
  if (!globalThis.__afrinSecurityAuditLog) {
    globalThis.__afrinSecurityAuditLog = [];
  }
  return globalThis.__afrinSecurityAuditLog;
}

function pushAuditBuffer(entry: AuditLogEntry) {
  const buf = getAuditBuffer();
  buf.unshift(entry);
  if (buf.length > MAX_RECENT_EVENTS) {
    buf.length = MAX_RECENT_EVENTS;
  }
}

export function getRecentSecurityEvents(limit = 10): AuditLogEntry[] {
  return getAuditBuffer().slice(0, Math.max(1, limit));
}

export function clearRecentSecurityEvents() {
  globalThis.__afrinSecurityAuditLog = [];
}
