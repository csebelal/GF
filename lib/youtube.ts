/**
 * Safe YouTube URL parsing.
 *
 * Authors paste an ordinary YouTube link. We validate the hostname and the
 * 11-character video ID, then build the privacy-enhanced embed URL ourselves,
 * so arbitrary iframe URLs can never reach the page.
 */

const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

const WATCH_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

const SHORT_HOSTS = new Set(["youtu.be", "www.youtu.be"]);

/** Path prefixes on youtube.com that are followed by a video ID. */
const ID_PATH_PREFIXES = ["embed", "shorts", "live", "v", "e"];

export type YouTubeParseResult =
  | {
      ok: true;
      id: string;
      /** Start time in seconds, when the link included one. */
      start?: number;
      /** True when the link was a /shorts/ URL (usually vertical). */
      isShort: boolean;
    }
  | { ok: false; reason: string };

export function isValidYouTubeId(id: string): boolean {
  return VIDEO_ID_PATTERN.test(id);
}

/** Parses "90", "90s", "1m30s", "1h2m3s" into seconds. */
export function parseTimestamp(value: string | null | undefined): number | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (/^\d+$/.test(trimmed)) return Number(trimmed);
  const match = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(trimmed);
  if (!match || trimmed === "") return undefined;
  const [, h, m, s] = match;
  if (!h && !m && !s) return undefined;
  return Number(h ?? 0) * 3600 + Number(m ?? 0) * 60 + Number(s ?? 0);
}

export function parseYouTubeUrl(input: unknown): YouTubeParseResult {
  if (typeof input !== "string" || input.trim() === "") {
    return { ok: false, reason: "No YouTube link was provided." };
  }

  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return { ok: false, reason: "The link is not a valid URL." };
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return { ok: false, reason: "YouTube links must start with https://." };
  }

  const host = url.hostname.toLowerCase();
  const segments = url.pathname.split("/").filter(Boolean);
  let id: string | undefined;
  let isShort = false;

  if (SHORT_HOSTS.has(host)) {
    id = segments[0];
  } else if (WATCH_HOSTS.has(host)) {
    if (segments[0] === "watch") {
      id = url.searchParams.get("v") ?? undefined;
    } else if (segments.length >= 2 && ID_PATH_PREFIXES.includes(segments[0])) {
      id = segments[1];
      isShort = segments[0] === "shorts";
    }
  } else {
    return { ok: false, reason: `"${host}" is not a YouTube address.` };
  }

  if (!id) {
    return { ok: false, reason: "The link does not point to a single YouTube video." };
  }
  if (!isValidYouTubeId(id)) {
    return { ok: false, reason: "The video ID in this link is not valid." };
  }

  const start =
    parseTimestamp(url.searchParams.get("t")) ?? parseTimestamp(url.searchParams.get("start"));

  return { ok: true, id, start, isShort };
}

export interface EmbedOptions {
  start?: number;
  autoplay?: boolean;
  showCaptions?: boolean;
}

/** Builds a privacy-enhanced (youtube-nocookie.com) embed URL from a validated ID. */
export function buildEmbedUrl(id: string, options: EmbedOptions = {}): string {
  if (!isValidYouTubeId(id)) throw new Error(`Invalid YouTube video ID: ${id}`);
  const params = new URLSearchParams({ rel: "0", playsinline: "1" });
  if (options.autoplay) params.set("autoplay", "1");
  if (options.start && options.start > 0) params.set("start", String(Math.floor(options.start)));
  if (options.showCaptions) params.set("cc_load_policy", "1");
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}

export function buildWatchUrl(id: string, start?: number): string {
  const params = new URLSearchParams({ v: id });
  if (start && start > 0) params.set("t", `${Math.floor(start)}s`);
  return `https://www.youtube.com/watch?${params.toString()}`;
}

export function buildThumbnailUrl(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}
