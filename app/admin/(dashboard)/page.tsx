import Link from "next/link";
import { getDbProjects, getDbProfile, getDbExperience, getDbExpertise } from "@/lib/db/repository";

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

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#e6e1d8] bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#191c20]">
            Welcome back, {profile.name}
          </h2>
          <p className="mt-1 text-sm text-[#4c535b]">
            {profile.jobTitle} at {profile.employer} · {profile.location.city}, {profile.location.country}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/projects/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[#0e5f5b] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0a4744]"
          >
            <span>+</span> Add New Project
          </Link>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#d4cdc0] px-4 py-2.5 text-sm font-medium text-[#191c20] transition hover:bg-[#f3efe8]"
          >
            View Live Site ↗
          </a>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-[#e6e1d8] bg-white p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#646b73]">
            Total Projects
          </span>
          <p className="mt-2 text-3xl font-bold text-[#191c20]">{projects.length}</p>
          <p className="mt-1 text-xs text-[#646b73]">
            {publishedCount} published · {draftCount} draft
          </p>
        </div>

        <div className="rounded-xl border border-[#e6e1d8] bg-white p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#646b73]">
            Employers & Roles
          </span>
          <p className="mt-2 text-3xl font-bold text-[#191c20]">{totalEmployers}</p>
          <p className="mt-1 text-xs text-[#646b73]">Field Nation + previous</p>
        </div>

        <div className="rounded-xl border border-[#e6e1d8] bg-white p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#646b73]">
            Expertise Domains
          </span>
          <p className="mt-2 text-3xl font-bold text-[#191c20]">{totalAreas}</p>
          <p className="mt-1 text-xs text-[#646b73]">CRM automation & data</p>
        </div>

        <div className="rounded-xl border border-[#e6e1d8] bg-white p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#646b73]">
            Credentials
          </span>
          <p className="mt-2 text-3xl font-bold text-[#191c20]">
            {(experience.certifications?.length || 0) + (experience.courseCertificates?.length || 0)}
          </p>
          <p className="mt-1 text-xs text-[#646b73]">Certifications & courses</p>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/admin/profile"
          className="group rounded-xl border border-[#e6e1d8] bg-white p-6 transition hover:border-[#0e5f5b] hover:shadow-sm"
        >
          <h3 className="text-base font-semibold text-[#191c20] group-hover:text-[#0e5f5b]">
            Profile & Site Info
          </h3>
          <p className="mt-1 text-xs text-[#646b73]">
            Edit name, title, contact email, CV download, and home page settings.
          </p>
        </Link>

        <Link
          href="/admin/projects"
          className="group rounded-xl border border-[#e6e1d8] bg-white p-6 transition hover:border-[#0e5f5b] hover:shadow-sm"
        >
          <h3 className="text-base font-semibold text-[#191c20] group-hover:text-[#0e5f5b]">
            Manage Projects
          </h3>
          <p className="mt-1 text-xs text-[#646b73]">
            Edit walkthrough videos, technical documentation, screenshots, and tools.
          </p>
        </Link>

        <Link
          href="/admin/experience"
          className="group rounded-xl border border-[#e6e1d8] bg-white p-6 transition hover:border-[#0e5f5b] hover:shadow-sm"
        >
          <h3 className="text-base font-semibold text-[#191c20] group-hover:text-[#0e5f5b]">
            Experience & Education
          </h3>
          <p className="mt-1 text-xs text-[#646b73]">
            Update roles, responsibilities, promotion date, education, and credentials.
          </p>
        </Link>
      </div>

      {/* Recent Projects Table */}
      <div className="rounded-xl border border-[#e6e1d8] bg-white">
        <div className="flex items-center justify-between border-b border-[#e6e1d8] p-5">
          <h3 className="text-base font-semibold text-[#191c20]">Portfolio Projects</h3>
          <Link
            href="/admin/projects"
            className="text-xs font-semibold text-[#0e5f5b] hover:underline"
          >
            View all ({projects.length}) →
          </Link>
        </div>

        <div className="divide-y divide-[#e6e1d8] overflow-x-auto">
          {projects.slice(0, 6).map((project) => (
            <div
              key={project.slug}
              className="flex items-center justify-between p-4 transition hover:bg-[#faf8f4]"
            >
              <div className="min-w-0 flex-1 pr-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#191c20] truncate">{project.title}</span>
                  <span
                    className={`rounded px-2 py-0.5 text-[11px] font-medium ${
                      project.status === "published"
                        ? "bg-[#e1eeec] text-[#0e5f5b]"
                        : "bg-[#fbf1df] text-[#82540a]"
                    }`}
                  >
                    {project.status}
                  </span>
                  {project.featured && (
                    <span className="rounded bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700">
                      featured
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-[#646b73] truncate">
                  {project.category} · {project.tools.slice(0, 3).join(", ")}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={`/portfolio/${project.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded px-2.5 py-1 text-xs font-medium text-[#4c535b] hover:bg-[#f3efe8]"
                >
                  Preview ↗
                </a>
                <Link
                  href={`/admin/projects/${project._id || project.slug}`}
                  className="rounded bg-[#f3efe8] px-3 py-1 text-xs font-semibold text-[#0e5f5b] hover:bg-[#e1eeec]"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
