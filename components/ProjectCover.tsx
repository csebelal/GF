"use client";

import { useEffect, useRef, useState } from "react";
import type { ProjectCardData } from "@/lib/projects";
import { buildThumbnailUrl } from "@/lib/youtube";
import { Play } from "./Icons";

interface ProjectCoverProps {
  cover: ProjectCardData["cover"];
  category: string;
  title: string;
  /** Show a play badge when the project has video. */
  hasVideo: boolean;
  priority?: boolean;
  className?: string;
}

/**
 * Card and hero cover: the project's own image, else the first video's
 * poster/thumbnail, else a designed placeholder. Falls back gracefully when a
 * remote thumbnail fails to load.
 */
export function ProjectCover({ cover, category, title, hasVideo, priority = false, className = "" }: ProjectCoverProps) {
  const sources: string[] = [];
  if (cover.kind === "image") sources.push(cover.src);
  if (cover.kind === "youtube") {
    if (cover.poster) sources.push(cover.poster);
    sources.push(buildThumbnailUrl(cover.id));
  }
  const [index, setIndex] = useState(0);
  const src = sources[index];
  const imgRef = useRef<HTMLImageElement>(null);

  // Catch loads/failures that happened before hydration attached the handlers.
  useEffect(() => {
    const img = imgRef.current;
    if (!img || !img.complete) return;
    // SVGs without intrinsic dimensions can report naturalWidth 0, so they are not treated as broken here.
    const broken = img.naturalWidth === 0 && !/\.svg($|\?)/i.test(img.src);
    if (broken || (img.src.includes("i.ytimg.com") && img.naturalWidth <= 120)) {
      setIndex((value) => value + 1);
    }
  }, [src]);
  const alt = cover.kind === "none" ? "" : cover.alt;

  return (
    <div className={`relative overflow-hidden bg-tint ${className}`}>
      {src ? (
        <img
          key={src}
          ref={imgRef}
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onError={() => setIndex((value) => value + 1)}
          onLoad={(event) => {
            if (src.includes("i.ytimg.com") && event.currentTarget.naturalWidth <= 120) setIndex((value) => value + 1);
          }}
          className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.025]"
        />
      ) : (
        <PlaceholderCover category={category} title={title} />
      )}
      {hasVideo ? (
        <span
          aria-hidden
          className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 py-1 pl-1.5 pr-2.5 text-xs font-semibold text-ink shadow-soft ring-1 ring-black/5"
        >
          <span className="flex size-5 items-center justify-center rounded-full bg-ink text-white">
            <Play className="ml-px text-[0.6rem]" />
          </span>
          Video
        </span>
      ) : null}
    </div>
  );
}

function PlaceholderCover({ category, title }: { category: string; title: string }) {
  return (
    <div aria-hidden className="absolute inset-0 flex flex-col justify-between bg-mist p-6">
      <div className="grid-lines absolute inset-0 opacity-80" />
      <span className="relative text-xs font-semibold uppercase tracking-[0.16em] text-accent">{category}</span>
      <span className="relative max-w-[80%] text-xl font-semibold leading-snug tracking-tight text-ink/80">{title}</span>
    </div>
  );
}
