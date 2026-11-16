"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ArrowUpRight,
  Check,
  Close,
  Copy,
  Edit,
  FileText,
  Plus,
  Search,
  Tag as TagIcon,
  Trash,
} from "@/components/Icons";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e5f5b] focus-visible:ring-offset-2";

interface MediaItem {
  name: string;
  url: string;
  size: number;
  updatedAt: string;
  isImage: boolean;
  title?: string;
  alt?: string;
  caption?: string;
  tags?: string[];
  uploadedBy?: string;
}

export default function AdminMediaPage() {
  const [files, setFiles] = useState<MediaItem[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "image" | "document">("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Edit Metadata Modal state
  const [editingFile, setEditingFile] = useState<MediaItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAlt, setEditAlt] = useState("");
  const [editCaption, setEditCaption] = useState("");
  const [editTags, setEditTags] = useState("");
  const [savingMeta, setSavingMeta] = useState(false);

  // Delete Modal state
  const [deletingFile, setDeletingFile] = useState<MediaItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadMedia = async () => {
    try {
      const res = await fetch("/api/admin/media");
      const json = await res.json();
      setFiles(json.files || []);
      setAllTags(json.tags || []);
    } catch {
      setMessage({ text: "Failed to load media files.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setUploading(true);
    setMessage(null);

    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const fd = new FormData();
        fd.append("file", file);

        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
      }

      setMessage({ text: "Upload completed successfully.", type: "success" });
      await loadMedia();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload files.";
      setMessage({ text: msg, type: "error" });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  // Open Edit Modal
  const openEditModal = (file: MediaItem) => {
    setEditingFile(file);
    setEditTitle(file.title || "");
    setEditAlt(file.alt || "");
    setEditCaption(file.caption || "");
    setEditTags(Array.isArray(file.tags) ? file.tags.join(", ") : "");
  };

  const closeEditModal = () => {
    if (savingMeta) return;
    setEditingFile(null);
  };

  // Save Metadata
  const handleSaveMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFile) return;

    setSavingMeta(true);
    setMessage(null);

    try {
      const tagsArray = editTags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const res = await fetch(`/api/admin/media/${encodeURIComponent(editingFile.name)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          alt: editAlt,
          caption: editCaption,
          tags: tagsArray,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update metadata");

      setMessage({ text: `Updated details for "${editingFile.name}".`, type: "success" });
      closeEditModal();
      await loadMedia();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update file details.";
      setMessage({ text: msg, type: "error" });
    } finally {
      setSavingMeta(false);
    }
  };

  // Open Delete Modal
  const openDeleteModal = (file: MediaItem) => {
    setDeletingFile(file);
  };

  const closeDeleteModal = () => {
    if (isDeleting) return;
    setDeletingFile(null);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingFile) return;

    setIsDeleting(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/media/${encodeURIComponent(deletingFile.name)}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete file");

      setMessage({ text: `"${deletingFile.name}" was permanently removed.`, type: "success" });
      closeDeleteModal();
      await loadMedia();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete file.";
      setMessage({ text: msg, type: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered files list
  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      // Type filter
      if (typeFilter === "image" && !file.isImage) return false;
      if (typeFilter === "document" && file.isImage) return false;

      // Tag filter
      if (selectedTag) {
        const itemTags = (file.tags || []).map((t) => t.toLowerCase());
        if (!itemTags.includes(selectedTag.toLowerCase())) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = file.name.toLowerCase().includes(query);
        const matchTitle = (file.title || "").toLowerCase().includes(query);
        const matchCaption = (file.caption || "").toLowerCase().includes(query);
        const matchTags = (file.tags || []).some((t) => t.toLowerCase().includes(query));
        if (!matchName && !matchTitle && !matchCaption && !matchTags) return false;
      }

      return true;
    });
  }, [files, typeFilter, selectedTag, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#191c20]">Media Library</h2>
          <p className="mt-0.5 text-sm text-[#4c535b]">
            Manage project media, images, CV documents, tags, and file metadata.
          </p>
        </div>

        <label
          className={`inline-flex min-h-[40px] cursor-pointer items-center gap-2 rounded-xl bg-[#0e5f5b] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-[#0a4744] focus-within:ring-2 focus-within:ring-[#0e5f5b] focus-within:ring-offset-2 ${
            uploading ? "pointer-events-none opacity-60" : ""
          }`}
        >
          <Plus className="size-4" />
          <span>{uploading ? "Uploading..." : "Upload New Files"}</span>
          <input
            type="file"
            multiple
            accept=".png,.jpg,.jpeg,.webp,.pdf,image/png,image/jpeg,image/webp,application/pdf"
            className="sr-only"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {/* Notification banner */}
      {message ? (
        <div
          role={message.type === "error" ? "alert" : "status"}
          aria-live="polite"
          className={`flex items-start justify-between gap-2.5 rounded-xl border p-3.5 text-sm ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-[#166534]"
              : "border-red-200 bg-red-50 text-[#991b1b]"
          }`}
        >
          <div className="flex items-start gap-2.5">
            {message.type === "success" ? (
              <Check className="mt-0.5 size-4 shrink-0" />
            ) : (
              <Alert className="mt-0.5 size-4 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="text-muted hover:text-ink cursor-pointer"
            aria-label="Dismiss message"
          >
            <Close className="size-4" />
          </button>
        </div>
      ) : null}

      {/* Search, Type Filter & Tag Bar */}
      <div className="space-y-3 rounded-2xl border border-[#e6e1d8] bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#767e89]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search media by title, filename, or tag..."
              className={`w-full rounded-xl border border-[#d4cdc0] bg-[#faf8f4] py-2 pl-9 pr-8 text-xs text-[#191c20] placeholder-[#767e89] transition-colors focus:border-[#0e5f5b] focus:bg-white ${focusRing}`}
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#767e89] hover:text-[#191c20]"
                aria-label="Clear search"
              >
                <Close className="size-3.5" />
              </button>
            ) : null}
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center gap-1 rounded-xl bg-[#faf8f4] p-1 border border-[#e6e1d8]">
            {(
              [
                { id: "all", label: "All Types" },
                { id: "image", label: "Images" },
                { id: "document", label: "Documents" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTypeFilter(tab.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors duration-150 cursor-pointer ${
                  typeFilter === tab.id
                    ? "bg-[#0e5f5b] text-white shadow-xs"
                    : "text-[#4c535b] hover:text-[#191c20]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tag filter chips */}
        {allTags.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#f0ede6]">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#767e89] mr-1">
              <TagIcon className="size-3" />
              <span>Filter by tag:</span>
            </span>

            {allTags.map((tag) => {
              const active = selectedTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(active ? null : tag)}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-all duration-150 cursor-pointer ${
                    active
                      ? "bg-[#0e5f5b] text-white shadow-xs ring-1 ring-[#0e5f5b]"
                      : "bg-[#f0ede6] text-[#4c535b] hover:bg-[#e6e1d8] hover:text-[#191c20]"
                  }`}
                >
                  <span>#{tag}</span>
                  {active ? <Close className="size-2.5" /> : null}
                </button>
              );
            })}

            {selectedTag ? (
              <button
                type="button"
                onClick={() => setSelectedTag(null)}
                className="text-[11px] font-medium text-[#0e5f5b] hover:underline cursor-pointer ml-1"
              >
                Clear tag
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Main Media Grid */}
      {loading ? (
        <div className="rounded-2xl border border-[#e6e1d8] bg-white p-12 text-center text-sm text-[#4c535b]">
          Loading media library...
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#d4cdc0] bg-white p-12 text-center">
          <p className="text-sm font-semibold text-[#191c20]">
            {files.length === 0 ? "No media uploaded yet" : "No matching files found"}
          </p>
          <p className="mt-1 text-xs text-[#4c535b]">
            {files.length === 0
              ? "Use the 'Upload New Files' button above to add images or PDF documents."
              : "Try adjusting your search query or tag filters."}
          </p>
          {files.length > 0 ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setTypeFilter("all");
                setSelectedTag(null);
              }}
              className="mt-3 text-xs font-semibold text-[#0e5f5b] hover:underline cursor-pointer"
            >
              Reset all filters
            </button>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredFiles.map((file) => (
            <article
              key={file.name}
              className="group flex flex-col overflow-hidden rounded-2xl border border-[#e6e1d8] bg-white shadow-sm transition-all duration-200 hover:border-[#0e5f5b] hover:shadow-md"
            >
              {/* Media Thumbnail */}
              <div className="relative flex h-44 items-center justify-center overflow-hidden bg-[#faf8f4]">
                {file.isImage ? (
                  <img
                    src={file.url}
                    alt={file.alt || file.title || file.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-102"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-[#4c535b]">
                    <FileText className="size-10 text-[#0e5f5b]" />
                    <span className="rounded-md bg-[#e6e1d8] px-2 py-0.5 text-[11px] font-bold text-[#191c20]">
                      {file.name.split(".").pop()?.toUpperCase() || "PDF"}
                    </span>
                  </div>
                )}

                {/* Top quick badges */}
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  <span className="rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-medium text-[#191c20] shadow-xs backdrop-blur-xs">
                    {formatSize(file.size)}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="flex flex-1 flex-col justify-between p-3.5 space-y-3">
                <div className="space-y-1">
                  {/* Title or Fallback */}
                  <h3
                    className="text-xs font-semibold text-[#191c20] line-clamp-1"
                    title={file.title || file.name}
                  >
                    {file.title || file.name}
                  </h3>

                  {/* File name subtitle */}
                  <p
                    className="font-mono text-[10px] text-[#767e89] truncate"
                    title={file.name}
                  >
                    {file.name}
                  </p>

                  {/* Tags list */}
                  {Array.isArray(file.tags) && file.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {file.tags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setSelectedTag(tag)}
                          className="rounded-md bg-[#faf8f4] border border-[#e6e1d8] px-1.5 py-0.2 text-[9px] font-medium text-[#0e5f5b] hover:bg-[#e1eeec] cursor-pointer"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  ) : null}

                  {file.updatedAt ? (
                    <p className="text-[10px] text-[#767e89] pt-0.5">
                      Uploaded {formatDate(file.updatedAt)}
                    </p>
                  ) : null}
                </div>

                {/* Action Toolbar */}
                <div className="flex items-center justify-between border-t border-[#f0ede6] pt-2.5">
                  <div className="flex items-center gap-1">
                    {/* Copy URL */}
                    <button
                      type="button"
                      onClick={() => copyToClipboard(file.url)}
                      title="Copy public URL"
                      className={`inline-flex min-h-[28px] cursor-pointer items-center gap-1 rounded-md px-1.5 text-[11px] font-semibold text-[#0e5f5b] transition-colors duration-200 hover:bg-[#e1eeec] ${focusRing}`}
                    >
                      {copiedUrl === file.url ? (
                        <>
                          <Check className="size-3" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-3" />
                          <span>URL</span>
                        </>
                      )}
                    </button>

                    {/* Open in new tab */}
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open file in new tab"
                      className={`inline-flex min-h-[28px] items-center gap-1 rounded-md px-1.5 text-[11px] font-medium text-[#4c535b] transition-colors duration-200 hover:text-[#191c20] ${focusRing}`}
                    >
                      <ArrowUpRight className="size-3" />
                    </a>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Edit Details */}
                    <button
                      type="button"
                      onClick={() => openEditModal(file)}
                      title="Edit file details (title, tags, alt text)"
                      className={`inline-flex min-h-[28px] cursor-pointer items-center gap-1 rounded-md px-2 text-[11px] font-semibold text-[#191c20] bg-[#faf8f4] border border-[#e6e1d8] transition-colors duration-200 hover:bg-[#e6e1d8] ${focusRing}`}
                    >
                      <Edit className="size-3 text-[#0e5f5b]" />
                      <span>Edit</span>
                    </button>

                    {/* Delete File */}
                    <button
                      type="button"
                      onClick={() => openDeleteModal(file)}
                      title="Delete file permanently"
                      className={`inline-flex min-h-[28px] cursor-pointer items-center justify-center rounded-md p-1.5 text-red-600 transition-colors duration-200 hover:bg-red-50 ${focusRing}`}
                    >
                      <Trash className="size-3.5" />
                      <span className="sr-only">Delete file</span>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Edit Metadata Modal */}
      {editingFile ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg rounded-2xl border border-[#e6e1d8] bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-[#191c20]">Edit Media Information</h3>
                <p className="mt-0.5 text-xs text-[#767e89] font-mono break-all">
                  {editingFile.name}
                </p>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                disabled={savingMeta}
                className="rounded-lg p-1 text-[#767e89] hover:bg-[#f0ede6] hover:text-[#191c20] cursor-pointer"
              >
                <Close className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMetadata} className="mt-4 space-y-3.5">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-[#191c20]">
                  Display Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="e.g. Lead Routing Flow Overview Diagram"
                  maxLength={200}
                  className={`mt-1 w-full rounded-xl border border-[#d4cdc0] bg-[#faf8f4] px-3 py-2 text-xs text-[#191c20] focus:border-[#0e5f5b] focus:bg-white ${focusRing}`}
                />
                <p className="mt-1 text-[11px] text-[#767e89]">
                  A descriptive title displayed in the Media Library.
                </p>
              </div>

              {/* Alt Text (for images) */}
              {editingFile.isImage ? (
                <div>
                  <label className="block text-xs font-semibold text-[#191c20]">
                    Alt Text (Accessibility & SEO)
                  </label>
                  <input
                    type="text"
                    value={editAlt}
                    onChange={(e) => setEditAlt(e.target.value)}
                    placeholder="e.g. Screenshot of the Salesforce flow builder canvas"
                    maxLength={300}
                    className={`mt-1 w-full rounded-xl border border-[#d4cdc0] bg-[#faf8f4] px-3 py-2 text-xs text-[#191c20] focus:border-[#0e5f5b] focus:bg-white ${focusRing}`}
                  />
                </div>
              ) : null}

              {/* Tags */}
              <div>
                <label className="block text-xs font-semibold text-[#191c20]">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  placeholder="e.g. flow, architecture, salesforce, cv"
                  className={`mt-1 w-full rounded-xl border border-[#d4cdc0] bg-[#faf8f4] px-3 py-2 text-xs text-[#191c20] focus:border-[#0e5f5b] focus:bg-white ${focusRing}`}
                />
                <p className="mt-1 text-[11px] text-[#767e89]">
                  Keywords to easily search and categorize this media file.
                </p>
              </div>

              {/* Caption / Notes */}
              <div>
                <label className="block text-xs font-semibold text-[#191c20]">
                  Notes / Caption
                </label>
                <textarea
                  rows={2}
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  placeholder="Optional internal notes about where this asset is used..."
                  maxLength={1000}
                  className={`mt-1 w-full rounded-xl border border-[#d4cdc0] bg-[#faf8f4] px-3 py-2 text-xs text-[#191c20] focus:border-[#0e5f5b] focus:bg-white ${focusRing}`}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f0ede6]">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={savingMeta}
                  className="rounded-xl border border-[#d4cdc0] px-4 py-2 text-xs font-semibold text-[#4c535b] hover:bg-[#faf8f4] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingMeta}
                  className="rounded-xl bg-[#0e5f5b] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#0a4744] cursor-pointer disabled:opacity-60"
                >
                  {savingMeta ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Delete Confirmation Modal */}
      {deletingFile ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-red-50 p-2.5 text-red-600">
                <Trash className="size-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-[#191c20]">Delete Media File?</h3>
                <p className="mt-1 text-xs text-[#4c535b] leading-relaxed">
                  Are you sure you want to delete{" "}
                  <strong className="text-[#191c20] break-all">{deletingFile.title || deletingFile.name}</strong>?
                </p>
                <p className="mt-1 font-mono text-[11px] text-[#767e89] break-all">
                  ({deletingFile.name})
                </p>
                <div className="mt-3 rounded-lg bg-red-50 border border-red-200 p-2.5 text-[11px] text-red-800">
                  ⚠️ This action permanently removes the file from the server. If this file is referenced in any active projects or your CV, it will no longer be available.
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 border-t border-[#f0ede6] pt-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="rounded-xl border border-[#d4cdc0] px-4 py-2 text-xs font-semibold text-[#4c535b] hover:bg-[#faf8f4] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-red-700 cursor-pointer disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
