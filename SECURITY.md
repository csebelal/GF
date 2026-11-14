# Security Policy & OWASP Audit Report

## Audit Log

- **Last Audit Date**: 2026-11-14
- **Scope**: Full codebase (`app/`, `components/`, `lib/`, `scripts/`, `middleware.ts`, `next.config.ts`, `package.json`, `.gitignore`), including multi-user RBAC, first-party traffic analytics, dynamic sitemaps, and Google Analytics/GTM integration.
- **Methodology**: OWASP Top 10 static analysis, authentication/authorization review, injection & XSS sink inspection, file upload validation review, dependency audit (`npm audit`), and regression test execution.

---

## Findings Summary

### Fixed During Prior & Current Audits

- **Google Analytics / GTM ID Injection & CSP Alignment (`lib/analytics/validators.ts`, `components/GoogleAnalytics.tsx`, `next.config.ts`)**
  - *Mitigation*: Strict regex verification (`isValidGoogleAnalyticsId`) restricts IDs exclusively to safe formats (`G-[A-Z0-9]+`, `GTM-[A-Z0-9]+`, `UA-\d+-\d+`), rejecting any injection, semicolons, script tags, or non-alphanumeric characters. Next.js CSP `script-src` and `connect-src` specifically permit only Google Analytics and Tag Manager origins (`*.googletagmanager.com`, `*.google-analytics.com`, `*.analytics.google.com`).
- **Canonical Hostname & Open-Redirect Enforcement (`lib/site-url.ts`, `lib/seo/schema.ts`, `app/sitemap.ts`)**
  - *Mitigation*: Dynamically configured URLs automatically reject `localhost` and unapproved ports in production, canonicalizing to `https://afrinchishti.site`.
- **JSON-LD Script Tag Breakout Risk (`app/layout.tsx`, `lib/seo/schema.ts`)**
  - *Mitigation*: Escaped `<` as `\u003c` in all JSON-LD serializations to neutralize `</script>` tag breakout vectors.
- **Stored XSS via Unvalidated URLs & `data:image/svg+xml` (`lib/security/sanitize.ts`, `components/DocumentationRenderer.tsx`, public pages)**
  - *Mitigation*: Added `safeHref()` guards on DB-sourced links; restricted Markdown `data:` images to raster formats (`png`, `jpeg`, `jpg`, `webp`, `gif`) without wrapping them in `<a href>`.
- **File Upload Extension Whitelist Bypass (`lib/security/file-validation.ts`)**
  - *Mitigation*: Whitelisted extensions (`.jpg`, `.jpeg`, `.png`, `.webp`, `.pdf`) required in conjunction with declared MIME type matching and file magic byte signature verification.
- **Login Rate-Limit Bypass via `X-Forwarded-For` & Timing Enumeration (`app/api/admin/auth/login/route.ts`, `lib/security/rate-limit.ts`)**
  - *Mitigation*: Added per-account rate limiting (`RateLimiters.authLoginEmail`) alongside IP rate limiting; implemented constant-time dummy `bcrypt` verification on unknown emails to prevent username harvesting via timing attacks.
- **Production CSP & CSRF Consistency (`next.config.ts`, `middleware.ts`)**
  - *Mitigation*: Restricted `'unsafe-eval'` to development; configured strict HSTS with preloading for production; implemented `sec-fetch-site` cross-site blocking in `middleware.ts`.

---

## OWASP Top 10 Compliance Matrix

| OWASP Category | Status | Control Implementation |
|---|---|---|
| **A01: Broken Access Control** | 🟢 PASSED | JWT role verification (`admin`, `editor`, `viewer`) via `middleware.ts` and `requireAdminRole()`. Critical mutations restricted to `admin`; self-deletion and last-admin demotion prevented. |
| **A02: Cryptographic Failures** | 🟢 PASSED | Passwords hashed using `bcryptjs` (salt rounds: 12). Sessions signed using `jose` HS256 JWT with minimum 32-character `AUTH_SECRET`. Password updates increment `tokenVersion`, instantly revoking older sessions. |
| **A03: Injection (SQL / NoSQL / XSS)** | 🟢 PASSED | `sanitizeNoSql()` strips MongoDB operators (`$`, `.`) recursively. Safe URL validator blocks `javascript:`, `vbscript:`, and unsafe `data:` URIs. JSON-LD scripts are serialized with escaped angle brackets (`\u003c`). GA/GTM IDs strictly validated against alphanumeric patterns. |
| **A04: Insecure Design** | 🟢 PASSED | Privacy-first first-party analytics with daily-salted truncated SHA-256 visitor hashing. Zero storage of raw visitor IPs or PII. Rate limiting on public and administrative endpoints. |
| **A05: Security Misconfiguration** | 🟢 PASSED | Hardened HTTP headers: `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`, `Permissions-Policy`, and restricted `Content-Security-Policy`. |
| **A06: Vulnerable & Outdated Components** | 🟢 PASSED | `npm audit --omit=dev` confirms **0 vulnerabilities**. Next.js 16.4.3, React 19.3.1, Jose 6.2.16, Mongoose 9.12.0 are up-to-date. |
| **A07: Identification & Auth Failures** | 🟢 PASSED | Sliding-window brute force lockouts on `/api/admin/auth/login` by both IP and email. Dummy password hashing on non-existent usernames. Password complexity rules enforced (minimum 10 chars, uppercase, lowercase, numbers, special characters). |
| **A08: Software & Data Integrity Failures** | 🟢 PASSED | Secure file upload validation enforcing magic byte headers (PNG, JPEG, WebP, PDF) alongside strict extension checks. |
| **A09: Security Logging & Monitoring** | 🟢 PASSED | In-memory audit ring buffer tracking administrative events (`LOGIN_SUCCESS`, `LOGIN_FAILED`, `PROFILE_UPDATED`, `PASSWORD_CHANGED`, `LOGOUT`, `CACHE_INVALIDATED`) with IP and user metadata. |
| **A10: Server-Side Request Forgery (SSRF)** | 🟢 PASSED | No unrestricted outbound HTTP request proxying from client input. YouTube video parser uses strict domain verification (`youtube.com`, `youtu.be`). |

---

## Operational Notes & Recommendations

- 🟡 **In-Memory Rate Limiter**: `lib/security/rate-limit.ts` uses an in-memory sliding-window store. Suitable for the single-instance PM2 production deployment. If scaling to a multi-node cluster, back rate limiters with Redis.
- 🟡 **Environment Variables**: Verify `.env.local` on production VM contains a 32+ character random `AUTH_SECRET` and non-default `DEFAULT_ADMIN_PASSWORD`.
- 🟡 **Inline Scripts**: Next.js hydration requires `'unsafe-inline'` in `script-src`. Nonce-based CSP can be evaluated for future strict deployments.

---

## Verification & Test Results

- `npm test`: **81/81 tests passed** across 17 suites (0 failures).
- `npm run typecheck`: Passed (`tsc --noEmit` with 0 errors).
- `npm audit --omit=dev`: **0 vulnerabilities** found.
