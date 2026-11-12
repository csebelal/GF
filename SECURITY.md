# Security Policy & OWASP Audit Report

## Audit Log

- **Last Audit Date**: 2026-11-12
- **Scope**: Full codebase (`app/`, `components/`, `lib/`, `scripts/`, `middleware.ts`, `next.config.ts`, `package.json`, `.gitignore`), including multi-user RBAC & first-party traffic analytics.
- **Methodology**: OWASP Top 10 static analysis, authentication/authorization review, injection & XSS sink inspection, file upload validation review, dependency audit (`npm audit`), and regression test execution.

---

## Findings Summary

### Fixed During Audit

- **JSON-LD Script Tag Breakout Risk (`app/layout.tsx`)**
  - *Issue*: `JSON.stringify(personJsonLd)` inside `dangerouslySetInnerHTML` did not escape `<`, which could allow `</script>` breakout if profile metadata were tampered with.
  - *Fix*: Escaped `<` as `\u003c` before injecting JSON-LD.
- **Stored XSS via Unvalidated URLs & `data:image/svg+xml` (`lib/security/sanitize.ts`, `components/DocumentationRenderer.tsx`, public pages)**
  - *Issue*: DB-backed link and media URLs were not stripped by `filterProjectPayload` or consistently checked with `safeHref` before rendering `<a href>`, and Markdown image rendering permitted `data:image/svg+xml` and wrapped `data:` URIs in clickable links.
  - *Fix*: Added `safeHref()` guards on DB-sourced links across `app/page.tsx`, `app/contact/page.tsx`, `app/portfolio/[slug]/page.tsx`, `components/Header.tsx`, `components/Footer.tsx`, and `components/CVDownload.tsx`; added URL filtering inside `filterProjectPayload()`; restricted Markdown `data:` images to raster formats (`png`, `jpeg`, `jpg`, `webp`, `gif`) without wrapping them in `<a href>`.
- **File Upload Extension Whitelist Bypass (`lib/security/file-validation.ts`)**
  - *Issue*: `ALLOWED_TYPES.find((t) => t.extensions.includes(ext) || t.mime === file.type)` allowed an unapproved extension (e.g., `.bin`) to pass if `file.type` and magic bytes matched PNG/JPEG/WebP/PDF.
  - *Fix*: Required an explicitly whitelisted extension (`.jpg`, `.jpeg`, `.png`, `.webp`, `.pdf`) AND verified declared MIME type compatibility alongside magic-byte verification.
- **Login Rate-Limit Bypass via `X-Forwarded-For` & Timing Enumeration (`app/api/admin/auth/login/route.ts`, `lib/security/rate-limit.ts`)**
  - *Issue*: Per-IP login rate limiting relied on `x-forwarded-for`, which can be rotated on untrusted proxies, and unknown emails skipped `bcrypt.compare`.
  - *Fix*: Added per-account rate limiting (`RateLimiters.authLoginEmail`) alongside IP rate limiting, and added a dummy `bcrypt` verification on unknown emails.
- **Production CSP & CSRF Consistency (`next.config.ts`, `middleware.ts`)**
  - *Issue*: `'unsafe-eval'` was included in production `script-src`, HSTS was emitted unconditionally in non-production environments, and `middleware.ts` lacked the `sec-fetch-site` fallback check present in `lib/security/csrf.ts`.
  - *Fix*: Restricted `'unsafe-eval'` and HSTS to development/production respectively, aligned `Permissions-Policy`, and added `sec-fetch-site` cross-site blocking in `middleware.ts`.

### Warnings / Operational Notes

- 🟡 **In-Memory Rate Limiter**: `lib/security/rate-limit.ts` uses a process-local `Map`. This works for single-instance Node deployments, but multi-instance/serverless deployments should back rate limiting with a shared store (e.g., Redis).
- 🟡 **Environment Configuration**: Ensure `AUTH_SECRET` (32+ random characters), `MONGODB_URI`, and non-default `DEFAULT_ADMIN_PASSWORD` are configured in `.env.local` / deployment environment variables before production launch. Ephemeral secrets are only permitted outside `NODE_ENV=production`.
- 🟡 **Inline Script CSP**: `script-src` retains `'unsafe-inline'` for Next.js hydration and the pre-hydration reduced-motion reveal script (`app/layout.tsx`). Consider migrating to per-request CSP nonces if strict nonce-based CSP is required.

### Passed Controls

- 🟢 **Secrets & Repository Hygiene**: No hardcoded secrets, API keys, or `.env` files tracked in git (`.gitignore` excludes `.env`, `.env.*`, `.env*.local`, `public/uploads/*`).
- 🟢 **Authentication & Session Management**: `jose` HS256 JWTs with `httpOnly`, `sameSite: "lax"`, `secure` in production, `tokenVersion` revocation on password change, and `bcryptjs` (12 rounds) with complexity/common-password checks.
- 🟢 **Access Control & RBAC**: `/admin/*` and `/api/admin/*` protected by `middleware.ts` plus server-side `getAuthenticatedAdmin()` / `requireAdminRole()` DB verification (`admin`, `editor`, `viewer` roles). User management (`/api/admin/users*`) and system cache flush (`/api/admin/system/revalidate`) require `admin`; content/media mutations require `admin` or `editor`; self-deletion, last-admin removal/demotion, and `passwordHash` projection leaks are blocked, and role/password updates increment `tokenVersion` to revoke prior sessions.
- 🟢 **Privacy-First Analytics**: `POST /api/analytics/track` filters bots, excludes `/admin` and `/api` routes, rate-limits per IP (`60/min`), encodes MongoDB Map keys to prevent nested operator injection, and stores daily-salted truncated SHA-256 hashes without raw IP addresses or cookies.
- 🟢 **NoSQL Injection & Mass Assignment**: `sanitizeNoSql()` strips `$` operators and dotted keys; `filterProjectPayload()` whitelists project fields.
- 🟢 **Open Redirect Protection**: `sanitizeRedirectPath()` rejects protocol-relative (`//`), external URLs, CRLF, null bytes, and backslashes.
- 🟢 **Supply Chain (`npm audit`)**: `npm audit` and `npm audit --omit=dev` reported `0 vulnerabilities`.

---

## Verification

- `npm test`: **77/77 tests passed** across 14 suites (including RBAC, analytics helpers, upload extension, and URL sanitization regression tests).
- `npm run typecheck`: passed (`tsc --noEmit`).
- `npm run build`: passed (`next build`).
- `npm audit --omit=dev`: **0 vulnerabilities**.
