import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  Cpu,
  Database,
  Eye,
  Folder,
  ImageIcon,
  Plus,
  Server,
  ShieldCheck,
  User,
  Users,
} from "@/components/Icons";
import { CacheFlushButton } from "@/components/admin/SystemDiagnosticsPanel";
import { TrafficAnalyticsPanel } from "@/components/admin/TrafficAnalyticsPanel";
import { getSystemDiagnostics } from "@/lib/admin/diagnostics";
import { getTrafficAnalytics } from "@/lib/analytics/service";
import {
  getDbExperience,
  getDbExpertise,
  getDbProfile,
  getDbProjects,
} from "@/lib/db/repository";

export const dynamic = "force-dynamic";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e5f5b] focus-visible:ring-offset-2";

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m ${seconds % 60}s`;
}

function formatEventTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default async function AdminDashboardPage() {
  const [projects, profile, experience, expertise, analytics] = await Promise.all([
    getDbProjects(),
    getDbProfile(),
    getDbExperience(),
    getDbExpertise(),
    getTrafficAnalytics("30d"),
  ]);

  const diagnostics = await getSystemDiagnostics(projects);

  const publishedCount = diagnostics.contentHealth.publishedCount;
  const draftCount = diagnostics.contentHealth.draftCount;
  const totalEmployers = experience.employers?.length || 0;
  const totalAreas = expertise.areas?.length || 0;
  const totalCredentials =
    (experience.certifications?.length || 0) + (experience.courseCertificates?.length || 0);

  const freshCacheSlots = Object.values(diagnostics.cache.slots).filter(
    (slot) => slot.status === "fresh"
  ).length;

  const dbConnected = diagnostics.database.status === "connected";

  const seoIssues =
    diagnostics.contentHealth.missingCoverCount +
    diagnostics.contentHealth.shortSummaryCount +
    diagnostics.contentHealth.invalidVideoCount;

  const publishedPct = projects.length > 0 ? Math.round((publishedCount / projects.length) * 100) : 0;
  const cacheWarmPct = Math.round((freshCacheSlots / 4) * 100);

  const kpiCards = [
    {
      label: "30D Pageviews",
      value: analytics.totals.views.toLocaleString(),
      detail:
        analytics.totals.viewsDeltaPct !== null
          ? `${analytics.totals.viewsDeltaPct >= 0 ? "+" : ""}${analytics.totals.viewsDeltaPct}% vs prev 30d`
          : `${analytics.totals.avgDailyViews} avg/day`,
      icon: Eye,
      barPct: analytics.totals.views > 0 ? 100 : 8,
      accent: "bg-[#0e5f5b]",
    },
    {
      label: "30D Visitors",
      value: analytics.totals.visitors.toLocaleString(),
      detail: analytics.totals.peakDay
        ? `Peak ${analytics.totals.peakDay.views} (${analytics.totals.peakDay.date.slice(5)})`
        : "Privacy-first hashes",
      icon: Users,
      barPct: analytics.totals.visitors > 0 ? 100 : 8,
      accent: "bg-[#d97706]",
    },
    {
      label: "Published",
      value: `${publishedCount}/${projects.length}`,
      detail: `${draftCount} draft · ${diagnostics.contentHealth.featuredCount} featured`,
      icon: Folder,
      barPct: publishedPct,
      accent: "bg-[#0e5f5b]",
    },
    {
      label: "DB & Cache",
      value: diagnostics.database.latencyMs !== null ? `${diagnostics.database.latencyMs}ms` : "Fallback",
      detail: `${freshCacheSlots}/4 warm · TTL ${diagnostics.cache.ttlSeconds}s`,
      icon: Database,
      barPct: cacheWarmPct,
      accent: dbConnected ? "bg-emerald-600" : "bg-amber-600",
    },
    {
      label: "Heap / RSS",
      value: `${diagnostics.runtime.memory.heapUsedMb}MB`,
      detail: `RSS ${diagnostics.runtime.memory.rssMb}MB · up ${formatUptime(diagnostics.runtime.uptimeSeconds)}`,
      icon: Cpu,
      barPct: Math.min(100, Math.max(8, diagnostics.runtime.memory.heapPct)),
      accent: "bg-[#1f7a74]",
    },
    {
      label: "Media & SEO",
      value: `${diagnostics.contentHealth.media.fileCount} files`,
      detail: `${diagnostics.contentHealth.media.totalMb}MB · ${seoIssues === 0 ? "SEO Pass" : `${seoIssues} warn`}`,
      icon: ImageIcon,
      barPct: seoIssues === 0 ? 100 : 65,
      accent: seoIssues === 0 ? "bg-emerald-600" : "bg-amber-500",
    },
  ];

  const quickActions = [
    { href: "/admin/profile", title: "Profile & Site", sub: "Bio, hero & CV", icon: User },
    { href: "/admin/projects", title: "Projects", sub: `${projects.length} total`, icon: Folder },
    { href: "/admin/experience", title: "Experience", sub: `${totalEmployers} roles`, icon: Briefcase },
    { href: "/admin/media", title: "Media Library", sub: `${diagnostics.contentHealth.media.totalMb}MB`, icon: ImageIcon },
  ];

  const healthChecks = [
    {
      label: "Cover Media",
      ok: diagnostics.contentHealth.missingCoverCount === 0,
      detail:
        diagnostics.contentHealth.missingCoverCount === 0
          ? "All projects covered"
          : `${diagnostics.contentHealth.missingCoverCount} missing`,
    },
    {
      label: "SEO Summary (>=20c)",
      ok: diagnostics.contentHealth.shortSummaryCount === 0,
      detail:
        diagnostics.contentHealth.shortSummaryCount === 0
          ? "All summaries valid"
          : `${diagnostics.contentHealth.shortSummaryCount} short`,
    },
    {
      label: "YouTube Embeds",
      ok: diagnostics.contentHealth.invalidVideoCount === 0,
      detail:
        diagnostics.contentHealth.invalidVideoCount === 0
          ? "All URLs valid"
          : `${diagnostics.contentHealth.invalidVideoCount} invalid`,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Executive Command Header */}
      <section
        aria-labelledby="dashboard-welcome-heading"
        className="relative overflow-hidden rounded-2xl border border-[#0a4744] bg-gradient-to-r from-[#0e5f5b] via-[#0b4d4a] to-[#083b38] px-4 py-3.5 text-white shadow-md sm:px-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 id="dashboard-welcome-heading" className="text-base font-bold tracking-tight text-white">
              {profile.name}
            </h2>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
              <span
                className={`size-1.5 rounded-full ${
                  dbConnected ? "bg-emerald-300 shadow-[0_0_6px_#6ee7b7]" : "bg-amber-300"
                }`}
              />
              {dbConnected ? `DB ${diagnostics.database.latencyMs ?? 0}ms` : `DB ${diagnostics.database.status}`}
            </span>
            <span className="rounded-md border border-white/15 bg-white/10 px-2 py-0.5 font-mono text-[10px] uppercase text-white/90">
              {diagnostics.runtime.nodeEnv}
            </span>
            <span className="hidden rounded-md border border-white/15 bg-white/10 px-2 py-0.5 font-mono text-[10px] text-white/90 md:inline-block">
              Next {diagnostics.runtime.nextVersion} · Node {diagnostics.runtime.nodeVersion}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <CacheFlushButton variant="dark" />
            <Link
              href="/admin/projects/new"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-[#0a4744] shadow-sm transition-all duration-150 hover:bg-[#e1eeec] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e5f5b]"
            >
              <Plus className="size-3.5" />
              <span>New Project</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 6-Column Executive KPI Strip */}
      <section
        aria-label="Key telemetry metrics"
        className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6"
      >
        {kpiCards.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className="group relative overflow-hidden rounded-xl border border-[#e2ddd3] bg-white px-3.5 py-3 shadow-[0_1px_3px_rgba(25,28,32,0.04)] transition-all duration-200 hover:border-[#b9d6d2] hover:shadow-[0_4px_12px_rgba(14,95,91,0.08)]"
            >
              <div className="flex items-center justify-between gap-1.5">
                <span className="truncate font-mono text-[10px] font-semibold uppercase tracking-wider text-[#4c535b]">
                  {metric.label}
                </span>
                <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-lg bg-[#0e5f5b]/10 text-[#0e5f5b] transition-colors group-hover:bg-[#0e5f5b] group-hover:text-white">
                  <Icon className="size-3.5" />
                </span>
              </div>
              <p className="mt-1.5 text-xl font-bold tabular-nums tracking-tight text-[#191c20]">
                {metric.value}
              </p>
              <p className="mt-0.5 truncate font-mono text-[10px] text-[#646b73]">{metric.detail}</p>
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-[#f3efe8]">
                <div
                  className={`h-full rounded-full ${metric.accent} transition-all duration-300`}
                  style={{ width: `${Math.min(100, Math.max(6, metric.barPct))}%` }}
                />
              </div>
            </div>
          );
        })}
      </section>

      {/* Main Bento Row 1: Traffic (8 cols) + System/SEO/Security Stack (4 cols) */}
      <div className="grid gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <TrafficAnalyticsPanel initialData={analytics} />
        </div>

        <div className="space-y-4 xl:col-span-4">
          {/* Content, SEO & Media Health */}
          <section className="overflow-hidden rounded-2xl border border-[#e2ddd3] bg-white shadow-[0_1px_3px_rgba(25,28,32,0.04)] transition-shadow duration-200 hover:shadow-[0_4px_14px_rgba(25,28,32,0.06)]">
            <div className="flex items-center justify-between border-b border-[#e6e1d8] bg-gradient-to-r from-[#faf8f4] to-white px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex size-6 items-center justify-center rounded-lg bg-[#0e5f5b]/10 text-[#0e5f5b]">
                  <Activity className="size-3.5" />
                </span>
                <h3 className="text-xs font-semibold text-[#191c20]">Content & SEO Audit</h3>
              </div>
              <span className="rounded bg-[#faf8f4] px-1.5 py-0.5 font-mono text-[10px] text-[#4c535b] ring-1 ring-[#e6e1d8]">
                ~{diagnostics.contentHealth.indexedRoutesEstimate} routes
              </span>
            </div>
            <div className="divide-y divide-[#e6e1d8]">
              {healthChecks.map((check) => (
                <div
                  key={check.label}
                  className="flex items-center justify-between gap-2 px-4 py-2 transition-colors hover:bg-[#faf8f4]/70"
                >
                  <div className="min-w-0">
                    <span className="text-xs font-medium text-[#191c20]">{check.label}</span>
                    <span className="ml-2 text-[11px] text-[#646b73]">{check.detail}</span>
                  </div>
                  {check.ok ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[#e1eeec] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#0a4744]">
                      <CheckCircle2 className="size-3" />
                      PASS
                    </span>
                  ) : (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[#fbf1df] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#82540a]">
                      <AlertTriangle className="size-3" />
                      WARN
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* DB Collections & Cache Slots */}
          <section className="overflow-hidden rounded-2xl border border-[#e2ddd3] bg-white shadow-[0_1px_3px_rgba(25,28,32,0.04)] transition-shadow duration-200 hover:shadow-[0_4px_14px_rgba(25,28,32,0.06)]">
            <div className="flex items-center justify-between border-b border-[#e6e1d8] bg-gradient-to-r from-[#faf8f4] to-white px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex size-6 items-center justify-center rounded-lg bg-[#0e5f5b]/10 text-[#0e5f5b]">
                  <Server className="size-3.5" />
                </span>
                <h3 className="text-xs font-semibold text-[#191c20]">MongoDB & Cache Slots</h3>
              </div>
              <span className="font-mono text-[10px] text-[#4c535b]">
                TTL {diagnostics.cache.ttlSeconds}s
              </span>
            </div>
            <div className="space-y-2.5 p-3.5">
              <div className="grid grid-cols-4 gap-2">
                {[
                  { name: "proj", count: diagnostics.database.collections.projects },
                  { name: "exp", count: diagnostics.database.collections.experience },
                  { name: "dom", count: diagnostics.database.collections.expertise },
                  { name: "traf", count: diagnostics.database.collections.analyticsDaily },
                ].map((col) => (
                  <div
                    key={col.name}
                    className="rounded-lg border border-[#e6e1d8] bg-[#faf8f4] px-2 py-1.5 text-center"
                  >
                    <span className="block font-mono text-[9px] uppercase text-[#646b73]">
                      {col.name}
                    </span>
                    <span className="font-mono text-xs font-bold tabular-nums text-[#191c20]">
                      {col.count}
                    </span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {Object.entries(diagnostics.cache.slots).map(([slotName, slot]) => (
                  <div
                    key={slotName}
                    className="flex items-center justify-between rounded-lg border border-[#e6e1d8] px-2.5 py-1"
                  >
                    <span className="font-mono text-[10px] font-medium text-[#191c20]">{slotName}</span>
                    <span
                      className={`rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase ${
                        slot.status === "fresh"
                          ? "bg-[#e1eeec] text-[#0a4744]"
                          : slot.status === "stale"
                            ? "bg-[#fbf1df] text-[#82540a]"
                            : "bg-[#f3efe8] text-[#646b73]"
                      }`}
                    >
                      {slot.status === "fresh" ? `${slot.expiresInSeconds}s` : slot.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Security Posture & Recent Audit Events */}
          <section className="overflow-hidden rounded-2xl border border-[#e2ddd3] bg-white shadow-[0_1px_3px_rgba(25,28,32,0.04)] transition-shadow duration-200 hover:shadow-[0_4px_14px_rgba(25,28,32,0.06)]">
            <div className="flex items-center justify-between border-b border-[#e6e1d8] bg-gradient-to-r from-[#faf8f4] to-white px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex size-6 items-center justify-center rounded-lg bg-[#0e5f5b]/10 text-[#0e5f5b]">
                  <ShieldCheck className="size-3.5" />
                </span>
                <h3 className="text-xs font-semibold text-[#191c20]">Security & Audit</h3>
              </div>
              <span className="font-mono text-[10px] text-[#4c535b]">
                {diagnostics.security.activeRateLimitBuckets} buckets
              </span>
            </div>
            <div className="space-y-2.5 p-3.5">
              <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                <span
                  className={`rounded px-1.5 py-0.5 font-semibold ${
                    diagnostics.security.authSecretConfigured
                      ? "bg-[#e1eeec] text-[#0a4744]"
                      : "bg-[#fde8e8] text-[#9b1c1c]"
                  }`}
                >
                  SECRET: {diagnostics.security.authSecretConfigured ? "OK" : "EPHEMERAL"}
                </span>
                <span className="rounded bg-[#faf8f4] px-1.5 py-0.5 text-[#4c535b] ring-1 ring-[#e6e1d8]">
                  CSP: &apos;self&apos;
                </span>
                <span className="rounded bg-[#faf8f4] px-1.5 py-0.5 text-[#4c535b] ring-1 ring-[#e6e1d8]">
                  HttpOnly
                </span>
              </div>

              {diagnostics.security.recentEvents.length === 0 ? (
                <p className="rounded-lg border border-dashed border-[#d4cdc0] bg-[#faf8f4] px-2.5 py-2 font-mono text-[11px] text-[#646b73]">
                  No audit events in current process yet.
                </p>
              ) : (
                <ul className="divide-y divide-[#e6e1d8] rounded-lg border border-[#e6e1d8]">
                  {diagnostics.security.recentEvents.slice(0, 4).map((evt, idx) => (
                    <li
                      key={`${evt.timestamp}-${evt.action}-${idx}`}
                      className="flex items-center justify-between gap-2 px-2.5 py-1.5 text-[11px] transition-colors hover:bg-[#faf8f4]"
                    >
                      <span className="truncate font-mono font-medium text-[#191c20]">
                        {evt.action}
                      </span>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <span
                          className={`rounded px-1 py-0.5 font-mono text-[9px] font-semibold ${
                            evt.status === "SUCCESS"
                              ? "bg-[#e1eeec] text-[#0a4744]"
                              : evt.status === "WARNING"
                                ? "bg-[#fbf1df] text-[#82540a]"
                                : "bg-[#fde8e8] text-[#9b1c1c]"
                          }`}
                        >
                          {evt.status}
                        </span>
                        <span className="font-mono text-[10px] tabular-nums text-[#646b73]">
                          {formatEventTime(evt.timestamp)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Main Bento Row 2: Recent Projects Data Table (8 cols) + Quick Access & Inventory (4 cols) */}
      <div className="grid gap-4 xl:grid-cols-12">
        {/* Recent Portfolio Projects Table */}
        <section
          aria-labelledby="recent-projects-heading"
          className="overflow-hidden rounded-2xl border border-[#e2ddd3] bg-white shadow-[0_1px_3px_rgba(25,28,32,0.04)] xl:col-span-8"
        >
          <div className="flex items-center justify-between border-b border-[#e6e1d8] bg-gradient-to-r from-[#faf8f4] to-white px-4 py-2.5">
            <h3 id="recent-projects-heading" className="text-xs font-semibold text-[#191c20]">
              Recent Portfolio Projects
            </h3>
            <Link
              href="/admin/projects"
              className={`inline-flex cursor-pointer items-center gap-1 font-mono text-[11px] font-semibold text-[#0e5f5b] hover:underline ${focusRing}`}
            >
              <span>View all ({projects.length})</span>
              <ArrowRight className="size-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#e6e1d8] bg-[#faf8f4]/60 font-mono text-[10px] uppercase tracking-wider text-[#646b73]">
                <tr>
                  <th className="px-4 py-2 font-semibold">Project</th>
                  <th className="hidden px-3 py-2 font-semibold sm:table-cell">Category</th>
                  <th className="px-3 py-2 font-semibold">Status</th>
                  <th className="px-4 py-2 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6e1d8]">
                {projects.slice(0, 6).map((project) => (
                  <tr
                    key={project.slug}
                    className="transition-colors duration-150 hover:bg-[#faf8f4]"
                  >
                    <td className="max-w-[260px] px-4 py-2.5">
                      <p className="truncate font-semibold text-[#191c20]">{project.title}</p>
                      {project.tools?.length ? (
                        <p className="truncate font-mono text-[10px] text-[#646b73]">
                          {project.tools.slice(0, 3).join(" · ")}
                        </p>
                      ) : null}
                    </td>
                    <td className="hidden px-3 py-2.5 text-[11px] text-[#4c535b] sm:table-cell">
                      {project.category}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold uppercase ${
                            project.status === "published"
                              ? "bg-[#e1eeec] text-[#0a4744]"
                              : "bg-[#fbf1df] text-[#82540a]"
                          }`}
                        >
                          {project.status}
                        </span>
                        {project.featured ? (
                          <span className="rounded-md border border-indigo-200 bg-indigo-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase text-indigo-800">
                            Featured
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <a
                          href={`/portfolio/${project.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[#e6e1d8] bg-white px-2.5 py-1 text-[11px] font-medium text-[#191c20] transition-colors hover:border-[#0e5f5b] hover:bg-[#faf8f4] ${focusRing}`}
                        >
                          <span>Preview</span>
                          <ArrowUpRight className="size-3 text-[#4c535b]" />
                        </a>
                        <Link
                          href={`/admin/projects/${project._id || project.slug}`}
                          className={`inline-flex cursor-pointer items-center rounded-lg bg-[#e1eeec] px-2.5 py-1 text-[11px] font-semibold text-[#0a4744] transition-colors hover:bg-[#b9d6d2] ${focusRing}`}
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Quick Access + Portfolio Inventory */}
        <section
          aria-labelledby="quick-access-heading"
          className="flex flex-col justify-between gap-3 rounded-2xl border border-[#e2ddd3] bg-white p-4 shadow-[0_1px_3px_rgba(25,28,32,0.04)] xl:col-span-4"
        >
          <div>
            <h3
              id="quick-access-heading"
              className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#4c535b]"
            >
              Quick Access
            </h3>
            <div className="mt-2.5 grid grid-cols-2 gap-2.5">
              {quickActions.map((card) => {
                const Icon = card.icon;
                return (
                  <Link
                    key={card.href}
                    href={card.href}
                    className={`group flex cursor-pointer items-center gap-2.5 rounded-xl border border-[#e6e1d8] bg-[#faf8f4] p-3 transition-all duration-150 hover:border-[#0e5f5b] hover:bg-white hover:shadow-sm ${focusRing}`}
                  >
                    <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#0e5f5b] ring-1 ring-[#e6e1d8] transition-colors group-hover:bg-[#0e5f5b] group-hover:text-white group-hover:ring-[#0e5f5b]">
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <span className="block truncate text-xs font-semibold text-[#191c20] group-hover:text-[#0e5f5b]">
                        {card.title}
                      </span>
                      <span className="block truncate font-mono text-[10px] text-[#646b73]">
                        {card.sub}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-[#e6e1d8] bg-gradient-to-br from-[#faf8f4] to-white p-3">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#4c535b]">
              Portfolio Inventory
            </p>
            <div className="mt-2 grid grid-cols-3 gap-2 text-center font-mono">
              <div className="rounded-lg bg-white px-2 py-2 ring-1 ring-[#e6e1d8]">
                <span className="block text-base font-bold tabular-nums text-[#191c20]">
                  {totalEmployers}
                </span>
                <span className="text-[10px] text-[#646b73]">Roles</span>
              </div>
              <div className="rounded-lg bg-white px-2 py-2 ring-1 ring-[#e6e1d8]">
                <span className="block text-base font-bold tabular-nums text-[#191c20]">
                  {totalAreas}
                </span>
                <span className="text-[10px] text-[#646b73]">Domains</span>
              </div>
              <div className="rounded-lg bg-white px-2 py-2 ring-1 ring-[#e6e1d8]">
                <span className="block text-base font-bold tabular-nums text-[#191c20]">
                  {totalCredentials}
                </span>
                <span className="text-[10px] text-[#646b73]">Certs</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
