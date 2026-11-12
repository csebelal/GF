"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Alert, Check, Close, ImageIcon, Plus } from "@/components/Icons";
import { isSafeUrl } from "@/lib/security/sanitize";
import {
  adminFocusRing,
  adminInputCompactClass,
  adminPrimaryBtnClass,
  adminSecondaryBtnClass,
} from "./FormPrimitives";

interface MediaFile {
  name: string;
  url: string;
  size: number;
  isImage: boolean;
}

interface MediaPickerModalProps {
  open: boolean;
  onClose: () => void;
  onInsert: (payload: { url: string; alt: string; caption?: string }) => void;
}

export function MediaPickerModal({ open, onClose, onInsert }: MediaPickerModalProps) {
  const titleId = useId();
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedUrl, setSelectedUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const loadMedia = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/media");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not load media library.");
      const images = (json.files || []).filter((f: MediaFile) => f.isImage);
      setFiles(images);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load media files.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setSelectedUrl("");
    setAltText("");
    setCaption("");
    loadMedia();
    setTimeout(() => closeBtnRef.current?.focus(), 0);
  }, [open, loadMedia]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed.");

      setSelectedUrl(data.url);
      if (!altText.trim()) {
        setAltText(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " "));
      }
      await loadMedia();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to upload image.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleConfirm = () => {
    const cleanUrl = selectedUrl.trim();
    if (!cleanUrl || !isSafeUrl(cleanUrl)) {
      setError("Please select an image or enter a valid image URL (starting with / or https://).");
      return;
    }
    onInsert({
      url: cleanUrl,
      alt: altText.trim() || "Documentation screenshot",
      caption: caption.trim() || undefined,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-lift"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-accent-soft text-accent-strong">
              <ImageIcon className="size-4" />
            </span>
            <div>
              <h3 id={titleId} className="text-sm font-bold text-ink">
                Insert Image or Diagram
              </h3>
              <p className="text-xs text-muted">
                Upload a new file, pick from Media Library, or paste a path.
              </p>
            </div>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close image picker"
            className={`inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-muted hover:bg-tint hover:text-ink ${adminFocusRing}`}
          >
            <Close className="size-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {error ? (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-danger-line bg-danger-soft p-3 text-xs text-danger"
            >
              <Alert className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          {/* Direct Upload Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-accent-line bg-accent-soft/35 px-4 py-3">
            <div>
              <p className="text-xs font-semibold text-ink">Upload new image</p>
              <p className="text-[11px] text-muted">PNG, JPG, or WebP (max 5 MB)</p>
            </div>
            <label
              className={`inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-xl bg-accent px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-accent-strong focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2 ${
                uploading ? "pointer-events-none opacity-60" : ""
              }`}
            >
              <Plus className="size-3.5" />
              <span>{uploading ? "Uploading..." : "Choose File"}</span>
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={handleUpload}
                disabled={uploading}
              />
            </label>
          </div>

          {/* Media Library Grid */}
          <div>
            <p className="mb-2 text-xs font-semibold text-body">
              Media Library ({files.length})
            </p>
            {loading ? (
              <div className="rounded-xl border border-line bg-canvas p-6 text-center text-xs text-muted">
                Loading uploaded images...
              </div>
            ) : files.length === 0 ? (
              <div className="rounded-xl border border-line bg-canvas p-6 text-center text-xs text-muted">
                No uploaded images yet. Upload one above or enter a path below.
              </div>
            ) : (
              <div className="grid max-h-48 grid-cols-3 gap-2.5 overflow-y-auto rounded-xl border border-line bg-canvas p-2.5 sm:grid-cols-4">
                {files.map((file) => {
                  const isSelected = selectedUrl === file.url;
                  return (
                    <button
                      key={file.url}
                      type="button"
                      onClick={() => {
                        setSelectedUrl(file.url);
                        if (!altText.trim()) {
                          setAltText(
                            file.name
                              .replace(/^\d+-/, "")
                              .replace(/-[a-f0-9]+\.[^.]+$/i, "")
                              .replace(/[_-]+/g, " ")
                          );
                        }
                      }}
                      className={`group relative overflow-hidden rounded-lg border text-left transition-all ${adminFocusRing} ${
                        isSelected
                          ? "border-accent ring-2 ring-accent/30"
                          : "border-line bg-surface hover:border-line-strong"
                      }`}
                    >
                      <div className="aspect-[16/10] w-full overflow-hidden bg-tint">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={file.url}
                          alt={file.name}
                          loading="lazy"
                          className="size-full object-cover"
                        />
                      </div>
                      <p className="truncate px-2 py-1 text-[10px] font-medium text-body">
                        {file.name}
                      </p>
                      {isSelected ? (
                        <span className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-accent text-white shadow">
                          <Check className="size-3" />
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* URL & Metadata */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="media-picker-url" className="mb-1 block text-xs font-semibold text-body">
                Image URL or Path
              </label>
              <input
                id="media-picker-url"
                type="text"
                value={selectedUrl}
                onChange={(e) => setSelectedUrl(e.target.value)}
                placeholder="/uploads/... or /images/samples/..."
                className={adminInputCompactClass}
              />
            </div>
            <div>
              <label htmlFor="media-picker-alt" className="mb-1 block text-xs font-semibold text-body">
                Alt Description (Accessibility)
              </label>
              <input
                id="media-picker-alt"
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="e.g. Flow decision branches diagram"
                className={adminInputCompactClass}
              />
            </div>
            <div>
              <label htmlFor="media-picker-caption" className="mb-1 block text-xs font-semibold text-body">
                Caption (Optional)
              </label>
              <input
                id="media-picker-caption"
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Shown below the image"
                className={adminInputCompactClass}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 border-t border-line bg-canvas px-5 py-3.5">
          <button type="button" onClick={onClose} className={adminSecondaryBtnClass}>
            Cancel
          </button>
          <button type="button" onClick={handleConfirm} className={adminPrimaryBtnClass}>
            Insert Image
          </button>
        </div>
      </div>
    </div>
  );
}
