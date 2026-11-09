"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
      const res = await fetch("/api/admin/projects");
      const data = await res.json();
      setProjects(data);
    } catch {
      setMessage({ text: "Failed to load projects", type: "error" });
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
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to delete project", type: "error" });
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
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to toggle status", type: "error" });
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
        text: `"${project.title}" featured: ${nextFeatured ? "Yes" : "No"}.`,
        type: "success",
      });
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to toggle featured", type: "error" });
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
      setMessage({ text: "Display order updated successfully!", type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to reorder", type: "error" });
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#191c20]">Portfolio Projects & Case Studies</h2>
          <p className="text-xs text-[#646b73]">
            Manage all case studies, video walkthroughs, and reorder display priority
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[#0e5f5b] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0a4744]"
        >
          <span>+</span> Create New Project
        </Link>
      </div>

      {message && (
        <div
          className={`rounded-lg p-3 text-xs ${
            message.type === "success"
              ? "border border-green-200 bg-green-50 text-green-800"
              : "border border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-[#e6e1d8] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects by title, tool..."
            className="w-full rounded-lg border border-[#d4cdc0] px-3.5 py-1.5 text-xs text-[#191c20] focus:border-[#0e5f5b] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#646b73]">Status:</span>
          {["all", "published", "draft"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-lg px-2.5 py-1 font-medium capitalize transition ${
                statusFilter === status
                  ? "bg-[#0e5f5b] text-white"
                  : "bg-[#f3efe8] text-[#4c535b] hover:bg-[#e1eeec]"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#e6e1d8] bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-[#646b73]">Loading projects...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-[#646b73]">
            No projects found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#e6e1d8] bg-[#faf8f4] text-[11px] font-semibold uppercase tracking-wider text-[#646b73]">
                <tr>
                  <th className="px-3 py-3.5 text-center w-14">Order</th>
                  <th className="px-5 py-3.5">Project</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Featured</th>
                  <th className="px-4 py-3.5">Media</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6e1d8]">
                {filtered.map((project, idx) => (
                  <tr key={project.slug} className="hover:bg-[#faf8f4]/60 transition">
                    <td className="px-3 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0 || reordering}
                          onClick={() => handleMove(idx, "up")}
                          className="rounded p-1 hover:bg-[#e1eeec] disabled:opacity-20 text-xs"
                          title="Move Up"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          disabled={idx === filtered.length - 1 || reordering}
                          onClick={() => handleMove(idx, "down")}
                          className="rounded p-1 hover:bg-[#e1eeec] disabled:opacity-20 text-xs"
                          title="Move Down"
                        >
                          ▼
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-sm text-[#191c20]">{project.title}</div>
                      <div className="text-[11px] text-[#646b73]">/{project.slug}</div>
                    </td>
                    <td className="px-4 py-3.5 text-[#4c535b]">{project.category}</td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => handleToggleStatus(project)}
                        title="Click to toggle status"
                        className={`rounded px-2.5 py-0.5 text-[11px] font-medium transition cursor-pointer ${
                          project.status === "published"
                            ? "bg-[#e1eeec] text-[#0e5f5b] hover:bg-[#b9d6d2]"
                            : "bg-[#fbf1df] text-[#82540a] hover:bg-[#ecd3a3]"
                        }`}
                      >
                        {project.status} ⇄
                      </button>
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => handleToggleFeatured(project)}
                        title="Click to toggle featured"
                        className={`rounded px-2 py-0.5 text-[11px] font-medium cursor-pointer ${
                          project.featured
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                            : "text-[#646b73] hover:bg-[#f3efe8]"
                        }`}
                      >
                        {project.featured ? "★ Featured" : "☆ No"}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-[#646b73]">
                      <span>{project.videos?.length || 0} video(s)</span>
                      {project.documentationContent || project.documentation ? (
                        <span className="ml-2 text-[#0e5f5b] font-medium">✓ Docs</span>
                      ) : null}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <a
                        href={`/portfolio/${project.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded px-2.5 py-1 text-xs font-medium text-[#4c535b] hover:bg-[#f3efe8]"
                      >
                        View ↗
                      </a>
                      <Link
                        href={`/admin/projects/${project._id || project.slug}`}
                        className="rounded bg-[#0e5f5b] px-3 py-1 text-xs font-semibold text-white hover:bg-[#0a4744]"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(project._id || project.slug, project.title)}
                        disabled={deletingId === (project._id || project.slug)}
                        className="rounded bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
                      >
                        {deletingId === (project._id || project.slug) ? "..." : "Delete"}
                      </button>
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
