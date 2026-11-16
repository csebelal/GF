import { NextResponse } from "next/server";
import { getAuthenticatedAdminLean } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connection";
import { MediaAssetModel } from "@/lib/db/models/MediaAsset";
import path from "node:path";
import fs from "node:fs/promises";

export async function GET() {
  const admin = await getAuthenticatedAdminLean();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
    const fileNames = await fs.readdir(uploadsDir);

    // Filter out hidden files (.gitkeep, .DS_Store, etc.)
    const visibleFiles = fileNames.filter((name) => !name.startsWith("."));

    // Connect DB to fetch metadata
    await connectDB();
    const assets = await MediaAssetModel.find().lean();
    const assetMap = new Map<string, any>();
    const allTagsSet = new Set<string>();

    for (const asset of assets) {
      assetMap.set(asset.filename, asset);
      if (Array.isArray(asset.tags)) {
        for (const tag of asset.tags) {
          if (tag && typeof tag === "string") {
            allTagsSet.add(tag.trim().toLowerCase());
          }
        }
      }
    }

    const files = await Promise.all(
      visibleFiles.map(async (name) => {
        // Prevent path traversal
        const safeBase = path.basename(name);
        const filePath = path.join(uploadsDir, safeBase);
        const stat = await fs.stat(filePath);
        const meta = assetMap.get(safeBase);

        return {
          name: safeBase,
          url: `/uploads/${encodeURIComponent(safeBase)}`,
          size: stat.size,
          updatedAt: stat.mtime,
          isImage: /\.(webp|jpg|jpeg|png)$/i.test(safeBase),
          title: meta?.title || "",
          alt: meta?.alt || "",
          caption: meta?.caption || "",
          tags: Array.isArray(meta?.tags) ? meta.tags : [],
          uploadedBy: meta?.uploadedBy || "",
        };
      })
    );

    // Sort by latest modified
    files.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    const tags = Array.from(allTagsSet).sort();

    return NextResponse.json({ files, tags });
  } catch (error: any) {
    console.error("List media error:", error);
    return NextResponse.json({ error: "Failed to list media files" }, { status: 500 });
  }
}
