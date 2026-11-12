"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { shouldUnoptimizeImage } from "@/lib/image-utils";
import { buildEmbedUrl, buildThumbnailUrl, buildWatchUrl, parseYouTubeUrl } from "@/lib/youtube";
import { Alert, ArrowUpRight, Caption, Play } from "./Icons";

interface YouTubeEmbedProps {
  /** Any common YouTube URL format. Parsed and validated before use. */
  url: string;
  /** Video title — used for the iframe title and the play button label. */
  title: string;
  /** Optional custom poster; falls back to YouTube's thumbnail, then a generated poster. */
  posterImage?: string;
  aspectRatio?: "16:9" | "9:16";
  showCaptions?: boolean;
  /** Load the poster eagerly (for the main video above the fold). */
  priority?: boolean;
  className?: string;
}

/**
 * Click-to-load, privacy-enhanced YouTube player. Nothing from YouTube's
 * player loads until the visitor presses play.
 */
export function YouTubeEmbed({
  url,
  title,
  posterImage,
  aspectRatio,
  showCaptions = false,
  priority = false,
  className = "",
}: YouTubeEmbedProps) {
  const parsed = useMemo(() => parseYouTubeUrl(url), [url]);
  const [playing, setPlaying] = useState(false);
  const [posterIndex, setPosterIndex] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const ratio = aspectRatio ?? "16:9";
  const isPortrait = ratio === "9:16";
  const frameClass = isPortrait ? "aspect-[9/16] w-full max-w-[22rem] mx-auto" : "aspect-video w-full";

  const posters = useMemo(() => {
    if (!parsed.ok) return [];
    return [posterImage, buildThumbnailUrl(parsed.id)].filter((src): src is string => Boolean(src));
  }, [parsed, posterImage]);
  const posterSrc = posters[posterIndex];

  const posterRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setPosterIndex(0);
    setPlaying(false);
  }, [url]);

  // Images can finish (or fail) before hydration attaches onLoad/onError, so re-check after mount.
  useEffect(() => {
    const img = posterRef.current;
    if (!img || !img.complete) return;
    // SVGs without intrinsic dimensions can report naturalWidth 0, so they are not treated as broken here.
    const broken = img.naturalWidth === 0 && !/\.svg($|\?)/i.test(img.src);
    if (broken || (img.src.includes("i.ytimg.com") && img.naturalWidth <= 120)) {
      setPosterIndex((index) => index + 1);
    }
  }, [posterSrc]);

  if (!parsed.ok) {
    let safeHref: string | undefined;
    try {
      const candidate = new URL(url);
      if (candidate.protocol === "https:") safeHref = candidate.toString();
    } catch {
      safeHref = undefined;
    }
    return (
      <div className={className}>
        <div
          role="group"
          aria-label={`Video unavailable: ${title}`}
          className={`${frameClass} flex flex-col items-center justify-center gap-3 rounded-[var(--radius-card)] border border-dashed border-amber-line bg-amber-soft p-6 text-center`}
        >
          <Alert className="text-3xl text-amber" />
          <p className="font-semibold text-ink">This video can’t be shown</p>
          <p className="max-w-sm text-sm leading-relaxed text-body">{parsed.reason}</p>
          {safeHref ? (
            <a href={safeHref} target="_blank" rel="noopener noreferrer" className="link-arrow text-sm">
              Open the original link <ArrowUpRight />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          ) : null}
        </div>
      </div>
    );
  }

  const embedSrc = buildEmbedUrl(parsed.id, { start: parsed.start, autoplay: true, showCaptions });
  const watchUrl = buildWatchUrl(parsed.id, parsed.start);

  const handleThumbLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    // YouTube serves a 120px grey placeholder for missing thumbnails.
    const img = event.currentTarget;
    if (posterSrc?.includes("i.ytimg.com") && img.naturalWidth > 0 && img.naturalWidth <= 120) {
      setPosterIndex((index) => index + 1);
    }
  };

  return (
    <div className={className}>
      <div
        className={`${frameClass} group relative overflow-hidden rounded-[var(--radius-card)] border border-line bg-ink shadow-lift`}
      >
        {playing ? (
          <iframe
            ref={iframeRef}
            src={embedSrc}
            title={`${title} (YouTube video player)`}
            className="absolute inset-0 size-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={() => iframeRef.current?.focus()}
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="absolute inset-0 size-full cursor-pointer text-left focus-visible:outline-offset-[-4px]"
            aria-label={`Play video: ${title}`}
          >
            {posterSrc ? (
              <Image
                key={posterSrc}
                ref={posterRef}
                src={posterSrc}
                alt=""
                fill
                sizes="(min-width: 1024px) 60vw, 100vw"
                priority={priority}
                unoptimized={shouldUnoptimizeImage(posterSrc)}
                onLoad={handleThumbLoad}
                onError={() => setPosterIndex((index) => index + 1)}
                className="object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.02]"
              />
            ) : (
              <GeneratedPoster title={title} portrait={isPortrait} />
            )}
            <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/20 via-transparent to-transparent transition-opacity duration-300 group-hover:opacity-80" />
            <span
              aria-hidden
              className="absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-ink shadow-lift ring-1 ring-black/5 transition-transform duration-300 motion-safe:group-hover:scale-105 sm:size-20"
            >
              <Play className="ml-1 text-2xl sm:text-[1.75rem]" />
            </span>
            <span
              aria-hidden
              className="absolute bottom-4 right-4 hidden rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white backdrop-blur sm:block"
            >
              Plays from YouTube
            </span>
          </button>
        )}
      </div>

      <div className={`mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm ${isPortrait ? "justify-center" : ""}`}>
        <a href={watchUrl} target="_blank" rel="noopener noreferrer" className="link-arrow">
          Watch on YouTube <ArrowUpRight />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
        {showCaptions ? (
          <span className="inline-flex items-center gap-1.5 text-muted">
            <Caption /> Captions on by default
          </span>
        ) : null}
        {!playing ? <span className="text-muted">Privacy-enhanced embed · no autoplay</span> : null}
      </div>
    </div>
  );
}

function GeneratedPoster({ title, portrait }: { title: string; portrait: boolean }) {
  return (
    <span className="absolute inset-0 flex flex-col justify-between bg-[linear-gradient(135deg,#0e5f5b_0%,#0a4744_55%,#191c20_100%)] p-6 text-white">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">Video walkthrough</span>
      <span className={`max-w-md font-semibold leading-tight tracking-tight ${portrait ? "text-2xl" : "text-2xl sm:text-3xl"}`}>
        {title}
      </span>
    </span>
  );
}
