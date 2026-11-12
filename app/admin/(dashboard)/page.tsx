import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  Briefcase,
  Folder,
  ImageIcon,
  Plus,
  User,
} from "@/components/Icons";
import {
  getDbExperience,
  getDbExpertise,
  getDbProfile,
  getDbProjects,
} from "@/lib/db/repository";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e5f5b] focus-visible:ring-offset-2";

export default async function AdminDashboardPage() {
  const [projects, profile, experience, expertise] = await Promise.all([
    getDbProjects(),
    getDbProfile(),
    getDbExperience(),
    getDbExpertise(),
  ]);

  const publishedCount = projects.filter((p) => p.status === "published").length;
  const draftCount = projects.filter((p) => p.status === "draft").length;
  const totalEmployers = experience.employers?.length || 0;
  const totalAreas = expertise.areas?.length || 0;
  const totalCredentials =
    (experience.certifications?.length || 0) + (experience.courseCertificates?.length || 0);

  const metrics = [
    {
      label: "Total Projects",
      value: projects.length,
      detail: `${publishedCount} published · ${draftCount} draft`,
      icon: Folder,
    },
    {
      label: "Employers & Roles",
      value: totalEmployers,
      detail: "Career timeline entries",
      icon: Briefcase,
    },
    {
      label: "Expertise Domains",
      value: totalAreas,
      detail: "CRM automation & data",
      icon: Award,
    },
    {
      label: "Credentials",
      value: totalCredentials,
      detail: "Certifications & courses",
      icon: User,
    },
  ];

  const quickActions = [
    {
      href: "/admin/profile",
      title: "Profile & Site Info",
      description: "Edit bio, job title, contact links, CV download, and home page settings.",
      icon: User,
    },
    {
      href: "/admin/projects",
      title: "Manage Projects",
      description: "Edit walkthrough videos, technical documentation, screenshots, and tools.",
      icon: Folder,
    },
    {
      href: "/admin/experience",
      title: "Experience & Education",
      description: "Update roles, responsibilities, promotion timeline, and credentials.",
      icon: Briefcase,
    },
    {
      href: "/admin/media",
      title: "Media Library",
      description: "Upload validated images, diagrams, and PDF documents securely.",
      icon: ImageIcon,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <section
        aria-labelledby="dashboard-welcome-heading"
        className="flex flex-col gap-5 rounded-2xl border border-[#e6e1d8] bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-8"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0e5f5b]">
            Overview
          </p>
          <h2
            id="dashboard-welcome-heading"
            className="mt-1.5 text-2xl font-bold tracking-tight text-[#191c20]"
          >
            Welcome back, {profile.name}
          </h2>
          <p className="mt-1 text-sm text-[#4c535b]">
            {profile.jobTitle} at {profile.employer} · {profile.location.city},{" "}
            {profile.location.country}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/projects/new"
            className={`inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-[#0e5f5b] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-[#0a4744] ${focusRing}`}
          >
            <Plus className="size-4" />
            <span>Add New Project</span>
          </Link>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-[#d4cdc0] bg-white px-4 py-2 text-sm font-semibold text-[#191c20] transition-colors duration-200 hover:border-[#0e5f5b] hover:bg-[#faf8f4] ${focusRing}`}
          >
            <span>View Live Site</span>
            <ArrowUpRight className="size-4 text-[#4c535b]" />
          </a>
        </div>
      </section>

      {/* KPI Metric Cards */}
      <section aria-label="Portfolio statistics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className="rounded-2xl border border-[#e6e1d8] bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#4c535b]">
                  {metric.label}
                </span>
                <span className="inline-flex size-8 items-center justify-center rounded-lg bg-[#e1eeec] text-[#0e5f5b]">
                  <Icon className="size-4" />
                </span>
              </div>
              <p className="mt-3 text-3xl font-bold tabular-nums tracking-tight text-[#191c20]">
                {metric.value}
              </p>
              <p className="mt-1 text-xs text-[#4c535b]">{metric.detail}</p>
            </div>
          );
        })}
      </section>

      {/* Quick Access Navigation */}
      <section aria-labelledby="quick-access-heading">
        <h3
          id="quick-access-heading"
          className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#4c535b]"
        >
          Quick Access
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className={`group flex flex-col justify-between rounded-2xl border border-[#e6e1d8] bg-white p-5 shadow-sm transition-colors duration-200 hover:border-[#0e5f5b] ${focusRing}`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex size-9 items-center justify-center rounded-xl bg-[#f3efe8] text-[#0e5f5b] transition-colors duration-200 group-hover:bg-[#e1eeec]">
                      <Icon className="size-4" />
                    </span>
                    <ArrowRight className="size-4 text-[#646b73] transition-colors duration-200 group-hover:text-[#0e5f5b]" />
                  </div>
                  <h4 className="mt-4 text-sm font-semibold text-[#191c20] group-hover:text-[#0e5f5b]">
                    {card.title}
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed text-[#4c535b]">{card.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recent Portfolio Projects List */}
      <section
        aria-labelledby="recent-projects-heading"
        className="overflow-hidden rounded-2xl border border-[#e6e1d8] bg-white shadow-sm"
      >
        <div className="flex items-center justify-between border-b border-[#e6e1d8] px-5 py-4 sm:px-6">
          <h3 id="recent-projects-heading" className="text-base font-semibold text-[#191c20]">
            Recent Portfolio Projects
          </h3>
          <Link
            href="/admin/projects"
            className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-[#0e5f5b] hover:underline ${focusRing}`}
          >
            <span>View all ({projects.length})</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-[#e6e1d8]">
          {projects.slice(0, 6).map((project) => (
            <div
              key={project.slug}
              className="flex flex-col gap-3 px-5 py-4 transition-colors duration-200 hover:bg-[#faf8f4] sm:flex-row sm:items-center sm:justify-between sm:px-6"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-sm font-semibold text-[#191c20]">
                    {project.title}
                  </span>
                  <span
                    className={`rounded-md px-2 py-0.5 text-[11px] font-semibold capitalize ${
                      project.status === "published"
                        ? "bg-[#e1eeec] text-[#0a4744]"
                        : "bg-[#fbf1df] text-[#82540a]"
                    }`}
                  >
                    {project.status}
                  </span>
                  {project.featured ? (
                    <span className="rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-800">
                      Featured
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 truncate text-xs text-[#4c535b]">
                  {project.category}
                  {project.tools?.length ? ` · ${project.tools.slice(0, 3).join(", ")}` : ""}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2.5">
                <a
                  href={`/portfolio/${project.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-[#e6e1d8] bg-white px-3 py-1.5 text-xs font-medium text-[#191c20] transition-colors duration-200 hover:border-[#d4cdc0] hover:bg-[#f3efe8] ${focusRing}`}
                >
                  <span>Preview</span>
                  <ArrowUpRight className="size-3.5 text-[#4c535b]" />
                </a>
                <Link
                  href={`/admin/projects/${project._id || project.slug}`}
                  className={`inline-flex min-h-[36px] items-center rounded-lg bg-[#e1eeec] px-3.5 py-1.5 text-xs font-semibold text-[#0a4744] transition-colors duration-200 hover:bg-[#b9d6d2] ${focusRing}`}
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
