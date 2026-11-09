import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";

/**
 * Development-only QA page for the video player's edge cases.
 * Returns 404 in production builds.
 */
export const metadata: Metadata = { title: "Embed states (dev)", robots: { index: false, follow: false } };

const cases = [
  { label: "Valid watch URL with custom poster", url: "https://www.youtube.com/watch?v=M7lc1UVf-VE", poster: "/images/samples/lead-routing-poster.svg" },
  { label: "Valid youtu.be URL, remote thumbnail", url: "https://youtu.be/M7lc1UVf-VE?t=30" },
  { label: "Broken custom poster → falls back to YouTube thumbnail", url: "https://www.youtube.com/embed/M7lc1UVf-VE", poster: "/images/does-not-exist.png" },
  { label: "Well-formed ID with no thumbnail → generated poster", url: "https://www.youtube.com/watch?v=aaaaaaaaaaa" },
  { label: "Vertical Shorts URL", url: "https://www.youtube.com/shorts/M7lc1UVf-VE", ratio: "9:16" as const },
  { label: "Invalid: not a URL", url: "paste-link-here" },
  { label: "Invalid: not a YouTube host", url: "https://vimeo.com/123456" },
  { label: "Invalid: bad video ID", url: "https://www.youtube.com/watch?v=short" },
];

export default function EmbedStatesPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <div className="container-page py-16">
      <h1 className="text-3xl font-semibold tracking-tight">YouTube embed states</h1>
      <p className="mt-2 text-body">Development-only page. Not available in production builds.</p>
      <ul className="mt-10 grid gap-12 md:grid-cols-2">
        {cases.map((item) => (
          <li key={item.label}>
            <h2 className="mb-3 text-sm font-semibold text-ink">{item.label}</h2>
            <YouTubeEmbed url={item.url} title={item.label} posterImage={item.poster} aspectRatio={item.ratio} />
          </li>
        ))}
      </ul>
    </div>
  );
}
