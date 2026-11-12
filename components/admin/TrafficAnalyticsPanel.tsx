"use client";

import { useState } from "react";
import {
  Activity,
  Globe,
  Laptop,
  RefreshCw,
  Smartphone,
  Tablet,
  TrendingDown,
  TrendingUp,
} from "@/components/Icons";
import type { AnalyticsRange } from "@/lib/analytics/helpers";
import type { TrafficAnalyticsSummary } from "@/lib/analytics/service";

interface TrafficAnalyticsPanelProps {
  initialData: TrafficAnalyticsSummary;
}

const RANGES: Array<{ value: AnalyticsRange; label: string }> = [
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
];

function formatShortDate(dateKey: string): string {
  const parts = dateKey.split("-");
  if (parts.length !== 3) return dateKey;
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthIdx = Number(parts[1]) - 1;
  const day = Number(parts[2]);
  return `${monthNames[monthIdx] || parts[1]} ${day}`;
}

function DeltaBadge({ delta }: { delta: number | null }) {
  if (delta === null) return null;
  const positive = delta >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold tabular-nums ${
        positive ? "bg-[#e1eeec] text-[#0a4744]" : "bg-[#fde8e8] text-[#9b1c1c]"
      }`}
    >
      {positive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
      {positive ? `+${delta}%` : `${delta}%`}
    </span>
  );
}

export function TrafficAnalyticsPanel({ initialData }: TrafficAnalyticsPanelProps) {
  const [data, setData] = useState<TrafficAnalyticsSummary>(initialData);
  const [loadingRange, setLoadingRange] = useState<AnalyticsRange | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  async function handleRangeChange(range: AnalyticsRange) {
    if (range === data.range && !loadingRange) return;
    setLoadingRange(range);
    setHoverIndex(null);
    try {
      const res = await fetch(`/api/admin/analytics?range=${range}`, { cache: "no-store" });
      if (res.ok) {
        const next = (await res.json()) as TrafficAnalyticsSummary;
        setData(next);
      }
    } finally {
      setLoadingRange(null);
    }
  }

  const points = data.daily;
  const maxVal = Math.max(4, ...points.map((p) => Math.max(p.views, p.visitors)));
  const width = 720;
  const height = 148;
  const padX = 10;
  const padTop = 12;
  const padBottom = 14;
  const plotW = width - padX * 2;
  const plotH = height - padTop - padBottom;

  const coords = points.map((p, idx) => {
    const x = points.length <= 1 ? padX + plotW / 2 : padX + (idx / (points.length - 1)) * plotW;
    const yViews = padTop + plotH - (p.views / maxVal) * plotH;
    const yVisitors = padTop + plotH - (p.visitors / maxVal) * plotH;
    return { x, yViews, yVisitors, ...p };
  });

  const viewsLinePath =
    coords.length > 0
      ? coords.map((pt, i) => `${i === 0 ? "M" : "L"}${pt.x.toFixed(1)},${pt.yViews.toFixed(1)}`).join(" ")
      : "";
  const visitorsLinePath =
    coords.length > 0
      ? coords.map((pt, i) => `${i === 0 ? "M" : "L"}${pt.x.toFixed(1)},${pt.yVisitors.toFixed(1)}`).join(" ")
      : "";
  const viewsAreaPath =
    coords.length > 0
      ? `${viewsLinePath} L${coords[coords.length - 1].x.toFixed(1)},${(padTop + plotH).toFixed(1)} L${coords[0].x.toFixed(1)},${(padTop + plotH).toFixed(1)} Z`
      : "";

  const activePoint = hoverIndex !== null ? coords[hoverIndex] : null;
  const firstLabel = points[0]?.date ? formatShortDate(points[0].date) : "";
  const midLabel = points[Math.floor(points.length / 2)]?.date
    ? formatShortDate(points[Math.floor(points.length / 2)].date)
    : "";
  const lastLabel = points[points.length - 1]?.date ? formatShortDate(points[points.length - 1].date) : "";

  const deviceIcons = {
    desktop: Laptop,
    mobile: Smartphone,
    tablet: Tablet,
  };

  return (
    <section
      aria-labelledby="traffic-analytics-heading"
      className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#e2ddd3] bg-white shadow-[0_1px_3px_rgba(25,28,32,0.04)] transition-shadow duration-200 hover:shadow-[0_4px_14px_rgba(25,28,32,0.06)]"
    >
      {/* Premium Gradient Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e6e1d8] bg-gradient-to-r from-[#faf8f4] to-white px-4 py-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex size-8 items-center justify-center rounded-xl bg-[#0e5f5b]/10 text-[#0e5f5b] ring-1 ring-[#0e5f5b]/15">
            <Activity className="size-4" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 id="traffic-analytics-heading" className="text-sm font-semibold text-[#191c20]">
                Traffic Telemetry
              </h3>
              <DeltaBadge delta={data.totals.viewsDeltaPct} />
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-2 font-mono text-[11px] text-[#4c535b]">
              <span className="tabular-nums">
                <strong className="text-[#191c20]">{data.totals.views.toLocaleString()}</strong> views
              </span>
              <span className="text-[#d4cdc0]">·</span>
              <span className="tabular-nums">
                <strong className="text-[#191c20]">{data.totals.visitors.toLocaleString()}</strong> visitors
              </span>
              <span className="hidden text-[#d4cdc0] sm:inline">·</span>
              <span className="hidden tabular-nums sm:inline">
                avg <strong className="text-[#191c20]">{data.totals.avgDailyViews}</strong>/d
              </span>
              {data.totals.peakDay ? (
                <>
                  <span className="hidden text-[#d4cdc0] md:inline">·</span>
                  <span className="hidden tabular-nums md:inline">
                    peak <strong className="text-[#191c20]">{data.totals.peakDay.views}</strong> (
                    {formatShortDate(data.totals.peakDay.date)})
                  </span>
                </>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {loadingRange ? <RefreshCw className="size-3.5 animate-spin text-[#0e5f5b]" /> : null}
          <div
            role="group"
            aria-label="Analytics time range"
            className="inline-flex rounded-xl border border-[#d4cdc0] bg-[#faf8f4] p-0.5"
          >
            {RANGES.map((item) => {
              const active = data.range === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleRangeChange(item.value)}
                  className={`cursor-pointer rounded-lg px-2.5 py-1 font-mono text-[11px] font-semibold transition-all duration-150 ${
                    active
                      ? "bg-[#0e5f5b] text-white shadow-sm"
                      : "text-[#4c535b] hover:bg-white hover:text-[#191c20]"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dual-Series SVG Chart */}
      <div className="border-b border-[#e6e1d8] px-4 py-3.5">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            <span className="inline-flex items-center gap-1.5 font-medium text-[#191c20]">
              <span className="h-0.5 w-3 rounded-full bg-[#0e5f5b]" />
              <span>Pageviews</span>
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium text-[#4c535b]">
              <span className="h-0.5 w-3 border-b-2 border-dashed border-[#d97706]" />
              <span>Visitors</span>
            </span>
            {activePoint ? (
              <span className="rounded-md bg-[#0e5f5b] px-2 py-0.5 font-mono text-[11px] font-medium text-white shadow-sm">
                {formatShortDate(activePoint.date)} · {activePoint.views} views · {activePoint.visitors} visitors
              </span>
            ) : (
              <span className="font-mono text-[11px] text-[#646b73]">
                Hover chart points to inspect
              </span>
            )}
          </div>
          <span className="font-mono text-[10px] text-[#646b73]">0 – {maxVal} / day</span>
        </div>

        {!data.dbConnected ? (
          <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-[#d4cdc0] bg-[#faf8f4] text-xs text-[#4c535b]">
            MongoDB offline — telemetry activates automatically when connected.
          </div>
        ) : (
          <div>
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="h-36 w-full overflow-visible"
              role="img"
              aria-label={`Pageviews and visitors trend over last ${data.days} days`}
              onMouseLeave={() => setHoverIndex(null)}
            >
              <defs>
                <linearGradient id="trafficAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0e5f5b" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#0e5f5b" stopOpacity="0.01" />
                </linearGradient>
              </defs>

              {[0, 0.33, 0.66, 1].map((ratio) => {
                const y = padTop + plotH - ratio * plotH;
                return (
                  <line
                    key={ratio}
                    x1={padX}
                    x2={width - padX}
                    y1={y}
                    y2={y}
                    stroke="#ebe6dd"
                    strokeDasharray={ratio === 0 ? undefined : "3 3"}
                    strokeWidth="1"
                  />
                );
              })}

              {viewsAreaPath ? <path d={viewsAreaPath} fill="url(#trafficAreaGrad)" /> : null}
              {visitorsLinePath ? (
                <path
                  d={visitorsLinePath}
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="1.75"
                  strokeDasharray="4 3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : null}
              {viewsLinePath ? (
                <path
                  d={viewsLinePath}
                  fill="none"
                  stroke="#0e5f5b"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : null}

              {activePoint ? (
                <>
                  <line
                    x1={activePoint.x}
                    x2={activePoint.x}
                    y1={padTop}
                    y2={padTop + plotH}
                    stroke="#0e5f5b"
                    strokeDasharray="3 3"
                    strokeOpacity="0.45"
                    strokeWidth="1"
                  />
                  <circle
                    cx={activePoint.x}
                    cy={activePoint.yVisitors}
                    r="3.5"
                    fill="#d97706"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx={activePoint.x}
                    cy={activePoint.yViews}
                    r="4.5"
                    fill="#0e5f5b"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                </>
              ) : null}

              {coords.map((pt, idx) => {
                const sliceW = coords.length > 1 ? plotW / (coords.length - 1) : plotW;
                return (
                  <rect
                    key={pt.date}
                    x={pt.x - sliceW / 2}
                    y={padTop}
                    width={Math.max(sliceW, 8)}
                    height={plotH}
                    fill="transparent"
                    className="cursor-crosshair"
                    onMouseEnter={() => setHoverIndex(idx)}
                  />
                );
              })}
            </svg>

            <div className="mt-1 flex items-center justify-between px-1 font-mono text-[10px] text-[#646b73]">
              <span>{firstLabel}</span>
              <span>{midLabel}</span>
              <span>{lastLabel}</span>
            </div>
          </div>
        )}
      </div>

      {/* 3-Column Breakdown */}
      <div className="grid flex-1 divide-y divide-[#e6e1d8] md:grid-cols-3 md:divide-x md:divide-y-0">
        {/* Top Routes */}
        <div className="p-4">
          <h4 className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#4c535b]">
            Top Routes & Projects
          </h4>
          {data.topRoutes.length === 0 ? (
            <p className="mt-2.5 text-xs text-[#646b73]">No hits recorded yet.</p>
          ) : (
            <ul className="mt-2.5 space-y-2">
              {data.topRoutes.slice(0, 5).map((route) => (
                <li key={route.path} className="space-y-1">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="truncate font-medium text-[#191c20]" title={route.path}>
                      {route.label}
                    </span>
                    <span className="shrink-0 font-mono text-[11px] tabular-nums text-[#4c535b]">
                      {route.views} ({route.sharePct}%)
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[#f3efe8]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#0e5f5b] to-[#1f7a74] transition-all duration-300"
                      style={{ width: `${Math.max(5, route.sharePct)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Referrers */}
        <div className="p-4">
          <h4 className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#4c535b]">
            Traffic Sources
          </h4>
          {data.topReferrers.length === 0 ? (
            <p className="mt-2.5 text-xs text-[#646b73]">No referrer data yet.</p>
          ) : (
            <ul className="mt-2.5 space-y-2">
              {data.topReferrers.slice(0, 5).map((ref) => (
                <li
                  key={ref.source}
                  className="flex items-center justify-between gap-2 rounded-lg px-1.5 py-1 text-xs transition-colors hover:bg-[#faf8f4]"
                >
                  <span className="inline-flex min-w-0 items-center gap-1.5 font-mono text-[11px] text-[#191c20]">
                    <Globe className="size-3.5 shrink-0 text-[#0e5f5b]" />
                    <span className="truncate">{ref.source}</span>
                  </span>
                  <span className="shrink-0 font-mono text-[11px] tabular-nums text-[#4c535b]">
                    {ref.views} · {ref.sharePct}%
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Devices */}
        <div className="p-4">
          <h4 className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#4c535b]">
            Devices
          </h4>
          <div className="mt-2.5 space-y-2.5">
            {data.devices.map((d) => {
              const Icon = deviceIcons[d.device];
              return (
                <div key={d.device} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1.5 capitalize text-[#191c20]">
                      <Icon className="size-3.5 text-[#0e5f5b]" />
                      <span>{d.device}</span>
                    </span>
                    <span className="font-mono text-[11px] tabular-nums text-[#4c535b]">
                      {d.views} ({d.pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[#f3efe8]">
                    <div
                      className="h-full rounded-full bg-[#1f7a74] transition-all duration-300"
                      style={{ width: `${d.pct > 0 ? Math.max(5, d.pct) : 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
