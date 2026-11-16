import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";

const MIME_MAP: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".csv": "text/csv",
  ".txt": "text/plain",
};

interface RouteContext {
  params: Promise<{
    filename: string[];
  }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { filename } = await context.params;

    if (!filename || filename.length === 0) {
      return NextResponse.json({ error: "File not specified" }, { status: 400 });
    }

    // Join parts and sanitize: strictly prevent path traversal
    const joinedName = filename.join("/");
    const normalized = path.normalize(joinedName).replace(/^(\.\.(\/|\\|$))+/, "");

    // Must not contain null bytes or directory traversal markers
    if (normalized.includes("\0") || normalized.includes("..")) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    const uploadsDir = path.resolve(process.cwd(), "public", "uploads");
    const filePath = path.resolve(uploadsDir, normalized);

    // Verify target path remains strictly within public/uploads
    if (!filePath.startsWith(uploadsDir)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    let stat;
    try {
      stat = await fs.stat(filePath);
    } catch {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    if (!stat.isFile()) {
      return NextResponse.json({ error: "Not a file" }, { status: 404 });
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_MAP[ext] || "application/octet-stream";
    const fileBuffer = await fs.readFile(filePath);
    const baseName = path.basename(filePath);

    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set("Content-Length", stat.size.toString());
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
    headers.set("X-Content-Type-Options", "nosniff");

    if (contentType === "application/pdf") {
      headers.set("Content-Disposition", `inline; filename="${baseName}"`);
    }

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error serving uploaded asset:", error);
    return NextResponse.json({ error: "Failed to read file" }, { status: 500 });
  }
}
