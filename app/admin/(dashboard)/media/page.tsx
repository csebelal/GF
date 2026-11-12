"use client";

import { useEffect, useState } from "react";
import { Alert, ArrowUpRight, Check, Copy, FileText, Plus } from "@/components/Icons";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e5f5b] focus-visible:ring-offset-2";

export default function AdminMediaPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const loadMedia = async () => {
    try {
      const res = await fetch("/api/admin/media");
      const json = await res.json();
      setFiles(json.files || []);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#191c20]">Media Library</h2>
          <p className="mt-0.5 text-sm text-[#4c535b]">
            Upload and manage validated images (PNG, JPG, WebP) and PDF documents.
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

      {loading ? (
        <div className="rounded-2xl border border-[#e6e1d8] bg-white p-12 text-center text-sm text-[#4c535b]">
          Loading media files...
        </div>
      ) : files.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#d4cdc0] bg-white p-12 text-center">
          <p className="text-sm font-semibold text-[#191c20]">No media uploaded yet</p>
          <p className="mt-1 text-xs text-[#4c535b]">
            Use the &ldquo;Upload New Files&rdquo; button above to add PNG, JPG, WebP images or PDF
            documents.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {files.map((file) => (
            <article
              key={file.name}
              className="group flex flex-col overflow-hidden rounded-2xl border border-[#e6e1d8] bg-white shadow-sm transition-colors duration-200 hover:border-[#0e5f5b]"
            >
              <div className="flex h-40 items-center justify-center overflow-hidden bg-[#faf8f4]">
                {file.isImage ? (
                  <img
                    src={file.url}
                    alt={file.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-[#4c535b]">
                    <FileText className="size-8 text-[#0e5f5b]" />
                    <span className="rounded-md bg-[#e6e1d8] px-2 py-0.5 text-[11px] font-bold text-[#191c20]">
                      {file.name.split(".").pop()?.toUpperCase() || "FILE"}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col justify-between p-3.5">
                <div>
                  <p className="truncate text-xs font-semibold text-[#191c20]" title={file.name}>
                    {file.name}
                  </p>
                  <p className="mt-0.5 text-[11px] tabular-nums text-[#4c535b]">
                    {formatSize(file.size)}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-[#e6e1d8] pt-2.5">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(file.url)}
                    className={`inline-flex min-h-[30px] cursor-pointer items-center gap-1 rounded-md px-1.5 text-xs font-semibold text-[#0e5f5b] transition-colors duration-200 hover:bg-[#e1eeec] ${focusRing}`}
                  >
                    {copiedUrl === file.url ? (
                      <>
                        <Check className="size-3.5" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex min-h-[30px] items-center gap-1 rounded-md px-1.5 text-xs font-medium text-[#4c535b] transition-colors duration-200 hover:text-[#191c20] ${focusRing}`}
                  >
                    <span>Open</span>
                    <ArrowUpRight className="size-3.5" />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
