import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { getAuthSecret } from "@/lib/security/config";
import { sanitizeRedirectPath } from "@/lib/security/sanitize";

const SESSION_COOKIE_NAME = "admin_session";

function setSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://i.ytimg.com https://img.youtube.com https://images.unsplash.com; font-src 'self' data:; frame-src https://www.youtube.com https://www.youtube-nocookie.com; frame-ancestors 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self';"
  );
  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const initialResponse = NextResponse.next();
  const response = setSecurityHeaders(initialResponse);

  // 1. Admin UI Page Routes Protection (/admin/*)
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    let isValid = false;

    if (token) {
      try {
        const secret = getAuthSecret();
        await jwtVerify(token, secret, { algorithms: ["HS256"] });
        isValid = true;
      } catch {
        isValid = false;
      }
    }

    if (pathname === "/admin/login") {
      if (isValid) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return response;
    }

    if (!isValid) {
      const loginUrl = new URL("/admin/login", request.url);
      const safeFrom = sanitizeRedirectPath(pathname, "/admin");
      loginUrl.searchParams.set("from", safeFrom);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Admin API Routes Protection (/api/admin/*)
  if (pathname.startsWith("/api/admin")) {
    // Login API endpoint is public for authentication
    if (pathname === "/api/admin/auth/login") {
      return response;
    }

    // Verify Session Token for all other admin API endpoints
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    let isValid = false;

    if (token) {
      try {
        const secret = getAuthSecret();
        await jwtVerify(token, secret, { algorithms: ["HS256"] });
        isValid = true;
      } catch {
        isValid = false;
      }
    }

    if (!isValid) {
      return NextResponse.json(
        { error: "Unauthorized: Valid admin session required" },
        { status: 401, headers: response.headers }
      );
    }

    // CSRF Protection on state-changing API requests (POST, PUT, DELETE, PATCH)
    const method = request.method.toUpperCase();
    if (["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
      const host = request.headers.get("host");
      const origin = request.headers.get("origin");
      const referer = request.headers.get("referer");

      if (origin) {
        try {
          const originHost = new URL(origin).host;
          if (host && originHost.toLowerCase() !== host.toLowerCase()) {
            return NextResponse.json(
              { error: "Forbidden: Cross-origin request blocked (CSRF protection)" },
              { status: 403, headers: response.headers }
            );
          }
        } catch {
          return NextResponse.json(
            { error: "Forbidden: Invalid Origin header" },
            { status: 403, headers: response.headers }
          );
        }
      } else if (referer) {
        try {
          const refererHost = new URL(referer).host;
          if (host && refererHost.toLowerCase() !== host.toLowerCase()) {
            return NextResponse.json(
              { error: "Forbidden: Cross-origin Referer blocked (CSRF protection)" },
              { status: 403, headers: response.headers }
            );
          }
        } catch {
          return NextResponse.json(
            { error: "Forbidden: Invalid Referer header" },
            { status: 403, headers: response.headers }
          );
        }
      }
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
