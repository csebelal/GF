import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validatePasswordStrength } from "../lib/security/password";
import { validateUploadedFile } from "../lib/security/file-validation";
import {
  sanitizeNoSql,
  sanitizeRedirectPath,
  isSafeUrl,
  filterProjectPayload,
} from "../lib/security/sanitize";
import { checkRateLimit, resetRateLimit } from "../lib/security/rate-limit";
import { createSessionToken, verifySessionToken } from "../lib/auth/session";

describe("Security Suite: Password Policy", () => {
  it("rejects short passwords (< 10 chars)", () => {
    const res = validatePasswordStrength("Ab1!");
    assert.equal(res.valid, false);
    assert.ok(res.errors.some((e) => e.includes("at least 10 characters")));
  });

  it("rejects passwords missing digits, uppercase, or special chars", () => {
    assert.equal(validatePasswordStrength("alllowercaseletters!").valid, false);
    assert.equal(validatePasswordStrength("ALLUPPERCASE123!").valid, false);
    assert.equal(validatePasswordStrength("NoSpecialChar123").valid, false);
  });

  it("rejects common passwords like 'adminpassword123!'", () => {
    const res = validatePasswordStrength("AdminPassword123!");
    assert.equal(res.valid, false);
    assert.ok(res.errors.some((e) => e.includes("too common")));
  });

  it("accepts strong complex passwords", () => {
    const res = validatePasswordStrength("K9#vL2$mPq8!zR@4");
    assert.equal(res.valid, true);
    assert.equal(res.errors.length, 0);
  });
});

describe("Security Suite: Secure File Uploads", () => {
  it("blocks dangerous extensions (.html, .svg, .js, .exe, .php)", () => {
    const fakeHtml = new File([Buffer.from("<h1>xss</h1>")], "malicious.html", { type: "text/html" });
    const res = validateUploadedFile(fakeHtml, Buffer.from("<h1>xss</h1>"));
    assert.equal(res.valid, false);
    assert.ok(res.error?.includes("not permitted"));

    const fakeSvg = new File([Buffer.from("<svg onload=alert(1)>")], "xss.svg", { type: "image/svg+xml" });
    const resSvg = validateUploadedFile(fakeSvg, Buffer.from("<svg onload=alert(1)>"));
    assert.equal(resSvg.valid, false);
  });

  it("blocks files when buffer signature does not match extension (MIME spoofing)", () => {
    const fakeJpg = new File([Buffer.from("malicious executable content")], "photo.jpg", { type: "image/jpeg" });
    const res = validateUploadedFile(fakeJpg, Buffer.from("malicious executable content"));
    assert.equal(res.valid, false);
    assert.ok(res.error?.includes("signature does not match"));
  });

  it("accepts valid PNG image with true magic bytes", () => {
    // Valid PNG signature: 89 50 4E 47 0D 0A 1A 0A
    const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
    const file = new File([pngHeader], "avatar.png", { type: "image/png" });
    const res = validateUploadedFile(file, pngHeader);
    assert.equal(res.valid, true);
    assert.ok(res.sanitizedFilename?.endsWith(".png"));
    assert.notEqual(res.sanitizedFilename, "avatar.png"); // verify randomized filename
  });

  it("accepts valid PDF document with %PDF- header", () => {
    const pdfHeader = Buffer.from("%PDF-1.7\n%some content");
    const file = new File([pdfHeader], "resume.pdf", { type: "application/pdf" });
    const res = validateUploadedFile(file, pdfHeader);
    assert.equal(res.valid, true);
    assert.ok(res.sanitizedFilename?.endsWith(".pdf"));
  });

  it("blocks unapproved extensions even when MIME type and magic bytes match PNG", () => {
    const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
    const file = new File([pngHeader], "payload.bin", { type: "image/png" });
    const res = validateUploadedFile(file, pngHeader);
    assert.equal(res.valid, false);
  });
});

describe("Security Suite: NoSQL Injection & Payload Filtering", () => {
  it("strips MongoDB operators ($where, $gt, $ne, etc.) from payloads", () => {
    const maliciousPayload = {
      title: "Legitimate Project",
      slug: "legit-slug",
      $where: "sleep(5000)",
      nested: {
        $ne: null,
        validKey: "value",
      },
      "malicious.dotted.key": "attack",
    };

    const sanitized = sanitizeNoSql(maliciousPayload) as any;
    assert.equal(sanitized.title, "Legitimate Project");
    assert.equal(sanitized.$where, undefined);
    assert.equal(sanitized.nested.$ne, undefined);
    assert.equal(sanitized.nested.validKey, "value");
    assert.equal(sanitized["malicious.dotted.key"], undefined);
  });

  it("filterProjectPayload whitelists allowed fields and strips unauthorized keys", () => {
    const payload = {
      title: "Salesforce Migration",
      slug: "salesforce-migration",
      summary: "Summary text",
      category: "Data Quality",
      __v: 0,
      adminToken: "injected_token",
      isAdmin: true,
      injectedScript: "<script>alert(1)</script>",
    };

    const filtered = filterProjectPayload(payload);
    assert.equal(filtered.title, "Salesforce Migration");
    assert.equal(filtered.slug, "salesforce-migration");
    assert.equal(filtered.adminToken, undefined);
    assert.equal(filtered.isAdmin, undefined);
    assert.equal(filtered.injectedScript, undefined);
  });

  it("filterProjectPayload strips unsafe URLs from links and media", () => {
    const payload = {
      title: "Link Hygiene",
      slug: "link-hygiene",
      summary: "Summary",
      category: "Automation",
      coverImage: { src: "javascript:alert(1)", alt: "bad" },
      screenshots: [
        { src: "/uploads/ok.png", alt: "ok" },
        { src: "data:text/html,<script>alert(1)</script>", alt: "bad" },
      ],
      attachments: [
        { label: "Bad", url: "javascript:alert(1)" },
        { label: "Good", url: "/files/samples/routing-matrix-sample.csv" },
      ],
      externalLinks: [
        { label: "Bad", url: "vbscript:msgbox(1)" },
        { label: "Good", url: "https://help.salesforce.com" },
      ],
    };

    const filtered = filterProjectPayload(payload) as any;
    assert.equal(filtered.coverImage.src, "");
    assert.equal(filtered.screenshots.length, 1);
    assert.equal(filtered.attachments.length, 1);
    assert.equal(filtered.attachments[0].label, "Good");
    assert.equal(filtered.externalLinks.length, 1);
    assert.equal(filtered.externalLinks[0].label, "Good");
  });
});

