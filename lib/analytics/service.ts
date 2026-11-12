import { connectDB } from "@/lib/db/connection";
import { AnalyticsDailyModel } from "@/lib/db/models/AnalyticsDaily";
import { getDbProjects } from "@/lib/db/repository";
import {
  createDailyVisitorHash,
  decodeAnalyticsKey,
  detectDeviceType,
  encodeAnalyticsKey,
  extractReferrerHost,
  formatUtcDateKey,
  getRangeDays,
  isLikelyBot,
  normalizeTrackPath,
  type AnalyticsRange,
  type DeviceType,
} from "./helpers";

export interface TrafficDailyPoint {
  date: string;
  views: number;
  visitors: number;
}

export interface TrafficRouteStat {
  path: string;
  label: string;
  views: number;
  sharePct: number;
}

export interface TrafficReferrerStat {
  source: string;
  views: number;
  sharePct: number;
}

export interface TrafficDeviceStat {
  device: DeviceType;
  views: number;
  pct: number;
}

export interface TrafficAnalyticsSummary {
  range: AnalyticsRange;
  days: number;
  dbConnected: boolean;
  hasData: boolean;
  totals: {
    views: number;
    visitors: number;
    avgDailyViews: number;
    peakDay: { date: string; views: number } | null;
    viewsDeltaPct: number | null;
    visitorsDeltaPct: number | null;
  };
  daily: TrafficDailyPoint[];
  topRoutes: TrafficRouteStat[];
  topReferrers: TrafficReferrerStat[];
  devices: TrafficDeviceStat[];
}

export async function recordPageView(input: {
  pathname: unknown;
  referrer?: unknown;
  userAgent?: string;
  ip: string;
  host?: string;
}): Promise<boolean> {
  if (isLikelyBot(input.userAgent)) return false;

  const pathname = normalizeTrackPath(input.pathname);
  if (!pathname) return false;

  const conn = await connectDB();
  if (!conn) return false;

  const dateKey = formatUtcDateKey(new Date());
  const device = detectDeviceType(input.userAgent);
  const referrerHost = extractReferrerHost(input.referrer, input.host);
  const visitorHash = createDailyVisitorHash(dateKey, input.ip, input.userAgent || "");

  const encodedRoute = encodeAnalyticsKey(pathname);
  const encodedReferrer = encodeAnalyticsKey(referrerHost);

  await AnalyticsDailyModel.findOneAndUpdate(
    { date: dateKey },
    {
      $inc: {
        views: 1,
        [`routes.${encodedRoute}`]: 1,
        [`referrers.${encodedReferrer}`]: 1,
        [`devices.${device}`]: 1,
      },
      $addToSet: {
        uniqueVisitorHashes: visitorHash,
      },
    },
    { upsert: true }
  );

  return true;
}

function readMapEntries(
  field: Map<string, number> | Record<string, number> | undefined
): Array<[string, number]> {
  if (!field) return [];
  if (field instanceof Map) {
    return Array.from(field.entries());
  }
  return Object.entries(field);
}

function computeDeltaPct(current: number, previous: number): number | null {
  if (previous <= 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 100);
}

function buildDateWindow(days: number, offsetDays = 0): string[] {
  const now = new Date();
  const keys: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i - offsetDays));
    keys.push(formatUtcDateKey(d));
  }
  return keys;
}

const STATIC_ROUTE_LABELS: Record<string, string> = {
  "/": "Home",
  "/portfolio": "Portfolio Index",
  "/expertise": "Expertise",
  "/experience": "Experience",
  "/about": "About",
  "/contact": "Contact",
};

