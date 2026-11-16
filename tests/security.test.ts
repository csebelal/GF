import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
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

describe("Security Suite: Dynamic Uploads Asset Serving & Traversal Prevention", () => {
  it("rejects path traversal attempts with 400 or 403", async () => {
    const { GET } = await import("@/app/uploads/[...filename]/route");

    // Traversal via ..
    const res1 = await GET(new Request("http://localhost:3000/uploads/../../package.json"), {
      params: Promise.resolve({ filename: ["..", "..", "package.json"] }),
    });
    assert.ok([400, 403, 404].includes(res1.status));

    // Traversal via null bytes
    const res2 = await GET(new Request("http://localhost:3000/uploads/test\0.png"), {
      params: Promise.resolve({ filename: ["test\0.png"] }),
    });
    assert.equal(res2.status, 400);
  });

  it("returns 404 cleanly for missing files", async () => {
    const { GET } = await import("@/app/uploads/[...filename]/route");
    const res = await GET(new Request("http://localhost:3000/uploads/non-existent-file-12345.pdf"), {
      params: Promise.resolve({ filename: ["non-existent-file-12345.pdf"] }),
    });
    assert.equal(res.status, 404);
  });

  it("serves existing files with correct headers and Content-Type", async () => {
    const { GET } = await import("@/app/uploads/[...filename]/route");
    const fs = await import("node:fs/promises");
    const path = await import("node:path");

    // Create a temporary test fixture in public/uploads
    const uploadsDir = path.resolve(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });
    const testFile = path.resolve(uploadsDir, "test-serving-fixture.png");
    await fs.writeFile(testFile, Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));

    try {
      const res = await GET(new Request("http://localhost:3000/uploads/test-serving-fixture.png"), {
        params: Promise.resolve({ filename: ["test-serving-fixture.png"] }),
      });
      assert.equal(res.status, 200);
      assert.equal(res.headers.get("Content-Type"), "image/png");
      assert.equal(res.headers.get("Cache-Control"), "public, max-age=31536000, immutable");
      assert.equal(res.headers.get("X-Content-Type-Options"), "nosniff");
    } finally {
      await fs.unlink(testFile).catch(() => {});
    }
  });
});

describe("Security Suite: Media Library Deletion & Metadata Management", () => {
  it("rejects unauthenticated requests to PATCH and DELETE with 401", async () => {
    const { PATCH, DELETE } = await import("@/app/api/admin/media/[filename]/route");

    const patchRes = await PATCH(new Request("http://localhost:3000/api/admin/media/test.png", { method: "PATCH" }), {
      params: Promise.resolve({ filename: "test.png" }),
    });
    assert.equal(patchRes.status, 401);

    const deleteRes = await DELETE(new Request("http://localhost:3000/api/admin/media/test.png", { method: "DELETE" }), {
      params: Promise.resolve({ filename: "test.png" }),
    });
    assert.equal(deleteRes.status, 401);
  });

  it("rejects path traversal attempts on media routes", async () => {
    const { PATCH, DELETE } = await import("@/app/api/admin/media/[filename]/route");
    const { createSessionToken } = await import("@/lib/auth/session");

    const token = await createSessionToken({ email: "admin@portfolio.local", name: "Admin", role: "admin" });
    const authHeaders = { Cookie: `admin_session=${token}`, "Content-Type": "application/json" };

    const badFilenames = ["../../etc/passwd", "..%2F..%2F.env", "/root/secret.png"];

    for (const bad of badFilenames) {
      const pRes = await PATCH(new Request("http://localhost:3000/api/admin/media/" + bad, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ title: "Hack" }),
      }), {
        params: Promise.resolve({ filename: bad }),
      });
      assert.ok([400, 401, 403, 404].includes(pRes.status));

      const dRes = await DELETE(new Request("http://localhost:3000/api/admin/media/" + bad, {
        method: "DELETE",
        headers: authHeaders,
      }), {
        params: Promise.resolve({ filename: bad }),
      });
      assert.ok([400, 401, 403, 404].includes(dRes.status));
    }
  });

  it("allows admin to update metadata and delete files safely", async () => {
    const { PATCH, DELETE } = await import("@/app/api/admin/media/[filename]/route");
    const { createSessionToken } = await import("@/lib/auth/session");
    const { AdminModel } = await import("@/lib/db/models/Admin");
    const { connectDB } = await import("@/lib/db/connection");
    const fs = await import("node:fs/promises");
    const path = await import("node:path");

    await connectDB();
    await AdminModel.findOneAndUpdate(
      { email: "admin@portfolio.local" },
      { email: "admin@portfolio.local", name: "Admin", role: "admin", passwordHash: "dummyHash123", tokenVersion: 0 },
      { upsert: true }
    );

    const token = await createSessionToken({ email: "admin@portfolio.local", name: "Admin", role: "admin" });
    const authHeaders = { Cookie: `admin_session=${token}`, "Content-Type": "application/json" };

    // 1. Create a physical fixture file in public/uploads
    const uploadsDir = path.resolve(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });
    const filename = "test-media-delete-fixture.png";
    const filePath = path.resolve(uploadsDir, filename);
    await fs.writeFile(filePath, Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));

    try {
      // 2. Update metadata via PATCH
      const patchRes = await PATCH(new Request(`http://localhost:3000/api/admin/media/${filename}`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({
          title: "Architecture Flow Diagram",
          alt: "Flow chart illustration",
          tags: ["flow", "salesforce", "architecture"],
        }),
      }), {
        params: Promise.resolve({ filename }),
      });

      assert.equal(patchRes.status, 200);
      const patchData = await patchRes.json();
      assert.equal(patchData.success, true);
      assert.equal(patchData.asset.title, "Architecture Flow Diagram");
      assert.deepEqual(patchData.asset.tags, ["flow", "salesforce", "architecture"]);

      // 3. Delete file via DELETE
      const deleteRes = await DELETE(new Request(`http://localhost:3000/api/admin/media/${filename}`, {
        method: "DELETE",
        headers: authHeaders,
      }), {
        params: Promise.resolve({ filename }),
      });

      assert.equal(deleteRes.status, 200);
      const deleteData = await deleteRes.json();
      assert.equal(deleteData.success, true);

      // Verify physical file was removed
      let exists = true;
      try {
        await fs.stat(filePath);
      } catch {
        exists = false;
      }
      assert.equal(exists, false);
    } finally {
      await fs.unlink(filePath).catch(() => {});
    }
  });

  after(async () => {
    await mongoose.disconnect();
  });
});


