import fs from "node:fs/promises";
import path from "node:path";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db/connection";
import { AnalyticsDailyModel } from "@/lib/db/models/AnalyticsDaily";
import { ExperienceModel } from "@/lib/db/models/Experience";
import { ExpertiseModel } from "@/lib/db/models/Expertise";
import { ProjectModel } from "@/lib/db/models/Project";
import {
  getRepositoryCacheDiagnostics,
  type RepositoryCacheDiagnostics,
  type ResolvedDbProject,
} from "@/lib/db/repository";
import { getRecentSecurityEvents, type AuditLogEntry } from "@/lib/security/audit";
import { getRateLimitStats } from "@/lib/security/rate-limit";

export interface MediaStorageStats {
  fileCount: number;
  totalBytes: number;
  totalMb: number;
}

export interface ContentSeoHealth {
  totalProjects: number;
  publishedCount: number;
  draftCount: number;
  featuredCount: number;
  missingCoverCount: number;
  shortSummaryCount: number;
  invalidVideoCount: number;
  missingCoverSlugs: string[];
  shortSummarySlugs: string[];
  invalidVideoSlugs: string[];
  indexedRoutesEstimate: number;
  media: MediaStorageStats;
}

export interface SystemDiagnostics {
  generatedAt: string;
  database: {
    status: "connected" | "connecting" | "disconnected" | "fallback";
    latencyMs: number | null;
    collections: {
      projects: number;
      experience: number;
      expertise: number;
      analyticsDaily: number;
    };
  };
  cache: RepositoryCacheDiagnostics;
  runtime: {
    nextVersion: string;
    reactVersion: string;
    nodeVersion: string;
    nodeEnv: string;
    uptimeSeconds: number;
    memory: {
      rssMb: number;
      heapUsedMb: number;
      heapTotalMb: number;
      heapPct: number;
    };
  };
  contentHealth: ContentSeoHealth;
  security: {
    authSecretConfigured: boolean;
    cookiePolicy: string;
    cspEnforced: boolean;
    activeRateLimitBuckets: number;
    lockedRateLimitBuckets: number;
    recentEvents: AuditLogEntry[];
  };
}

export function computeContentSeoHealth(
  projects: Pick<
    ResolvedDbProject,
    "slug" | "status" | "featured" | "coverImage" | "summary" | "videos"
  >[],
  media: MediaStorageStats
): ContentSeoHealth {
  let publishedCount = 0;
  let draftCount = 0;
  let featuredCount = 0;
  const missingCoverSlugs: string[] = [];
  const shortSummarySlugs: string[] = [];
  const invalidVideoSlugs: string[] = [];

  for (const project of projects) {
    if (project.status === "published") publishedCount += 1;
    else draftCount += 1;

    if (project.featured) featuredCount += 1;

    const hasValidYouTube = project.videos?.some((v) => v.parsed?.ok);
    if (!project.coverImage?.src && !hasValidYouTube) {
      missingCoverSlugs.push(project.slug);
    }

    if (!project.summary || project.summary.trim().length < 20) {
      shortSummarySlugs.push(project.slug);
    }

    if (project.videos?.some((v) => v.youtubeUrl && !v.parsed?.ok)) {
      invalidVideoSlugs.push(project.slug);
    }
  }

  return {
    totalProjects: projects.length,
    publishedCount,
    draftCount,
    featuredCount,
    missingCoverCount: missingCoverSlugs.length,
    shortSummaryCount: shortSummarySlugs.length,
    invalidVideoCount: invalidVideoSlugs.length,
    missingCoverSlugs,
    shortSummarySlugs,
    invalidVideoSlugs,
    // 6 static public routes (/, /portfolio, /expertise, /experience, /about, /contact) + published projects
    indexedRoutesEstimate: 6 + publishedCount,
    media,
  };
}

async function inspectMediaStorage(): Promise<MediaStorageStats> {
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  try {
    const entries = await fs.readdir(uploadsDir);
    const visible = entries.filter((name) => !name.startsWith("."));
    const stats = await Promise.all(
      visible.map(async (name) => {
        const safeBase = path.basename(name);
        try {
          const st = await fs.stat(path.join(uploadsDir, safeBase));
          return st.isFile() ? st.size : 0;
        } catch {
          return 0;
        }
      })
    );
    const totalBytes = stats.reduce((sum, s) => sum + s, 0);
    return {
      fileCount: visible.length,
      totalBytes,
      totalMb: Number((totalBytes / (1024 * 1024)).toFixed(2)),
    };
  } catch {
    return { fileCount: 0, totalBytes: 0, totalMb: 0 };
  }
}

export async function getSystemDiagnostics(
  projects: ResolvedDbProject[]
): Promise<SystemDiagnostics> {
  let dbStatus: SystemDiagnostics["database"]["status"] = "fallback";
  let latencyMs: number | null = null;
  const collections = {
    projects: 0,
    experience: 0,
    expertise: 0,
    analyticsDaily: 0,
  };

  try {
    const conn = await connectDB();
    if (conn && mongoose.connection.readyState === 1 && mongoose.connection.db) {
      dbStatus = "connected";
      const started = performance.now();
      await mongoose.connection.db.admin().ping();
      latencyMs = Math.max(1, Math.round(performance.now() - started));

      const [projCount, expCount, extCount, analyticsCount] = await Promise.all([
        ProjectModel.estimatedDocumentCount(),
        ExperienceModel.estimatedDocumentCount(),
        ExpertiseModel.estimatedDocumentCount(),
        AnalyticsDailyModel.estimatedDocumentCount(),
      ]);
      collections.projects = projCount;
      collections.experience = expCount;
      collections.expertise = extCount;
      collections.analyticsDaily = analyticsCount;
    } else if (mongoose.connection.readyState === 2) {
      dbStatus = "connecting";
    } else if (process.env.MONGODB_URI) {
      dbStatus = "disconnected";
    }
  } catch {
    dbStatus = process.env.MONGODB_URI ? "disconnected" : "fallback";
  }

  const mem = process.memoryUsage();
  const toMb = (bytes: number) => Number((bytes / (1024 * 1024)).toFixed(1));
  const heapUsedMb = toMb(mem.heapUsed);
  const heapTotalMb = toMb(mem.heapTotal);
  const heapPct = mem.heapTotal > 0 ? Math.round((mem.heapUsed / mem.heapTotal) * 100) : 0;

  const [media, rateLimit] = await Promise.all([
    inspectMediaStorage(),
    Promise.resolve(getRateLimitStats()),
  ]);

  return {
    generatedAt: new Date().toISOString(),
    database: {
      status: dbStatus,
      latencyMs,
      collections,
    },
    cache: getRepositoryCacheDiagnostics(),
    runtime: {
      nextVersion: "16.4.3",
      reactVersion: "19.3.1",
      nodeVersion: process.version,
      nodeEnv: process.env.NODE_ENV || "development",
      uptimeSeconds: Math.round(process.uptime()),
      memory: {
        rssMb: toMb(mem.rss),
        heapUsedMb,
        heapTotalMb,
        heapPct,
      },
    },
    contentHealth: computeContentSeoHealth(projects, media),
    security: {
      authSecretConfigured: Boolean(process.env.AUTH_SECRET),
      cookiePolicy: "HttpOnly · SameSite=Lax",
      cspEnforced: true,
      activeRateLimitBuckets: rateLimit.activeBuckets,
      lockedRateLimitBuckets: rateLimit.lockedBuckets,
      recentEvents: getRecentSecurityEvents(10),
    },
  };
}