export async function getTrafficAnalytics(range: AnalyticsRange = "30d"): Promise<TrafficAnalyticsSummary> {
  const days = getRangeDays(range);
  const currentDates = buildDateWindow(days, 0);
  const previousDates = buildDateWindow(days, days);
  const earliestDate = previousDates[0];

  const emptyResult: TrafficAnalyticsSummary = {
    range,
    days,
    dbConnected: false,
    hasData: false,
    totals: {
      views: 0,
      visitors: 0,
      avgDailyViews: 0,
      peakDay: null,
      viewsDeltaPct: null,
      visitorsDeltaPct: null,
    },
    daily: currentDates.map((date) => ({ date, views: 0, visitors: 0 })),
    topRoutes: [],
    topReferrers: [],
    devices: [
      { device: "desktop", views: 0, pct: 0 },
      { device: "mobile", views: 0, pct: 0 },
      { device: "tablet", views: 0, pct: 0 },
    ],
  };

  try {
    const conn = await connectDB();
    if (!conn) return emptyResult;

    const [docs, projects] = await Promise.all([
      AnalyticsDailyModel.find({ date: { $gte: earliestDate } })
        .select("date views uniqueVisitorHashes routes referrers devices")
        .lean(),
      getDbProjects(),
    ]);

    const docMap = new Map(docs.map((doc) => [doc.date, doc]));
    const projectTitleBySlug = new Map(projects.map((p) => [p.slug, p.title]));

    const routeTotals = new Map<string, number>();
    const referrerTotals = new Map<string, number>();
    const deviceTotals: Record<DeviceType, number> = { desktop: 0, mobile: 0, tablet: 0 };

    let currentViews = 0;
    let currentVisitors = 0;
    let peakDay: { date: string; views: number } | null = null;

    const daily: TrafficDailyPoint[] = currentDates.map((date) => {
      const doc = docMap.get(date);
      const views = doc?.views || 0;
      const visitors = Array.isArray(doc?.uniqueVisitorHashes) ? doc.uniqueVisitorHashes.length : 0;

      currentViews += views;
      currentVisitors += visitors;

      if (views > 0 && (!peakDay || views > peakDay.views)) {
        peakDay = { date, views };
      }

      if (doc) {
        for (const [rawKey, count] of readMapEntries(doc.routes)) {
          const decoded = decodeAnalyticsKey(rawKey);
          routeTotals.set(decoded, (routeTotals.get(decoded) || 0) + (Number(count) || 0));
        }
        for (const [rawKey, count] of readMapEntries(doc.referrers)) {
          const decoded = decodeAnalyticsKey(rawKey);
          referrerTotals.set(decoded, (referrerTotals.get(decoded) || 0) + (Number(count) || 0));
        }
        deviceTotals.desktop += doc.devices?.desktop || 0;
        deviceTotals.mobile += doc.devices?.mobile || 0;
        deviceTotals.tablet += doc.devices?.tablet || 0;
      }

      return { date, views, visitors };
    });

    let previousViews = 0;
    let previousVisitors = 0;
    for (const date of previousDates) {
      const doc = docMap.get(date);
      if (doc) {
        previousViews += doc.views || 0;
        previousVisitors += Array.isArray(doc.uniqueVisitorHashes) ? doc.uniqueVisitorHashes.length : 0;
      }
    }

    const totalRouteViews = Array.from(routeTotals.values()).reduce((sum, v) => sum + v, 0);
    const topRoutes: TrafficRouteStat[] = Array.from(routeTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([routePath, views]) => {
        let label = STATIC_ROUTE_LABELS[routePath] || routePath;
        if (routePath.startsWith("/portfolio/")) {
          const slug = routePath.slice("/portfolio/".length);
          label = projectTitleBySlug.get(slug) || slug;
        }
        return {
          path: routePath,
          label,
          views,
          sharePct: totalRouteViews > 0 ? Math.round((views / totalRouteViews) * 100) : 0,
        };
      });

    const totalRefViews = Array.from(referrerTotals.values()).reduce((sum, v) => sum + v, 0);
    const topReferrers: TrafficReferrerStat[] = Array.from(referrerTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([source, views]) => ({
        source,
        views,
        sharePct: totalRefViews > 0 ? Math.round((views / totalRefViews) * 100) : 0,
      }));

    const totalDeviceViews = deviceTotals.desktop + deviceTotals.mobile + deviceTotals.tablet;
    const devices: TrafficDeviceStat[] = (["desktop", "mobile", "tablet"] as DeviceType[]).map((device) => ({
      device,
      views: deviceTotals[device],
      pct: totalDeviceViews > 0 ? Math.round((deviceTotals[device] / totalDeviceViews) * 100) : 0,
    }));

    return {
      range,
      days,
      dbConnected: true,
      hasData: currentViews > 0,
      totals: {
        views: currentViews,
        visitors: currentVisitors,
        avgDailyViews: Math.round(currentViews / days),
        peakDay,
        viewsDeltaPct: computeDeltaPct(currentViews, previousViews),
        visitorsDeltaPct: computeDeltaPct(currentVisitors, previousVisitors),
      },
      daily,
      topRoutes,
      topReferrers,
      devices,
    };
  } catch (error) {
    console.warn("Failed to load traffic analytics:", error);
    return emptyResult;
  }
}
