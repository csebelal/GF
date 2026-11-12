"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Check, ImageIcon, Plus } from "@/components/Icons";
import {
  AdminAlert,
  AdminCard,
  AdminField,
  adminFocusRing,
  adminInputClass,
  adminInputCompactClass,
  adminPrimaryBtnClass,
  adminSecondaryBtnClass,
  adminTextareaClass,
} from "@/components/admin/ui/FormPrimitives";
import { MarkdownEditor } from "@/components/admin/ui/MarkdownEditor";
import { parseYouTubeUrl } from "@/lib/youtube";

interface ProjectFormProps {
  initialData?: any;
  isNew?: boolean;
}

export function ProjectForm({ initialData, isNew = false }: ProjectFormProps) {
  const router = useRouter();

  const [form, setForm] = useState<any>(
    initialData || {
      slug: "",
      title: "",
      summary: "",
      category: "Salesforce Automation",
      tools: ["Salesforce Flow"],
      featured: false,
      status: "published",
      provenance: "independent",
      role: "Design, build and testing",
      date: new Date().toISOString().slice(0, 7),
      overview: "",
      coverImage: { src: "", alt: "" },
      videos: [],
      documentationContent: "",
      screenshots: [],
      attachments: [],
      externalLinks: [],
    }
  );

  const [toolsInput, setToolsInput] = useState(form.tools ? form.tools.join(", ") : "");
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const generateSlug = () => {
    if (!form.title) return;
    const slug = form.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    setForm({ ...form, slug });
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setForm((prev: any) => ({
        ...prev,
        coverImage: {
          ...prev.coverImage,
          src: data.url,
          alt: prev.coverImage?.alt || prev.title || "Project cover",
        },
      }));
      setMessage({ text: "Cover image uploaded successfully!", type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to upload image", type: "error" });
    } finally {
      setUploadingCover(false);
      e.target.value = "";
    }
  };

  const addVideo = () => {
    setForm({
      ...form,
      videos: [
        ...(form.videos || []),
        {
          title: "Walkthrough",
          youtubeUrl: "",
          aspectRatio: "16:9",
          showCaptions: false,
          description: "",
          documentationContent: "",
        },
      ],
    });
  };

  const removeVideo = (index: number) => {
    const updated = [...(form.videos || [])];
    updated.splice(index, 1);
    setForm({ ...form, videos: updated });
  };

  const updateVideo = (index: number, field: string, value: any) => {
    const updated = [...(form.videos || [])];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, videos: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const toolsArray = toolsInput
      .split(",")
      .map((t: string) => t.trim())
      .filter(Boolean);

    const payload = {
      ...form,
      tools: toolsArray,
    };

    try {
      const url = isNew ? "/api/admin/projects" : `/api/admin/projects/${initialData._id || initialData.slug}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage({
        text: `Project "${form.title}" saved successfully!`,
        type: "success",
      });

      if (isNew) {
        setTimeout(() => {
          router.push("/admin/projects");
          router.refresh();
        }, 1000);
      }
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to save project", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-8 pb-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-ink">
            {isNew ? "Create New Project" : `Edit Project: ${form.title}`}
          </h2>
          <p className="mt-0.5 text-sm text-body">
            Fill in the case study details, video walkthroughs, and technical write-up.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/projects")}
            className={adminSecondaryBtnClass}
          >
            Cancel
          </button>
          <button type="submit" disabled={saving} className={adminPrimaryBtnClass}>
            {saving ? "Saving..." : isNew ? "Publish Project" : "Save Changes"}
          </button>
        </div>
      </div>

      <AdminAlert message={message} />

      {/* Main Metadata */}
      <AdminCard className="space-y-5">
        <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-accent">
          1. Project Details
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField label="Project Title" className="sm:col-span-2">
            {({ id }) => (
              <input
                id={id}
                type="text"
                required
                value={form.title || ""}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Lead routing Flow for inbound enterprise accounts"
                className={adminInputClass}
              />
            )}
          </AdminField>

          <AdminField
            label="URL Slug"
            action={
              <button
                type="button"
                onClick={generateSlug}
                className={`cursor-pointer rounded px-1.5 py-0.5 text-[11px] font-semibold text-accent hover:underline ${adminFocusRing}`}
              >
                Auto-generate
              </button>
            }
          >
            {({ id }) => (
              <input
                id={id}
                type="text"
                required
                value={form.slug || ""}
                onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().trim() })}
                placeholder="e.g. lead-routing-flow"
                className={adminInputClass}
              />
            )}
          </AdminField>

          <AdminField label="Category">
            {({ id }) => (
              <input
                id={id}
                type="text"
                required
                value={form.category || ""}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="e.g. Salesforce Automation"
                className={adminInputClass}
              />
            )}
          </AdminField>

          <AdminField label="Status">
            {({ id }) => (
              <select
                id={id}
                value={form.status || "published"}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className={adminInputClass}
              >
                <option value="published">Published (Visible on site)</option>
                <option value="draft">Draft (Hidden from public site)</option>
              </select>
            )}
          </AdminField>

          <AdminField label="Provenance">
            {({ id }) => (
              <select
                id={id}
                value={form.provenance || "independent"}
                onChange={(e) => setForm({ ...form, provenance: e.target.value })}
                className={adminInputClass}
              >
                <option value="professional">Professional (Real client/employer work)</option>
                <option value="independent">Independent (Self-directed/Developer Org)</option>
                <option value="illustrative">Illustrative (Concept / Demo)</option>
              </select>
            )}
          </AdminField>

          <AdminField label="Date (YYYY or YYYY-MM)">
            {({ id }) => (
              <input
                id={id}
                type="text"
                value={form.date || ""}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                placeholder="2025-06"
                className={adminInputClass}
              />
            )}
          </AdminField>

          <AdminField label="Role / Contribution">
            {({ id }) => (
              <input
                id={id}
                type="text"
                value={form.role || ""}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="Design, build and testing"
                className={adminInputClass}
              />
            )}
          </AdminField>

          <AdminField label="Tools (comma separated)" className="sm:col-span-2">
            {({ id }) => (
              <input
                id={id}
                type="text"
                value={toolsInput}
                onChange={(e) => setToolsInput(e.target.value)}
                placeholder="Salesforce Flow, Service Cloud, Data Loader"
                className={adminInputClass}
              />
            )}
          </AdminField>

          <div className="sm:col-span-2 flex items-center gap-2.5 pt-1">
            <input
              type="checkbox"
              id="featured"
              checked={Boolean(form.featured)}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              className={`size-4 cursor-pointer rounded border-line-strong text-accent ${adminFocusRing}`}
            />
            <label htmlFor="featured" className="cursor-pointer text-xs font-semibold text-ink">
              Featured on Home Page project showcase
            </label>
          </div>
        </div>
      </AdminCard>

      {/* Summary & Overview */}
      <AdminCard className="space-y-5">
        <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-accent">
          2. Summary & Overview
        </h3>

        <AdminField label="Short Summary (1-2 sentences for cards & search)">
          {({ id }) => (
            <textarea
              id={id}
              rows={2}
              required
              value={form.summary || ""}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              placeholder="A record-triggered Flow that inspects incoming leads, evaluates routing criteria and assigns them..."
              className={adminTextareaClass}
            />
          )}
        </AdminField>

        <AdminField label="Project Overview">
          {({ id }) => (
            <MarkdownEditor
              id={id}
              variant="compact"
              rows={5}
              value={form.overview || ""}
              onChange={(overview) => setForm({ ...form, overview })}
              placeholder="Detailed description of the business problem, requirements, and stakeholders..."
              ariaLabel="Project overview Markdown editor"
            />
          )}
        </AdminField>
      </AdminCard>

      {/* Cover Image */}
      <AdminCard className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-accent">
          3. Cover Image / Poster
        </h3>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {form.coverImage?.src ? (
            <img
              src={form.coverImage.src}
              alt={form.coverImage.alt || "Cover preview"}
              className="h-20 w-32 shrink-0 rounded-xl border border-line object-cover"
            />
          ) : null}
          <div className="flex-1 space-y-2.5">
            <label
              className={`inline-flex min-h-[38px] cursor-pointer items-center gap-2 rounded-xl border border-dashed border-accent bg-accent-soft/50 px-4 py-2 text-xs font-semibold text-accent-strong transition-colors duration-200 hover:bg-accent-soft focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2 ${
                uploadingCover ? "pointer-events-none opacity-60" : ""
              }`}
            >
              <ImageIcon className="size-4" />
              <span>{uploadingCover ? "Uploading Image..." : "Upload Cover Image (PNG, JPG, WebP)"}</span>
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={handleCoverUpload}
                disabled={uploadingCover}
              />
            </label>
            <AdminField label="Cover Image URL / Path">
              {({ id }) => (
                <input
                  id={id}
                  type="text"
                  value={form.coverImage?.src || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      coverImage: { ...form.coverImage, src: e.target.value },
                    })
                  }
                  placeholder="Or enter path e.g. /images/samples/lead-routing-cover.svg"
                  className={adminInputCompactClass}
                />
              )}
            </AdminField>
          </div>
        </div>
      </AdminCard>

      {/* Videos Section */}
      <AdminCard className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-accent">
            4. YouTube Walkthrough Videos ({form.videos?.length || 0})
          </h3>
          <button
            type="button"
            onClick={addVideo}
            className={`inline-flex min-h-[34px] cursor-pointer items-center gap-1.5 rounded-xl bg-accent-soft px-3 py-1.5 text-xs font-semibold text-accent-strong transition-colors duration-200 hover:bg-accent-line ${adminFocusRing}`}
          >
            <Plus className="size-3.5" />
            <span>Add Video</span>
          </button>
        </div>

        {(form.videos || []).map((video: any, idx: number) => {
          const parsed = parseYouTubeUrl(video.youtubeUrl || "");
          return (
            <div key={idx} className="space-y-3 rounded-xl border border-line bg-canvas p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink">Video #{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => removeVideo(idx)}
                  className={`cursor-pointer rounded px-2 py-1 text-xs font-medium text-danger hover:bg-danger-soft ${adminFocusRing}`}
                >
                  Remove Video
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <AdminField label="Video Title">
                  {({ id }) => (
                    <input
                      id={id}
                      type="text"
                      required
                      value={video.title || ""}
                      onChange={(e) => updateVideo(idx, "title", e.target.value)}
                      placeholder="e.g. Lead routing Flow configuration walkthrough"
                      className={adminInputCompactClass}
                    />
                  )}
                </AdminField>

                <AdminField
                  label="YouTube URL"
                  action={
                    video.youtubeUrl ? (
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                          parsed.ok ? "text-success" : "text-amber"
                        }`}
                      >
                        {parsed.ok ? (
                          <>
                            <Check className="size-3" /> Valid ID: {parsed.id}
                          </>
                        ) : (
                          <>
                            <Alert className="size-3" /> {parsed.reason}
                          </>
                        )}
                      </span>
                    ) : null
                  }
                >
                  {({ id }) => (
                    <input
                      id={id}
                      type="url"
                      required
                      value={video.youtubeUrl || ""}
                      onChange={(e) => updateVideo(idx, "youtubeUrl", e.target.value)}
                      placeholder="https://youtu.be/..."
                      className={adminInputCompactClass}
                    />
                  )}
                </AdminField>

                <AdminField label="Aspect Ratio">
                  {({ id }) => (
                    <select
                      id={id}
                      value={video.aspectRatio || "16:9"}
                      onChange={(e) => updateVideo(idx, "aspectRatio", e.target.value)}
                      className={adminInputCompactClass}
                    >
                      <option value="16:9">16:9 (Landscape standard)</option>
                      <option value="9:16">9:16 (Shorts / Vertical mobile)</option>
                    </select>
                  )}
                </AdminField>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id={`captions-${idx}`}
                    checked={Boolean(video.showCaptions)}
                    onChange={(e) => updateVideo(idx, "showCaptions", e.target.checked)}
                    className={`size-4 cursor-pointer rounded text-accent ${adminFocusRing}`}
                  />
                  <label htmlFor={`captions-${idx}`} className="cursor-pointer text-xs text-ink">
                    Enable captions by default
                  </label>
                </div>

                <AdminField label="Video Description (under player)" className="sm:col-span-2">
                  {({ id }) => (
                    <input
                      id={id}
                      type="text"
                      value={video.description || ""}
                      onChange={(e) => updateVideo(idx, "description", e.target.value)}
                      placeholder="Short note about what this video demonstrates"
                      className={adminInputCompactClass}
                    />
                  )}
                </AdminField>
              </div>
            </div>
          );
        })}
      </AdminCard>

      {/* Technical Documentation Markdown Editor */}
      <AdminCard className="space-y-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-accent">
            5. Technical Article / Documentation
          </h3>
          <p id="doc-editor-hint" className="mt-1 text-xs text-body">
            Use the toolbar, templates, or drag-and-drop images. Headings (H2 / H3) automatically generate
            the sticky Table of Contents on the live project page.
          </p>
        </div>

        <MarkdownEditor
          id="documentation-editor"
          variant="full"
          rows={16}
          value={form.documentationContent || ""}
          onChange={(documentationContent) => setForm({ ...form, documentationContent })}
          placeholder={`## Business problem\n\nExplain the problem...\n\n## Solution architecture\n\nExplain the Flow...\n\n## Testing & verification\n\nHow it was tested...`}
          ariaLabel="Technical documentation Markdown editor"
          ariaDescribedBy="doc-editor-hint"
        />
      </AdminCard>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/projects")}
          className={adminSecondaryBtnClass}
        >
          Cancel
        </button>
        <button type="submit" disabled={saving} className={adminPrimaryBtnClass}>
          {saving ? "Saving..." : isNew ? "Publish Project" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
