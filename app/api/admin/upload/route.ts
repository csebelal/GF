import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth/session";
import { validateUploadedFile } from "@/lib/security/file-validation";
import { RateLimiters } from "@/lib/security/rate-limit";
import { extractClientIp, logSecurityEvent } from "@/lib/security/audit";
import path from "node:path";
import fs from "node:fs/promises";

export async function POST(request: Request) {
  const ip = extractClientIp(request.headers);

  // Rate Limiting Protection on uploads (20 uploads per 10 mins)
  const rateLimitResult = RateLimiters.fileUpload(ip, request);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Upload rate limit reached. Please wait before uploading more files." },
      {
        status: 429,
        headers: {
          "Retry-After": (rateLimitResult.retryAfterSeconds || 60).toString(),
        },
      }
    );
  }

  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Strict validation: MIME, extension, magic-byte inspection, file size
    const validation = validateUploadedFile(file, buffer);
    if (!validation.valid || !validation.sanitizedFilename) {
      logSecurityEvent("FILE_UPLOAD_BLOCKED", {
        req: request,
        user: admin.email,
        status: "BLOCKED",
        details: { filename: file.name, type: file.type, reason: validation.error },
      });
      return NextResponse.json({ error: validation.error || "File upload rejected." }, { status: 400 });
    }

    const filename = validation.sanitizedFilename;
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const filePath = path.join(uploadsDir, filename);
    await fs.writeFile(filePath, buffer);

    logSecurityEvent("FILE_UPLOAD_SUCCESS", {
      req: request,
      user: admin.email,
      status: "SUCCESS",
      details: { filename, size: buffer.length, mime: validation.matchedType?.mime },
    });

    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      size: buffer.length,
      type: validation.matchedType?.mime || file.type,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during file upload." },
      { status: 500 }
    );
  }
}
