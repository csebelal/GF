import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth/session";
import path from "node:path";
import fs from "node:fs/promises";

export async function GET() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
    const fileNames = await fs.readdir(uploadsDir);

    // Filter out hidden files (.gitkeep, .DS_Store, etc.)
    const visibleFiles = fileNames.filter((name) => !name.startsWith("."));

    const files = await Promise.all(
      visibleFiles.map(async (name) => {
        // Prevent path traversal
        const safeBase = path.basename(name);
        const filePath = path.join(uploadsDir, safeBase);
        const stat = await fs.stat(filePath);
        return {
          name: safeBase,
          url: `/uploads/${encodeURIComponent(safeBase)}`,
          size: stat.size,
          updatedAt: stat.mtime,
          isImage: /\.(webp|jpg|jpeg|png)$/i.test(safeBase),
        };
      })
    );

    // Sort by latest modified
    files.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return NextResponse.json({ files });
  } catch (error: any) {
    console.error("List media error:", error);
    return NextResponse.json({ error: "Failed to list media files" }, { status: 500 });
  }
}
