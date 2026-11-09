import fs from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { profile } from "@/content/site";

export const ogSize = { width: 1200, height: 630 };

/** Shared social card layout used by the site and project routes. */
export async function renderOgImage({ eyebrow, title, footnote }: { eyebrow: string; title: string; footnote?: string }) {
  const portrait = await fs.readFile(path.join(process.cwd(), "public", "images", "profile", "afrin-chishti-portrait.jpg"));
  const portraitSrc = `data:image/jpeg;base64,${portrait.toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#faf8f4", padding: 64, fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, paddingRight: 48 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 22, color: "#646b73", letterSpacing: 3, textTransform: "uppercase" }}>
            <div style={{ width: 36, height: 2, background: "#0e5f5b" }} />
            {eyebrow}
          </div>
          <div style={{ display: "flex", fontSize: title.length > 60 ? 54 : 64, fontWeight: 700, color: "#191c20", lineHeight: 1.08, letterSpacing: -2 }}>
            {title}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", fontSize: 28, fontWeight: 700, color: "#191c20" }}>{profile.name}</div>
            <div style={{ display: "flex", fontSize: 22, color: "#4c535b" }}>
              {footnote ?? `${profile.jobTitle} · ${profile.location.city}, ${profile.location.country}`}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", width: 360, height: 502, borderRadius: 28, overflow: "hidden", border: "8px solid #ffffff", boxShadow: "0 20px 40px rgba(0,0,0,0.12)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={portraitSrc} width={360} height={502} style={{ objectFit: "cover", objectPosition: "top" }} alt="" />
        </div>
      </div>
    ),
    ogSize,
  );
}
