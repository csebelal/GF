"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Alert,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronUp,
  Plus,
  Search,
} from "@/components/Icons";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e5f5b] focus-visible:ring-offset-2";

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const loadProjects = async () => {
    try {
      const res = await fetch("/api/admin/projects?summary=1");
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch {
      setMessage({ text: "Failed to load projects.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage({ text: `Project "${title}" deleted successfully.`, type: "success" });
      setProjects((prev) => prev.filter((p) => p._id !== id && p.slug !== id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete project.";
      setMessage({ text: msg, type: "error" });
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (project: any) => {
    const nextStatus = project.status === "published" ? "draft" : "published";
    try {
      const res = await fetch(`/api/admin/projects/${project._id || project.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setProjects((prev) =>
        prev.map((p) => (p.slug === project.slug ? { ...p, status: nextStatus } : p))
      );
      setMessage({
        text: `"${project.title}" changed to ${nextStatus}.`,
        type: "success",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to toggle status.";
      setMessage({ text: msg, type: "error" });
    }
  };

  const handleToggleFeatured = async (project: any) => {
    const nextFeatured = !project.featured;
    try {
      const res = await fetch(`/api/admin/projects/${project._id || project.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: nextFeatured }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setProjects((prev) =>
        prev.map((p) => (p.slug === project.slug ? { ...p, featured: nextFeatured } : p))
      );
      setMessage({
        text: `"${project.title}" featured status set to ${nextFeatured ? "Yes" : "No"}.`,
        type: "success",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to toggle featured.";
      setMessage({ text: msg, type: "error" });
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const updated = [...projects];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setProjects(updated);
    setReordering(true);

    try {
      const res = await fetch("/api/admin/projects/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slugs: updated.map((p) => p.slug) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage({ text: "Display order updated successfully.", type: "success" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to reorder.";
      setMessage({ text: msg, type: "error" });
    } finally {
      setReordering(false);
    }
  };

  const filtered = projects.filter((p) => {
    const matchesQ =
      !query ||
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase()) ||
      (p.tools || []).some((t: string) => t.toLowerCase().includes(query.toLowerCase()));
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesQ && matchesStatus;
  });

  const isFiltered = Boolean(query) || statusFilter !== "all";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#191c20]">
            Portfolio Projects & Case Studies
          </h2>
          <p className="mt-0.5 text-sm text-[#4c535b]">
            Manage case studies, video walkthroughs, and display order.
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className={`inline-flex min-h-[40px] items-center gap-2 rounded-xl bg-[#0e5f5b] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-[#0a4744] ${focusRing}`}
        >
          <Plus className="size-4" />
          <span>Create New Project</span>
        </Link>
      </div>

      {message ? (
        <div
          role={message.type === "error" ? "alert" : "status"}
          aria-live="polite"
          className={`flex items-start gap-2.5 rounded-xl border p-3.5 text-sm ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-[#166534]"
              : "border-red-200 bg-red-50 text-[#991b1b]"
          }`}
        >
          {message.type === "success" ? (
            <Check className="mt-0.5 size-4 shrink-0" />
          ) : (
            <Alert className="mt-0.5 size-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      ) : null}

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#e6e1d8] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <label htmlFor="projects-search" className="sr-only">
            Search projects by title, category, or tool
          </label>
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#4c535b]">
            <Search className="size-4" />
          </span>
          <input
            id="projects-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, tool, category..."
            className="h-10 w-full rounded-xl border border-[#d4cdc0] bg-white pl-9 pr-3.5 text-sm text-[#191c20] transition-colors duration-200 placeholder:text-[#646b73] hover:border-[#8b9198] focus-visible:border-[#0e5f5b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e5f5b] focus-visible:ring-offset-1"
          />
        </div>

        <div className="flex items-center gap-2 text-xs" role="group" aria-label="Filter by status">
          <span className="font-medium text-[#4c535b]">Status:</span>
          {["all", "published", "draft"].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              aria-pressed={statusFilter === status}
              className={`min-h-[34px] cursor-pointer rounded-xl px-3 py-1.5 font-semibold capitalize transition-colors duration-200 ${focusRing} ${
                statusFilter === status
                  ? "bg-[#0e5f5b] text-white"
                  : "bg-[#f3efe8] text-[#191c20] hover:bg-[#e1eeec]"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-[#e6e1d8] bg-white shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-sm text-[#4c535b]">Loading projects...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-[#4c535b]">
            No projects found matching your filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#e6e1d8] bg-[#faf8f4] text-[11px] font-semibold uppercase tracking-wider text-[#4c535b]">
                <tr>
                  <th scope="col" className="w-20 px-3 py-3.5 text-center">
                    Order
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    Project
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Category
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Featured
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Media
                  </th>
                  <th scope="col" className="px-5 py-3.5 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6e1d8]">
                {filtered.map((project, idx) => (
                  <tr
                    key={project.slug}
                    className="transition-colors duration-200 hover:bg-[#faf8f4]/80"
                  >
                    <td className="px-3 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0 || reordering || isFiltered}
                          onClick={() => handleMove(idx, "up")}
                          aria-label={`Move ${project.title} up`}
                          title={isFiltered ? "Clear filters to reorder" : "Move up"}
                          className={`inline-flex size-7 cursor-pointer items-center justify-center rounded-lg text-[#4c535b] transition-colors duration-200 hover:bg-[#e1eeec] hover:text-[#0a4744] disabled:cursor-not-allowed disabled:opacity-25 ${focusRing}`}
                        >
                          <ChevronUp className="size-4" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === filtered.length - 1 || reordering || isFiltered}
                          onClick={() => handleMove(idx, "down")}
                          aria-label={`Move ${project.title} down`}
                          title={isFiltered ? "Clear filters to reorder" : "Move down"}
                          className={`inline-flex size-7 cursor-pointer items-center justify-center rounded-lg text-[#4c535b] transition-colors duration-200 hover:bg-[#e1eeec] hover:text-[#0a4744] disabled:cursor-not-allowed disabled:opacity-25 ${focusRing}`}
                        >
                          <ChevronDown className="size-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-sm font-semibold text-[#191c20]">{project.title}</div>
                      <div className="mt-0.5 text-[11px] text-[#4c535b]">/{project.slug}</div>
                    </td>
                    <td className="px-4 py-3.5 text-[#4c535b]">{project.category}</td>
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(project)}
                        aria-label={`Toggle status for ${project.title}, currently ${project.status}`}
                        className={`min-h-[28px] cursor-pointer rounded-lg px-2.5 py-1 text-[11px] font-semibold capitalize transition-colors duration-200 ${focusRing} ${
                          project.status === "published"
                            ? "bg-[#e1eeec] text-[#0a4744] hover:bg-[#b9d6d2]"
                            : "bg-[#fbf1df] text-[#82540a] hover:bg-[#ecd3a3]"
                        }`}
                      >
                        {project.status}
                      </button>
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(project)}
                        aria-pressed={Boolean(project.featured)}
                        aria-label={`Toggle featured for ${project.title}`}
                        className={`min-h-[28px] cursor-pointer rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors duration-200 ${focusRing} ${
                          project.featured
                            ? "border border-indigo-200 bg-indigo-50 text-indigo-800 hover:bg-indigo-100"
                            : "border border-transparent text-[#4c535b] hover:bg-[#f3efe8]"
                        }`}
                      >
                        {project.featured ? "Featured" : "Standard"}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-[#4c535b]">
                      <span>{project.videoCount ?? (project.videos?.length || 0)} video(s)</span>
                      {project.hasDocs || project.documentationContent || project.documentation ? (
                        <span className="ml-2 font-semibold text-[#0e5f5b]">· Docs</span>
                      ) : null}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <a
                          href={`/portfolio/${project.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex min-h-[32px] items-center gap-1 rounded-lg border border-[#e6e1d8] bg-white px-2.5 py-1 text-xs font-medium text-[#191c20] transition-colors duration-200 hover:bg-[#f3efe8] ${focusRing}`}
                        >
                          <span>View</span>
                          <ArrowUpRight className="size-3.5 text-[#4c535b]" />
                        </a>
                        <Link
                          href={`/admin/projects/${project._id || project.slug}`}
                          className={`inline-flex min-h-[32px] items-center rounded-lg bg-[#0e5f5b] px-3 py-1 text-xs font-semibold text-white transition-colors duration-200 hover:bg-[#0a4744] ${focusRing}`}
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(project._id || project.slug, project.title)}
                          disabled={deletingId === (project._id || project.slug)}
                          className={`inline-flex min-h-[32px] cursor-pointer items-center rounded-lg bg-red-50 px-2.5 py-1 text-xs font-semibold text-[#b91c1c] transition-colors duration-200 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
                        >
                          {deletingId === (project._id || project.slug) ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
