import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  createDailyVisitorHash,
  decodeAnalyticsKey,
  detectDeviceType,
  encodeAnalyticsKey,
  extractReferrerHost,
  isLikelyBot,
  normalizeTrackPath,
} from "@/lib/analytics/helpers";
import { computeContentSeoHealth } from "@/lib/admin/diagnostics";
import {
  clearRecentSecurityEvents,
  getRecentSecurityEvents,
  logSecurityEvent,
} from "@/lib/security/audit";

describe("analytics helpers", () => {
  it("normalizeTrackPath normalizes public paths and excludes admin/api routes", () => {
    assert.equal(normalizeTrackPath("/"), "/");
    assert.equal(normalizeTrackPath("/portfolio/"), "/portfolio");
    assert.equal(normalizeTrackPath("/portfolio/lead-routing/?utm_source=x#top"), "/portfolio/lead-routing");
    assert.equal(normalizeTrackPath("/admin"), null);
    assert.equal(normalizeTrackPath("/admin/projects"), null);
    assert.equal(normalizeTrackPath("/api/analytics/track"), null);
    assert.equal(normalizeTrackPath("/_next/static/chunk.js"), null);
    assert.equal(normalizeTrackPath("relative/path"), null);
  });

  it("extractReferrerHost strips www, ignores same-origin, and falls back to direct", () => {
    assert.equal(extractReferrerHost(""), "direct");
    assert.equal(extractReferrerHost("https://www.google.com/search?q=afrin", "afrin.dev"), "google.com");
    assert.equal(extractReferrerHost("https://www.afrin.dev/portfolio", "afrin.dev:3000"), "direct");
    assert.equal(extractReferrerHost("javascript:alert(1)"), "direct");
  });

  it("detectDeviceType and isLikelyBot classify user agents accurately", () => {
    assert.equal(detectDeviceType("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile"), "mobile");
    assert.equal(detectDeviceType("Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)"), "tablet");
    assert.equal(detectDeviceType("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/125.0"), "desktop");
    assert.equal(isLikelyBot("Googlebot/2.1 (+http://www.google.com/bot.html)"), true);
    assert.equal(isLikelyBot("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/125.0"), false);
  });

  it("encodeAnalyticsKey / decodeAnalyticsKey safely round-trips dots and leading $", () => {
    const encoded = encodeAnalyticsKey("linkedin.com");
    assert.equal(encoded.includes("."), false);
    assert.equal(decodeAnalyticsKey(encoded), "linkedin.com");
    assert.equal(encodeAnalyticsKey("$direct"), "_direct");
  });

  it("createDailyVisitorHash returns a 16-char deterministic hex hash per day", () => {
    const h1 = createDailyVisitorHash("2026-11-12", "203.0.113.1", "Chrome");
    const h2 = createDailyVisitorHash("2026-11-12", "203.0.113.1", "Chrome");
    const h3 = createDailyVisitorHash("2026-11-13", "203.0.113.1", "Chrome");
    assert.equal(h1.length, 16);
    assert.equal(h1, h2);
    assert.notEqual(h1, h3);
  });
});

describe("security audit ring buffer", () => {
  it("stores recent events newest-first and caps at 50 entries", () => {
    clearRecentSecurityEvents();
    for (let i = 0; i < 60; i++) {
      logSecurityEvent("CACHE_INVALIDATED", {
        user: `admin-${i}`,
        status: "SUCCESS",
      });
    }
    const all = getRecentSecurityEvents(100);
    assert.equal(all.length, 50);
    assert.equal(all[0]?.user, "admin-59");
    assert.equal(all[49]?.user, "admin-10");
    clearRecentSecurityEvents();
  });
});

describe("computeContentSeoHealth", () => {
  it("detects missing covers, short summaries, and invalid video URLs", () => {
    const health = computeContentSeoHealth(
      [
        {
          slug: "good-project",
          status: "published",
          featured: true,
          coverImage: { src: "/uploads/cover.webp", alt: "Cover" },
          summary: "Automated lead routing and SLA escalation across multi-region queues.",
          videos: [],
        },
        {
          slug: "needs-work",
          status: "draft",
          featured: false,
          summary: "Too short",
          videos: [
            {
              title: "Broken",
              youtubeUrl: "https://example.com/not-youtube",
              parsed: { ok: false, reason: "Invalid YouTube URL" },
            },
          ],
        },
      ],
      { fileCount: 3, totalBytes: 1048576, totalMb: 1 }
    );

    assert.equal(health.totalProjects, 2);
    assert.equal(health.publishedCount, 1);
    assert.equal(health.draftCount, 1);
    assert.equal(health.featuredCount, 1);
    assert.equal(health.missingCoverCount, 1);
    assert.deepEqual(health.missingCoverSlugs, ["needs-work"]);
    assert.equal(health.shortSummaryCount, 1);
    assert.equal(health.invalidVideoCount, 1);
    assert.equal(health.indexedRoutesEstimate, 7);
    assert.equal(health.media.fileCount, 3);
  });
});
