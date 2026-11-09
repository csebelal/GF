"use client";

import { useEffect, useState } from "react";

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
      setMessage({ text: "Failed to load media files", type: "error" });
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

      setMessage({ text: "Upload completed successfully!", type: "success" });
      await loadMedia();
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to upload files", type: "error" });
    } finally {
      setUploading(false);
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
          <h2 className="text-xl font-bold text-[#191c20]">Media Library</h2>
          <p className="text-xs text-[#646b73]">
            Upload and manage images, diagrams, CV PDFs, and file attachments
          </p>
        </div>

        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#0e5f5b] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0a4744]">
          <span>+</span>
          <span>{uploading ? "Uploading..." : "Upload New Files"}</span>
          <input
            type="file"
            multiple
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
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

      {loading ? (
        <div className="p-12 text-center text-sm text-[#646b73]">Loading media files...</div>
      ) : files.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#d4cdc0] p-12 text-center">
          <p className="text-sm font-semibold text-[#191c20]">No media uploaded yet</p>
          <p className="mt-1 text-xs text-[#646b73]">
            Click the "Upload New Files" button above to upload images, PDFs, or CSV files.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {files.map((file) => (
            <div
              key={file.name}
              className="group flex flex-col rounded-xl border border-[#e6e1d8] bg-white overflow-hidden shadow-sm transition hover:border-[#0e5f5b]"
            >
              <div className="flex h-36 items-center justify-center bg-[#faf8f4] overflow-hidden">
                {file.isImage ? (
                  <img
                    src={file.url}
                    alt={file.name}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-[#646b73]">
                    <span className="rounded bg-[#e6e1d8] px-2 py-0.5 text-[11px] font-bold text-[#191c20]">
                      {file.name.split(".").pop()?.toUpperCase() || "FILE"}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col justify-between p-3">
                <div>
                  <p className="truncate text-xs font-semibold text-[#191c20]" title={file.name}>
                    {file.name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#646b73]">{formatSize(file.size)}</p>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-[#e6e1d8] pt-2">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(file.url)}
                    className="text-[11px] font-semibold text-[#0e5f5b] hover:underline"
                  >
                    {copiedUrl === file.url ? "✓ Copied!" : "Copy URL"}
                  </button>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-[#646b73] hover:text-[#191c20]"
                  >
                    Open ↗
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
