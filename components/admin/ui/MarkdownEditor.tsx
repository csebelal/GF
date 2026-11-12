"use client";

import { useDeferredValue, useEffect, useId, useMemo, useRef, useState } from "react";
import { DocumentationRenderer } from "@/components/DocumentationRenderer";
import { Alert, Close, Eye, ImageIcon, LinkIcon } from "@/components/Icons";
import {
  buildMarkdownTable,
  DOC_TEMPLATES,
  extractHeadingOutline,
  getMarkdownStats,
  handleListTab,
  handleSmartEnter,
  insertBlockSnippet,
  toggleInlineWrap,
  toggleLinePrefix,
  type TextEditResult,
} from "@/lib/markdown-editor-utils";
import { isSafeUrl } from "@/lib/security/sanitize";
import {
  adminFocusRing,
  adminInputCompactClass,
  adminPrimaryBtnClass,
  adminSecondaryBtnClass,
  adminTextareaClass,
} from "./FormPrimitives";
import { MediaPickerModal } from "./MediaPickerModal";

type ViewMode = "write" | "split" | "preview";

interface MarkdownEditorProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  variant?: "full" | "compact";
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

export function MarkdownEditor({
  id,
  value,
  onChange,
  placeholder,
  rows = 14,
  variant = "full",
  ariaLabel = "Markdown editor",
  ariaDescribedBy,
}: MarkdownEditorProps) {
  const generatedId = useId();
  const editorId = id || generatedId;
  const isFull = variant === "full";

  const [mode, setMode] = useState<ViewMode>("write");
  const [showOutline, setShowOutline] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [activePopover, setActivePopover] = useState<"templates" | "table" | "link" | null>(null);
  const [mediaOpen, setMediaOpen] = useState(false);

  // Link builder state
  const [linkText, setLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("https://");
  const [linkError, setLinkError] = useState<string | null>(null);
  const savedSelectionRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 });

  // Table builder hover grid state
  const [tableHover, setTableHover] = useState<{ cols: number; rows: number }>({ cols: 3, rows: 3 });

  // Drag/drop/paste image upload state
  const [uploadingDrop, setUploadingDrop] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const toolbarContainerRef = useRef<HTMLDivElement>(null);

  const deferredPreviewMarkdown = useDeferredValue(value);
  const outline = useMemo(() => (isFull ? extractHeadingOutline(value) : []), [isFull, value]);
  const stats = useMemo(() => (isFull ? getMarkdownStats(value) : null), [isFull, value]);

  // Close popovers on outside click or Escape
  useEffect(() => {
    if (!activePopover) return;
    const onPointerDown = (e: MouseEvent) => {
      if (toolbarContainerRef.current && !toolbarContainerRef.current.contains(e.target as Node)) {
        setActivePopover(null);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActivePopover(null);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [activePopover]);

  // Exit fullscreen on Escape if no popover/modal is open
  useEffect(() => {
    if (!isFullscreen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !activePopover && !mediaOpen) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isFullscreen, activePopover, mediaOpen]);

  const applyEdit = (edit: TextEditResult) => {
    onChange(edit.nextValue);
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(edit.nextStart, edit.nextEnd);
    });
  };

  const getSelection = () => {
    const el = textareaRef.current;
    if (!el) return { start: value.length, end: value.length };
    return { start: el.selectionStart, end: el.selectionEnd };
  };

  const runInline = (prefix: string, suffix = prefix, defaultText = "text") => {
    const { start, end } = getSelection();
    applyEdit(toggleInlineWrap(value, start, end, prefix, suffix, defaultText));
  };

  const runLinePrefix = (prefix: string, defaultText = "Heading") => {
    const { start, end } = getSelection();
    applyEdit(toggleLinePrefix(value, start, end, prefix, defaultText));
  };

  const runBlockInsert = (snippet: string) => {
    const { start, end } = getSelection();
    applyEdit(insertBlockSnippet(value, start, end, snippet));
  };

  const openLinkPopover = () => {
    const { start, end } = getSelection();
    savedSelectionRef.current = { start, end };
    const selected = value.slice(start, end);
    setLinkText(selected);
    setLinkUrl("https://");
    setLinkError(null);
    setActivePopover(activePopover === "link" ? null : "link");
  };

  const handleInsertLink = () => {
    const cleanUrl = linkUrl.trim();
    if (!cleanUrl || !isSafeUrl(cleanUrl)) {
      setLinkError("Enter a valid URL starting with https://, http://, /, or mailto:");
      return;
    }
    const label = linkText.trim() || "Link text";
    const { start, end } = savedSelectionRef.current;
    const md = `[${label}](${cleanUrl})`;
    const nextValue = value.slice(0, start) + md + value.slice(end);
    setActivePopover(null);
    applyEdit({
      nextValue,
      nextStart: start + md.length,
      nextEnd: start + md.length,
    });
  };

  const uploadAndInsertImage = async (file: File) => {
    setUploadingDrop(true);
    setUploadNotice(null);
    const { start, end } = getSelection();

    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Image upload failed.");

      const alt = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ") || "Screenshot";
      const snippet = `![${alt}](${data.url})`;
      applyEdit(insertBlockSnippet(value, start, end, snippet));
    } catch (err: unknown) {
      setUploadNotice(err instanceof Error ? err.message : "Failed to upload image.");
    } finally {
      setUploadingDrop(false);
    }
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const mod = e.ctrlKey || e.metaKey;

    if (mod && e.key.toLowerCase() === "b") {
      e.preventDefault();
      applyEdit(toggleInlineWrap(value, start, end, "**", "**", "bold text"));
      return;
    }
    if (mod && e.key.toLowerCase() === "i") {
      e.preventDefault();
      applyEdit(toggleInlineWrap(value, start, end, "*", "*", "italic text"));
      return;
    }
    if (mod && e.key.toLowerCase() === "k") {
      e.preventDefault();
      openLinkPopover();
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      applyEdit(handleListTab(value, start, end, e.shiftKey));
      return;
    }
    if (e.key === "Enter" && !e.shiftKey && !mod) {
      const smart = handleSmartEnter(value, start, end);
      if (smart) {
        e.preventDefault();
        applyEdit(smart);
      }
    }
  };

  const jumpToOffset = (offset: number) => {
    if (mode === "preview") {
      setMode("split");
    }
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(offset, offset);
      // Approximate vertical scroll based on line index
      const lineIdx = value.slice(0, offset).split("\n").length - 1;
      const lineHeight = 20;
      el.scrollTop = Math.max(0, lineIdx * lineHeight - 36);
    });
  };

  const toolbarBtnClass = `inline-flex min-h-[30px] cursor-pointer items-center gap-1 rounded-lg border border-transparent px-2.5 py-1 text-xs text-ink transition-colors duration-150 hover:border-line-strong hover:bg-surface ${adminFocusRing}`;
  const modeTabClass = (active: boolean) =>
    `inline-flex min-h-[30px] cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${adminFocusRing} ${
      active ? "bg-surface text-accent-strong shadow-sm" : "text-body hover:text-ink"
    }`;

  const containerClass = isFullscreen
    ? "fixed inset-0 z-50 flex flex-col bg-surface p-4 sm:p-6 overflow-hidden"
    : "space-y-3";

  return (
    <div className={containerClass}>
      {/* Top Bar: View Modes, Outline, Fullscreen */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div
          role="group"
          aria-label="Editor view mode"
          className="inline-flex items-center rounded-xl border border-line bg-canvas p-1"
        >
          <button
            type="button"
            onClick={() => setMode("write")}
            aria-pressed={mode === "write"}
            className={modeTabClass(mode === "write")}
          >
            Write
          </button>
          {isFull ? (
            <button
              type="button"
              onClick={() => setMode("split")}
              aria-pressed={mode === "split"}
              className={modeTabClass(mode === "split")}
            >
              Split
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setMode("preview")}
            aria-pressed={mode === "preview"}
            className={modeTabClass(mode === "preview")}
          >
            <Eye className="size-3.5" />
            <span>Preview</span>
          </button>
        </div>

        {isFull ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowOutline((v) => !v)}
              aria-pressed={showOutline}
              className={`inline-flex min-h-[32px] cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-semibold transition-colors ${adminFocusRing} ${
                showOutline
                  ? "border-accent-line bg-accent-soft text-accent-strong"
                  : "border-line bg-canvas text-body hover:text-ink"
              }`}
            >
              <span>TOC Outline ({outline.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setIsFullscreen((v) => !v)}
              aria-pressed={isFullscreen}
              className={`inline-flex min-h-[32px] cursor-pointer items-center gap-1.5 rounded-xl border border-line bg-canvas px-3 py-1 text-xs font-semibold text-body transition-colors hover:text-ink ${adminFocusRing}`}
            >
              {isFullscreen ? (
                <>
                  <Close className="size-3.5" />
                  <span>Exit Focus</span>
                </>
              ) : (
                <span>Expand Editor</span>
              )}
            </button>
          </div>
        ) : null}
      </div>

      {/* Toolbar */}
      {mode !== "preview" && (
        <div ref={toolbarContainerRef} className="relative">
          <div
            role="toolbar"
            aria-label="Formatting toolbar"
            className="flex flex-wrap items-center gap-1 rounded-xl border border-line bg-canvas p-1.5 text-xs"
          >
            {isFull ? (
              <>
                <button
                  type="button"
                  onClick={() => runLinePrefix("## ", "Section heading")}
                  className={`${toolbarBtnClass} font-bold`}
                  title="Heading 2 (TOC main section)"
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => runLinePrefix("### ", "Subsection heading")}
                  className={`${toolbarBtnClass} font-bold`}
                  title="Heading 3 (TOC sub-section)"
                >
                  H3
                </button>
                <span aria-hidden="true" className="mx-1 my-0.5 h-4 w-px bg-line-strong" />
              </>
            ) : null}

            <button
              type="button"
              onClick={() => runInline("**", "**", "bold text")}
              className={`${toolbarBtnClass} font-bold`}
              title="Bold (Ctrl+B)"
            >
              B
            </button>
            <button
              type="button"
              onClick={() => runInline("*", "*", "italic text")}
              className={`${toolbarBtnClass} italic`}
              title="Italic (Ctrl+I)"
            >
              I
            </button>
            <button
              type="button"
              onClick={() => runInline("`", "`", "code")}
              className={`${toolbarBtnClass} font-mono`}
              title="Inline code"
            >
              `code`
            </button>
            {isFull ? (
              <button
                type="button"
                onClick={() => runBlockInsert("```\n// Code or formula example\n```")}
                className={`${toolbarBtnClass} font-mono`}
                title="Code block"
              >
                &lt;/&gt;
              </button>
            ) : null}

            <span aria-hidden="true" className="mx-1 my-0.5 h-4 w-px bg-line-strong" />

            <button
              type="button"
              onClick={() => runLinePrefix("- ", "List item")}
              className={toolbarBtnClass}
              title="Bullet list"
            >
              • List
            </button>
            <button
              type="button"
              onClick={() => runLinePrefix("1. ", "First item")}
              className={toolbarBtnClass}
              title="Numbered list"
            >
              1. List
            </button>
            {isFull ? (
              <button
                type="button"
                onClick={() => runLinePrefix("- [ ] ", "Verification check")}
                className={toolbarBtnClass}
                title="Checklist item"
              >
                ☑ Task
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => runLinePrefix("> ", "Important callout note")}
              className={toolbarBtnClass}
              title="Callout quote"
            >
              &ldquo; Quote
            </button>

            <span aria-hidden="true" className="mx-1 my-0.5 h-4 w-px bg-line-strong" />

            <button
              type="button"
              onClick={openLinkPopover}
              aria-expanded={activePopover === "link"}
              className={`${toolbarBtnClass} font-medium text-accent-strong`}
              title="Insert Link (Ctrl+K)"
            >
              <LinkIcon className="size-3.5" />
              <span>Link</span>
            </button>

            {isFull ? (
              <>
                <button
                  type="button"
                  onClick={() => setActivePopover(activePopover === "table" ? null : "table")}
                  aria-expanded={activePopover === "table"}
                  className={`${toolbarBtnClass} font-medium text-accent-strong`}
                  title="Insert table"
                >
                  ⊞ Table
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActivePopover(null);
                    setMediaOpen(true);
                  }}
                  className={`${toolbarBtnClass} font-medium text-accent-strong`}
                  title="Upload or pick image"
                >
                  <ImageIcon className="size-3.5" />
                  <span>Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => runBlockInsert("---")}
                  className={toolbarBtnClass}
                  title="Insert section divider"
                >
                  ― Divider
                </button>

                <div className="ml-auto">
                  <button
                    type="button"
                    onClick={() =>
                      setActivePopover(activePopover === "templates" ? null : "templates")
                    }
                    aria-expanded={activePopover === "templates"}
                    className={`inline-flex min-h-[30px] cursor-pointer items-center gap-1 rounded-lg border border-accent-line bg-accent-soft/70 px-2.5 py-1 text-xs font-semibold text-accent-strong transition-colors hover:bg-accent-soft ${adminFocusRing}`}
                  >
                    + Insert Template
                  </button>
                </div>
              </>
            ) : null}
          </div>

          {/* Link Builder Popover */}
          {activePopover === "link" && (
            <div className="absolute left-0 top-full z-20 mt-2 w-full max-w-sm rounded-2xl border border-line-strong bg-surface p-4 shadow-lift">
              <p className="text-xs font-bold text-ink">Insert Link</p>
              {linkError ? (
                <p className="mt-1.5 text-[11px] font-medium text-danger">{linkError}</p>
              ) : null}
              <div className="mt-3 space-y-2.5">
                <div>
                  <label htmlFor={`${editorId}-link-text`} className="mb-1 block text-[11px] font-semibold text-body">
                    Link Text
                  </label>
                  <input
                    id={`${editorId}-link-text`}
                    type="text"
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    placeholder="e.g. Salesforce Flow documentation"
                    className={adminInputCompactClass}
                  />
                </div>
                <div>
                  <label htmlFor={`${editorId}-link-url`} className="mb-1 block text-[11px] font-semibold text-body">
                    URL or Path
                  </label>
                  <input
                    id={`${editorId}-link-url`}
                    type="text"
                    value={linkUrl}
                    onChange={(e) => {
                      setLinkUrl(e.target.value);
                      setLinkError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleInsertLink();
                      }
                    }}
                    placeholder="https://... or /portfolio/..."
                    className={adminInputCompactClass}
                  />
                </div>
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActivePopover(null)}
                  className={adminSecondaryBtnClass}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleInsertLink}
                  className={adminPrimaryBtnClass}
                >
                  Insert Link
                </button>
              </div>
            </div>
          )}

          {/* Table Builder Popover */}
          {activePopover === "table" && (
            <div className="absolute left-0 top-full z-20 mt-2 w-64 rounded-2xl border border-line-strong bg-surface p-4 shadow-lift">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-ink">Insert Table</p>
                <span className="text-[11px] font-semibold text-accent-strong">
                  {tableHover.cols} × {tableHover.rows}
                </span>
              </div>
              <p className="mt-0.5 text-[11px] text-muted">Click a grid size to insert</p>
              <div className="mt-3 grid grid-cols-5 gap-1.5">
                {Array.from({ length: 25 }, (_, idx) => {
                  const r = Math.floor(idx / 5) + 1;
                  const c = (idx % 5) + 1;
                  const highlighted = c <= tableHover.cols && r <= tableHover.rows;
                  return (
                    <button
                      key={`${r}-${c}`}
                      type="button"
                      onMouseEnter={() => setTableHover({ cols: c, rows: r })}
                      onFocus={() => setTableHover({ cols: c, rows: r })}
                      onClick={() => {
                        setActivePopover(null);
                        runBlockInsert(buildMarkdownTable(c, r));
                      }}
                      aria-label={`Insert ${c} columns by ${r} rows table`}
                      className={`h-6 cursor-pointer rounded border transition-colors ${
                        highlighted
                          ? "border-accent bg-accent-soft"
                          : "border-line bg-canvas hover:border-line-strong"
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Case Study Templates Popover */}
          {activePopover === "templates" && (
            <div className="absolute right-0 top-full z-20 mt-2 w-full max-w-sm rounded-2xl border border-line-strong bg-surface p-2 shadow-lift">
              <p className="px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted">
                Case Study Starters
              </p>
              <div className="space-y-1">
                {DOC_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => {
                      setActivePopover(null);
                      runBlockInsert(tpl.content);
                    }}
                    className={`w-full cursor-pointer rounded-xl px-3 py-2 text-left transition-colors hover:bg-tint ${adminFocusRing}`}
                  >
                    <span className="block text-xs font-semibold text-ink">{tpl.label}</span>
                    <span className="block text-[11px] text-muted">{tpl.description}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {uploadNotice ? (
        <div
          role="alert"
          className="flex items-center justify-between gap-2 rounded-xl border border-danger-line bg-danger-soft px-3 py-2 text-xs text-danger"
        >
          <span className="flex items-center gap-2">
            <Alert className="size-4 shrink-0" />
            {uploadNotice}
          </span>
          <button
            type="button"
            onClick={() => setUploadNotice(null)}
            aria-label="Dismiss upload error"
            className="cursor-pointer rounded p-1 hover:bg-danger/10"
          >
            <Close className="size-3.5" />
          </button>
        </div>
      ) : null}

      {/* Main Editor + Optional Live Outline + Optional Live Preview */}
      <div
        className={`grid gap-4 ${
          isFullscreen ? "min-h-0 flex-1 overflow-hidden" : ""
        } ${
          mode === "split"
            ? showOutline
              ? "lg:grid-cols-[200px_1fr_1fr]"
              : "lg:grid-cols-2"
            : showOutline && mode === "write"
              ? "lg:grid-cols-[210px_1fr]"
              : ""
        }`}
      >
        {/* Collapsible Live TOC Outline */}
        {isFull && showOutline && mode !== "preview" && (
          <aside
            aria-label="Live table of contents outline"
            className="rounded-xl border border-line bg-canvas p-3 text-xs overflow-y-auto max-h-[520px]"
          >
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted">
              Live TOC Preview
            </p>
            {outline.length === 0 ? (
              <p className="text-[11px] leading-relaxed text-muted">
                Add <code className="rounded bg-tint px-1">## Headings</code> to build the sticky Table of Contents.
              </p>
            ) : (
              <ol className="space-y-1">
                {outline.map((h, i) => (
                  <li key={`${h.line}-${i}`}>
                    <button
                      type="button"
                      onClick={() => jumpToOffset(h.offset)}
                      className={`w-full cursor-pointer truncate rounded-lg px-2 py-1 text-left transition-colors hover:bg-surface hover:text-accent-strong ${
                        h.level === 3 ? "pl-4 text-[11px] text-muted" : "font-medium text-ink"
                      }`}
                      title={`Jump to line ${h.line}: ${h.text}`}
                    >
                      {h.text}
                    </button>
                  </li>
                ))}
              </ol>
            )}
          </aside>
        )}

        {/* Write Pane */}
        {mode !== "preview" && (
          <div
            className={`relative ${isFullscreen ? "flex min-h-0 flex-col" : ""}`}
            onDragOver={(e) => {
              if (!isFull) return;
              if (e.dataTransfer.types.includes("Files")) {
                e.preventDefault();
                setIsDragOver(true);
              }
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              if (!isFull) return;
              setIsDragOver(false);
              const file = Array.from(e.dataTransfer.files).find((f) =>
                /^image\/(png|jpeg|webp)$/i.test(f.type)
              );
              if (file) {
                e.preventDefault();
                uploadAndInsertImage(file);
              }
            }}
          >
            <textarea
              ref={textareaRef}
              id={editorId}
              aria-label={ariaLabel}
              aria-describedby={ariaDescribedBy}
              rows={isFullscreen ? undefined : rows}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleTextareaKeyDown}
              onPaste={(e) => {
                if (!isFull) return;
                const file = Array.from(e.clipboardData.files).find((f) =>
                  /^image\/(png|jpeg|webp)$/i.test(f.type)
                );
                if (file) {
                  e.preventDefault();
                  uploadAndInsertImage(file);
                }
              }}
              placeholder={placeholder}
              className={`${adminTextareaClass} p-4 font-mono text-xs leading-relaxed ${
                isFullscreen ? "min-h-0 flex-1 resize-none" : ""
              } ${mode === "split" && !isFullscreen ? "h-[460px] resize-y" : ""} ${
                isDragOver ? "border-accent ring-2 ring-accent/25" : ""
              }`}
            />
            {uploadingDrop ? (
              <div className="pointer-events-none absolute inset-x-3 bottom-3 rounded-lg border border-accent-line bg-accent-soft px-3 py-1.5 text-xs font-semibold text-accent-strong shadow-sm">
                Uploading image and inserting Markdown...
              </div>
            ) : null}
          </div>
        )}

        {/* Live Formatted Preview Pane */}
        {(mode === "preview" || mode === "split") && (
          <div
            className={`overflow-y-auto rounded-xl border border-line bg-surface p-5 sm:p-6 ${
              isFullscreen
                ? "min-h-0 flex-1"
                : mode === "split"
                  ? "h-[460px]"
                  : isFull
                    ? "min-h-[320px] max-h-[600px]"
                    : "min-h-[140px] max-h-[360px]"
            }`}
          >
            {deferredPreviewMarkdown.trim() ? (
              <DocumentationRenderer
                markdown={deferredPreviewMarkdown}
                className={isFull ? "" : "prose-compact"}
              />
            ) : (
              <p className="text-sm text-muted">
                Nothing written yet. Switch to Write mode or insert a template to get started.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer Stats & Shortcut Hints */}
      {isFull && stats ? (
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted">
          <div className="flex flex-wrap items-center gap-3 font-medium">
            <span>{stats.words} words</span>
            <span aria-hidden>·</span>
            <span>{stats.readingMinutes} min read</span>
            <span aria-hidden>·</span>
            <span>{stats.headingsCount} TOC sections</span>
          </div>
          <p className="hidden sm:block">
            Shortcuts: <kbd className="rounded border border-line px-1">Ctrl+B</kbd> Bold ·{" "}
            <kbd className="rounded border border-line px-1">Ctrl+I</kbd> Italic ·{" "}
            <kbd className="rounded border border-line px-1">Ctrl+K</kbd> Link · Drop or paste images
          </p>
        </div>
      ) : null}

      {isFull ? (
        <MediaPickerModal
          open={mediaOpen}
          onClose={() => setMediaOpen(false)}
          onInsert={({ url, alt, caption }) => {
            const { start, end } = getSelection();
            const titlePart = caption ? ` "${caption.replace(/"/g, '\\"')}"` : "";
            applyEdit(insertBlockSnippet(value, start, end, `![${alt}](${url}${titlePart})`));
          }}
        />
      ) : null}
    </div>
  );
}
