import { NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connection";
import { MediaAssetModel } from "@/lib/db/models/MediaAsset";
import { logSecurityEvent } from "@/lib/security/audit";
import path from "node:path";
import fs from "node:fs/promises";

type RouteProps = { params: Promise<{ filename: string }> };

function sanitizeFilename(raw: string): string {
  if (typeof raw !== "string") return "";
  // Decode in case it's percent-encoded
  const decoded = decodeURIComponent(raw);
  const base = path.basename(decoded);
  if (base.includes("\0") || base.includes("..") || base.startsWith(".")) {
    return "";
  }
  return base;
}

export async function PATCH(request: Request, { params }: RouteProps) {
  try {
    const { admin, errorResponse } = await requireAdminRole(["admin", "editor"], request);
    if (errorResponse) return errorResponse;

    const { filename: rawFilename } = await params;
    const filename = sanitizeFilename(rawFilename);

    if (!filename) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    const uploadsDir = path.resolve(process.cwd(), "public", "uploads");
    const filePath = path.resolve(uploadsDir, filename);

    if (!filePath.startsWith(uploadsDir)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    try {
      await fs.stat(filePath);
    } catch {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const title = typeof body.title === "string" ? body.title.trim().slice(0, 200) : "";
    const alt = typeof body.alt === "string" ? body.alt.trim().slice(0, 300) : "";
    const caption = typeof body.caption === "string" ? body.caption.trim().slice(0, 1000) : "";

    let tags: string[] = [];
    if (Array.isArray(body.tags)) {
      tags = body.tags
        .filter((t: unknown) => typeof t === "string" && t.trim().length > 0)
        .map((t: string) => t.trim().toLowerCase().slice(0, 50));
    } else if (typeof body.tags === "string") {
      tags = body.tags
        .split(",")
        .map((t: string) => t.trim().toLowerCase())
        .filter((t: string) => t.length > 0 && t.length <= 50);
    }
    // Deduplicate tags
    tags = Array.from(new Set(tags));

    await connectDB();
    const updated = await MediaAssetModel.findOneAndUpdate(
      { filename },
      {
        filename,
        title,
        alt,
        caption,
        tags,
        uploadedBy: admin.email,
      },
      { upsert: true, new: true }
    ).lean();

    logSecurityEvent("MEDIA_METADATA_UPDATED", {
      req: request,
      user: admin.email,
      status: "SUCCESS",
      details: { filename, title, tagsCount: tags.length },
    });

    return NextResponse.json({ success: true, asset: updated });
  } catch (error: any) {
    console.error("Update media metadata error:", error);
    return NextResponse.json(
      { error: "Failed to update media metadata" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteProps) {
  try {
    const { admin, errorResponse } = await requireAdminRole(["admin", "editor"], request);
    if (errorResponse) return errorResponse;

    const { filename: rawFilename } = await params;
    const filename = sanitizeFilename(rawFilename);

    if (!filename) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    const uploadsDir = path.resolve(process.cwd(), "public", "uploads");
    const filePath = path.resolve(uploadsDir, filename);

    if (!filePath.startsWith(uploadsDir)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    try {
      await fs.stat(filePath);
    } catch {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // 1. Delete physical file
    await fs.unlink(filePath);

    // 2. Delete metadata from MongoDB
    await connectDB();
    await MediaAssetModel.deleteOne({ filename });

    logSecurityEvent("MEDIA_DELETED", {
      req: request,
      user: admin.email,
      status: "SUCCESS",
      details: { filename },
    });

    return NextResponse.json({ success: true, filename });
  } catch (error: any) {
    console.error("Delete media error:", error);
    return NextResponse.json(
      { error: "Failed to delete media file" },
      { status: 500 }
    );
  }
}