describe("Security Suite: Open Redirect & Safe URLs", () => {
  it("sanitizes relative paths and rejects external redirect URLs", () => {
    assert.equal(sanitizeRedirectPath("/admin/projects"), "/admin/projects");
    assert.equal(sanitizeRedirectPath("https://evil.com/phish"), "/admin");
    assert.equal(sanitizeRedirectPath("//evil.com/phish"), "/admin");
    assert.equal(sanitizeRedirectPath("javascript:alert(1)"), "/admin");
    assert.equal(sanitizeRedirectPath("/admin\r\nLocation: evil.com"), "/admin");
  });

  it("isSafeUrl permits only safe protocols (https, http, mailto, relative)", () => {
    assert.equal(isSafeUrl("/portfolio"), true);
    assert.equal(isSafeUrl("#section-1"), true);
    assert.equal(isSafeUrl("https://linkedin.com/in/afrin"), true);
    assert.equal(isSafeUrl("mailto:afrin@example.com"), true);

    // Dangerous protocols
    assert.equal(isSafeUrl("javascript:alert(1)"), false);
    assert.equal(isSafeUrl("vbscript:alert(1)"), false);
    assert.equal(isSafeUrl("data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=="), false);
    assert.equal(isSafeUrl("file:///etc/passwd"), false);
  });
});

describe("Security Suite: Rate Limiting & Brute Force Lockout", () => {
  it("enforces sliding window limits and triggers block when threshold exceeded", () => {
    const testIp = "192.0.2.45";
    resetRateLimit(`test_key:${testIp}`);

    const options = { max: 3, windowSeconds: 60 };

    // Requests 1, 2, 3 succeed
    assert.equal(checkRateLimit(`test_key:${testIp}`, options).success, true);
    assert.equal(checkRateLimit(`test_key:${testIp}`, options).success, true);
    assert.equal(checkRateLimit(`test_key:${testIp}`, options).success, true);

    // Request 4 exceeds limit
    const exceeded = checkRateLimit(`test_key:${testIp}`, options);
    assert.equal(exceeded.success, false);
    assert.equal(exceeded.remaining, 0);

    resetRateLimit(`test_key:${testIp}`);
  });
});

describe("Security Suite: JWT Session Security & Revocation", () => {
  it("creates and verifies valid HS256 tokens with role and tokenVersion", async () => {
    const token = await createSessionToken({
      email: "admin@portfolio.local",
      name: "Admin User",
      role: "admin",
      tokenVersion: 2,
    });

    assert.ok(typeof token === "string");
    const payload = await verifySessionToken(token);
    assert.ok(payload);
    assert.equal(payload.email, "admin@portfolio.local");
    assert.equal(payload.role, "admin");
    assert.equal(payload.tokenVersion, 2);
  });

  it("rejects forged or tampered tokens", async () => {
    const token = await createSessionToken({
      email: "admin@portfolio.local",
      name: "Admin User",
      role: "admin",
    });

    // Tamper with payload
    const parts = token.split(".");
    const tampered = `${parts[0]}.${parts[1]}xyz.${parts[2]}`;
    const result = await verifySessionToken(tampered);
    assert.equal(result, null);
  });

  it("supports editor and viewer roles in JWT tokens and rejects unknown roles", async () => {
    const { isValidAdminRole, hasRequiredRole } = await import("@/lib/auth/roles");
    assert.equal(isValidAdminRole("admin"), true);
    assert.equal(isValidAdminRole("editor"), true);
    assert.equal(isValidAdminRole("viewer"), true);
    assert.equal(isValidAdminRole("superadmin"), false);

    assert.equal(hasRequiredRole("editor", ["admin", "editor"]), true);
    assert.equal(hasRequiredRole("viewer", ["admin", "editor"]), false);
    assert.equal(hasRequiredRole("editor", ["admin"]), false);

    const editorToken = await createSessionToken({
      email: "editor@portfolio.local",
      name: "Editor User",
      role: "editor",
    });
    const verified = await verifySessionToken(editorToken);
    assert.ok(verified);
    assert.equal(verified.role, "editor");
  });
});
