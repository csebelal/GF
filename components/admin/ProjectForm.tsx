"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  const [previewDocs, setPreviewDocs] = useState(false);
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

  const insertMarkdown = (before: string, after: string = "", placeholder: string = "text") => {
    const textarea = document.getElementById("documentation-editor") as HTMLTextAreaElement | null;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const insert = `${before}${selected || placeholder}${after}`;
    const nextValue = text.substring(0, start) + insert + text.substring(end);
    setForm({ ...form, documentationContent: nextValue });
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + (selected ? selected.length : placeholder.length));
    }, 50);
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#191c20]">
            {isNew ? "Create New Project" : `Edit Project: ${form.title}`}
          </h2>
          <p className="text-xs text-[#646b73]">
            Fill in the case study details, video walkthroughs, and technical write-up
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/projects")}
            className="rounded-lg border border-[#d4cdc0] px-4 py-2 text-xs font-semibold text-[#4c535b] hover:bg-[#f3efe8]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[#0e5f5b] px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0a4744] disabled:opacity-50"
          >
            {saving ? "Saving..." : isNew ? "Publish Project" : "Save Changes"}
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`rounded-lg p-3 text-sm ${
            message.type === "success"
              ? "border border-green-200 bg-green-50 text-green-800"
              : "border border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Main Metadata */}
      <div className="rounded-xl border border-[#e6e1d8] bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#0e5f5b]">1. Project Details</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#4c535b]">Project Title</label>
            <input
              type="text"
              required
              value={form.title || ""}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Lead routing Flow for inbound enterprise accounts"
              className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20] focus:border-[#0e5f5b] focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#4c535b]">URL Slug</label>
              <button
                type="button"
                onClick={generateSlug}
                className="text-[11px] font-semibold text-[#0e5f5b] hover:underline"
              >
                Auto-generate
              </button>
            </div>
            <input
              type="text"
              required
              value={form.slug || ""}
              onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().trim() })}
              placeholder="e.g. lead-routing-flow"
              className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20] focus:border-[#0e5f5b] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4c535b]">Category</label>
            <input
              type="text"
              required
              value={form.category || ""}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="e.g. Salesforce Automation"
              className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20] focus:border-[#0e5f5b] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4c535b]">Status</label>
            <select
              value={form.status || "published"}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20] focus:border-[#0e5f5b] focus:outline-none"
            >
              <option value="published">Published (Visible on site)</option>
              <option value="draft">Draft (Hidden from public site)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4c535b]">Provenance</label>
            <select
              value={form.provenance || "independent"}
              onChange={(e) => setForm({ ...form, provenance: e.target.value })}
              className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20] focus:border-[#0e5f5b] focus:outline-none"
            >
              <option value="professional">Professional (Real client/employer work)</option>
              <option value="independent">Independent (Self-directed/Developer Org)</option>
              <option value="illustrative">Illustrative (Concept / Demo)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4c535b]">Date (YYYY or YYYY-MM)</label>
            <input
              type="text"
              value={form.date || ""}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              placeholder="2025-06"
              className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20] focus:border-[#0e5f5b] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4c535b]">Role / Contribution</label>
            <input
              type="text"
              value={form.role || ""}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder="Design, build and testing"
              className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20] focus:border-[#0e5f5b] focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#4c535b]">Tools (comma separated)</label>
            <input
              type="text"
              value={toolsInput}
              onChange={(e) => setToolsInput(e.target.value)}
              placeholder="Salesforce Flow, Service Cloud, Data Loader"
              className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20] focus:border-[#0e5f5b] focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2 flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="featured"
              checked={Boolean(form.featured)}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              className="size-4 rounded border-[#d4cdc0] text-[#0e5f5b] focus:ring-[#0e5f5b]"
            />
            <label htmlFor="featured" className="text-xs font-semibold text-[#191c20]">
              Featured on Home Page project showcase
            </label>
          </div>
        </div>
      </div>

      {/* Summary & Overview */}
      <div className="rounded-xl border border-[#e6e1d8] bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#0e5f5b]">2. Summary & Overview</h3>

        <div>
          <label className="block text-xs font-semibold text-[#4c535b]">
            Short Summary (1-2 sentences for cards & search)
          </label>
          <textarea
            rows={2}
            required
            value={form.summary || ""}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
            placeholder="A record-triggered Flow that inspects incoming leads, evaluates routing criteria and assigns them..."
            className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20] focus:border-[#0e5f5b] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#4c535b]">
            Project Overview (Markdown allowed)
          </label>
          <textarea
            rows={4}
            value={form.overview || ""}
            onChange={(e) => setForm({ ...form, overview: e.target.value })}
            placeholder="Detailed description of the business problem, requirements, and stakeholders..."
            className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20] focus:border-[#0e5f5b] focus:outline-none font-mono text-xs"
          />
        </div>
      </div>

      {/* Cover Image */}
      <div className="rounded-xl border border-[#e6e1d8] bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#0e5f5b]">3. Cover Image / Poster</h3>
        <div className="flex items-center gap-4">
          {form.coverImage?.src && (
            <img
              src={form.coverImage.src}
              alt="Cover preview"
              className="h-20 w-32 rounded-lg object-cover border border-[#e6e1d8]"
            />
          )}
          <div className="flex-1 space-y-2">
            <label className="inline-block cursor-pointer rounded-lg border border-dashed border-[#0e5f5b] bg-[#e1eeec]/40 px-4 py-2 text-xs font-semibold text-[#0e5f5b] hover:bg-[#e1eeec]">
              <span>{uploadingCover ? "Uploading Image..." : "Upload Cover Image / SVG"}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverUpload}
                disabled={uploadingCover}
              />
            </label>
            <input
              type="text"
              value={form.coverImage?.src || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  coverImage: { ...form.coverImage, src: e.target.value },
                })
              }
              placeholder="Or enter path e.g. /images/samples/lead-routing-cover.svg"
              className="w-full rounded-lg border border-[#d4cdc0] px-3 py-1.5 text-xs text-[#191c20]"
            />
          </div>
        </div>
      </div>

      {/* Videos Section */}
      <div className="rounded-xl border border-[#e6e1d8] bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#0e5f5b]">
            4. YouTube Walkthrough Videos ({form.videos?.length || 0})
          </h3>
          <button
            type="button"
            onClick={addVideo}
            className="rounded-lg bg-[#e1eeec] px-3 py-1 text-xs font-semibold text-[#0e5f5b] hover:bg-[#b9d6d2]"
          >
            + Add Video
          </button>
        </div>

        {(form.videos || []).map((video: any, idx: number) => {
          const parsed = parseYouTubeUrl(video.youtubeUrl || "");
          return (
            <div key={idx} className="rounded-lg border border-[#e6e1d8] bg-[#faf8f4] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#191c20]">Video #{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => removeVideo(idx)}
                  className="text-xs text-red-600 hover:underline"
                >
                  Remove Video
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#4c535b]">Video Title</label>
                  <input
                    type="text"
                    required
                    value={video.title || ""}
                    onChange={(e) => updateVideo(idx, "title", e.target.value)}
                    placeholder="e.g. Lead routing Flow configuration walkthrough"
                    className="mt-1 w-full rounded border border-[#d4cdc0] px-2.5 py-1.5 text-xs"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-semibold text-[#4c535b]">YouTube URL</label>
                    {video.youtubeUrl && (
                      <span className={`text-[10px] font-semibold ${parsed.ok ? "text-green-700" : "text-amber-700"}`}>
                        {parsed.ok ? `✓ Valid ID: ${parsed.id}` : `⚠ ${parsed.reason}`}
                      </span>
                    )}
                  </div>
                  <input
                    type="url"
                    required
                    value={video.youtubeUrl || ""}
                    onChange={(e) => updateVideo(idx, "youtubeUrl", e.target.value)}
                    placeholder="https://youtu.be/..."
                    className="mt-1 w-full rounded border border-[#d4cdc0] px-2.5 py-1.5 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#4c535b]">Aspect Ratio</label>
                  <select
                    value={video.aspectRatio || "16:9"}
                    onChange={(e) => updateVideo(idx, "aspectRatio", e.target.value)}
                    className="mt-1 w-full rounded border border-[#d4cdc0] px-2.5 py-1.5 text-xs"
                  >
                    <option value="16:9">16:9 (Landscape standard)</option>
                    <option value="9:16">9:16 (Shorts / Vertical mobile)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id={`captions-${idx}`}
                    checked={Boolean(video.showCaptions)}
                    onChange={(e) => updateVideo(idx, "showCaptions", e.target.checked)}
                    className="size-3.5 rounded text-[#0e5f5b]"
                  />
                  <label htmlFor={`captions-${idx}`} className="text-xs text-[#191c20]">
                    Enable captions by default
                  </label>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#4c535b]">
                    Video Description (under player)
                  </label>
                  <input
                    type="text"
                    value={video.description || ""}
                    onChange={(e) => updateVideo(idx, "description", e.target.value)}
                    placeholder="Short note about what this video demonstrates"
                    className="mt-1 w-full rounded border border-[#d4cdc0] px-2.5 py-1.5 text-xs"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Technical Documentation Markdown Editor with Rich Toolbar */}
      <div className="rounded-xl border border-[#e6e1d8] bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#0e5f5b]">
            5. Technical Article / Documentation (Markdown)
          </h3>
          <button
            type="button"
            onClick={() => setPreviewDocs(!previewDocs)}
            className="rounded px-2.5 py-1 text-xs font-semibold text-[#0e5f5b] hover:bg-[#e1eeec]"
          >
            {previewDocs ? "Edit Mode" : "Preview Mode"}
          </button>
        </div>

        {/* Markdown Toolbar */}
        {!previewDocs && (
          <div className="flex flex-wrap gap-1 rounded-lg border border-[#e6e1d8] bg-[#faf8f4] p-1.5 text-xs">
            <button
              type="button"
              onClick={() => insertMarkdown("## ", "\n", "Heading 2 Title")}
              className="rounded px-2 py-1 font-bold text-[#191c20] hover:bg-white border border-transparent hover:border-[#d4cdc0]"
              title="Heading 2 (TOC Section)"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown("### ", "\n", "Heading 3 Subtitle")}
              className="rounded px-2 py-1 font-bold text-[#191c20] hover:bg-white border border-transparent hover:border-[#d4cdc0]"
              title="Heading 3 (TOC Sub-item)"
            >
              H3
            </button>
            <span className="w-px bg-[#d4cdc0] my-0.5 mx-1" />
            <button
              type="button"
              onClick={() => insertMarkdown("**", "**", "bold text")}
              className="rounded px-2 py-1 font-bold text-[#191c20] hover:bg-white border border-transparent hover:border-[#d4cdc0]"
              title="Bold"
            >
              B
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown("*", "*", "italic text")}
              className="rounded px-2 py-1 italic text-[#191c20] hover:bg-white border border-transparent hover:border-[#d4cdc0]"
              title="Italic"
            >
              I
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown("```\n", "\n```\n", "// Code block")}
              className="rounded px-2 py-1 font-mono text-[#191c20] hover:bg-white border border-transparent hover:border-[#d4cdc0]"
              title="Code Block"
            >
              &lt;/&gt;
            </button>
            <span className="w-px bg-[#d4cdc0] my-0.5 mx-1" />
            <button
              type="button"
              onClick={() => insertMarkdown("- ", "\n", "List item")}
              className="rounded px-2 py-1 text-[#191c20] hover:bg-white border border-transparent hover:border-[#d4cdc0]"
              title="Bullet list"
            >
              • List
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown("1. ", "\n", "First item")}
              className="rounded px-2 py-1 text-[#191c20] hover:bg-white border border-transparent hover:border-[#d4cdc0]"
              title="Numbered list"
            >
              1. List
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown("> ", "\n", "Callout quote")}
              className="rounded px-2 py-1 text-[#191c20] hover:bg-white border border-transparent hover:border-[#d4cdc0]"
              title="Blockquote"
            >
              " Quote
            </button>
            <span className="w-px bg-[#d4cdc0] my-0.5 mx-1" />
            <button
              type="button"
              onClick={() => insertMarkdown("[", "](https://example.com)", "Link text")}
              className="rounded px-2 py-1 text-[#0e5f5b] font-medium hover:bg-white border border-transparent hover:border-[#d4cdc0]"
              title="Hyperlink"
            >
              🔗 Link
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown("![Image description](", ")", "/uploads/...")}
              className="rounded px-2 py-1 text-[#0e5f5b] font-medium hover:bg-white border border-transparent hover:border-[#d4cdc0]"
              title="Image from /uploads/"
            >
              🖼 Image
            </button>
          </div>
        )}

        <p className="text-xs text-[#646b73]">
          Write your technical write-up using Markdown. Headings (## and ###) will automatically generate
          the sticky Table of Contents on the live project page.
        </p>

        {previewDocs ? (
          <div className="rounded-lg border border-[#e6e1d8] bg-[#faf8f4] p-5 font-sans prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-[#191c20]">
              {form.documentationContent || "No documentation written yet."}
            </pre>
          </div>
        ) : (
          <textarea
            id="documentation-editor"
            rows={14}
            value={form.documentationContent || ""}
            onChange={(e) => setForm({ ...form, documentationContent: e.target.value })}
            placeholder={`## Business problem\n\nExplain the problem...\n\n## Solution architecture\n\nExplain the Flow...\n\n## Testing & Verification\n\nHow it was tested...`}
            className="w-full rounded-lg border border-[#d4cdc0] p-4 text-xs font-mono text-[#191c20] leading-relaxed focus:border-[#0e5f5b] focus:outline-none"
          />
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/projects")}
          className="rounded-lg border border-[#d4cdc0] px-5 py-2.5 text-xs font-semibold text-[#4c535b] hover:bg-[#f3efe8]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[#0e5f5b] px-6 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0a4744] disabled:opacity-50"
        >
          {saving ? "Saving..." : isNew ? "Publish Project" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
