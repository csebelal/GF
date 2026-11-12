import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAuthenticatedAdminLean, requireAdminRole } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connection";
import { ProjectModel } from "@/lib/db/models/Project";
import { invalidateRepositoryCache } from "@/lib/db/repository";
import { filterProjectPayload } from "@/lib/security/sanitize";
import { logSecurityEvent } from "@/lib/security/audit";
import mongoose from "mongoose";

type RouteProps = { params: Promise<{ id: string }> };

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const NO_STORE_HEADERS = { "Cache-Control": "private, no-store" };

function validateIdParam(id: string): { valid: boolean; isObjectId: boolean; cleanedId: string } {
  if (typeof id !== "string") return { valid: false, isObjectId: false, cleanedId: "" };
  const trimmed = id.trim();
  if (mongoose.isValidObjectId(trimmed)) {
    return { valid: true, isObjectId: true, cleanedId: trimmed };
  }
  if (SLUG_PATTERN.test(trimmed)) {
    return { valid: true, isObjectId: false, cleanedId: trimmed };
  }
  return { valid: false, isObjectId: false, cleanedId: "" };
}

export async function GET(request: Request, { params }: RouteProps) {
  const admin = await getAuthenticatedAdminLean();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const parsed = validateIdParam(id);
  if (!parsed.valid) {
    return NextResponse.json({ error: "Invalid project identifier" }, { status: 400 });
  }

  await connectDB();

  let project;
  if (parsed.isObjectId) {
    project = await ProjectModel.findById(parsed.cleanedId).lean();
  } else {
    project = await ProjectModel.findOne({ slug: parsed.cleanedId }).lean();
  }

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json(project, { headers: NO_STORE_HEADERS });
}

export async function PUT(request: Request, { params }: RouteProps) {
  try {
    const { admin, errorResponse } = await requireAdminRole(["admin", "editor"], request);
    if (errorResponse) return errorResponse;

    const { id } = await params;
    const parsed = validateIdParam(id);
    if (!parsed.valid) {
      return NextResponse.json({ error: "Invalid project identifier" }, { status: 400 });
    }

    let rawData: any;
    try {
      rawData = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
    }

    if (!rawData || typeof rawData !== "object") {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    const data = filterProjectPayload(rawData);
    await connectDB();

    // Locate existing document (minimal projection)
    const existing = parsed.isObjectId
      ? await ProjectModel.findById(parsed.cleanedId).select("_id slug").lean()
      : await ProjectModel.findOne({ slug: parsed.cleanedId }).select("_id slug").lean();

    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check slug uniqueness if slug changed
    if (data.slug && typeof data.slug === "string") {
      const cleanSlug = data.slug.toLowerCase().trim();
      if (!SLUG_PATTERN.test(cleanSlug)) {
        return NextResponse.json(
          { error: `Slug "${cleanSlug}" is invalid. Use lowercase letters, numbers, and hyphens.` },
          { status: 400 }
        );
      }

      if (cleanSlug !== existing.slug) {
        const existingWithSlug = await ProjectModel.findOne({
          slug: cleanSlug,
          _id: { $ne: existing._id },
        })
          .select("_id")
          .lean();
        if (existingWithSlug) {
          return NextResponse.json({ error: `Slug "${cleanSlug}" is already taken.` }, { status: 400 });
        }
        data.slug = cleanSlug;
      }
    }

    // Perform safe update using explicit $set
    const updated = await ProjectModel.findByIdAndUpdate(
      existing._id,
      { $set: data },
      {
        new: true,
        runValidators: true,
      }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    invalidateRepositoryCache();
    try {
      revalidatePath("/", "layout");
      revalidatePath("/portfolio");
      revalidatePath(`/portfolio/${updated.slug}`);
      revalidatePath("/sitemap.xml");
    } catch (e) {
      console.warn("Revalidation notice:", e);
    }

    logSecurityEvent("PROJECT_UPDATED", {
      req: request,
      user: admin.email,
      status: "SUCCESS",
      details: { id: existing._id.toString(), slug: updated.slug },
    });

    return NextResponse.json({ success: true, project: updated });
  } catch (error: any) {
    console.error("Update project error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while updating the project." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteProps) {
  try {
    const { admin, errorResponse } = await requireAdminRole(["admin", "editor"], request);
    if (errorResponse) return errorResponse;

    const { id } = await params;
    const parsed = validateIdParam(id);
    if (!parsed.valid) {
      return NextResponse.json({ error: "Invalid project identifier" }, { status: 400 });
    }

    await connectDB();

    const deleted = parsed.isObjectId
      ? await ProjectModel.findByIdAndDelete(parsed.cleanedId).select("_id slug").lean()
      : await ProjectModel.findOneAndDelete({ slug: parsed.cleanedId }).select("_id slug").lean();

    if (!deleted) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    invalidateRepositoryCache();
    try {
      revalidatePath("/", "layout");
      revalidatePath("/portfolio");
      revalidatePath("/sitemap.xml");
    } catch (e) {
      console.warn("Revalidation notice:", e);
    }

    logSecurityEvent("PROJECT_DELETED", {
      req: request,
      user: admin.email,
      status: "SUCCESS",
      details: { id: deleted._id.toString(), slug: deleted.slug },
    });

    return NextResponse.json({ success: true, message: "Project deleted" });
  } catch (error: any) {
    console.error("Delete project error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while deleting the project." },
      { status: 500 }
    );
  }
}
