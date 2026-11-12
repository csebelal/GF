import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAuthenticatedAdminLean, requireAdminRole } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connection";
import { SiteProfileModel } from "@/lib/db/models/SiteProfile";
import { invalidateRepositoryCache, getDbProfile } from "@/lib/db/repository";
import { sanitizeNoSql } from "@/lib/security/sanitize";
import { logSecurityEvent } from "@/lib/security/audit";

const NO_STORE_HEADERS = { "Cache-Control": "private, no-store" };

export async function GET() {
  const admin = await getAuthenticatedAdminLean();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await getDbProfile();
  return NextResponse.json(profile, { headers: NO_STORE_HEADERS });
}

export async function PUT(request: Request) {
  try {
    const { admin, errorResponse } = await requireAdminRole(["admin", "editor"], request);
    if (errorResponse) return errorResponse;

    let rawData: any;
    try {
      rawData = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
    }

    if (!rawData || typeof rawData !== "object") {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    const data = sanitizeNoSql(rawData);
    await connectDB();

    const existing = await SiteProfileModel.findOne({}).select("_id").lean();
    let updated;

    if (existing) {
      updated = await SiteProfileModel.findByIdAndUpdate(
        existing._id,
        { $set: data },
        {
          new: true,
          runValidators: true,
        }
      ).lean();
    } else {
      updated = await SiteProfileModel.create(data);
    }

    invalidateRepositoryCache();
    try {
      revalidatePath("/", "layout");
      revalidatePath("/about");
      revalidatePath("/contact");
      revalidatePath("/sitemap.xml");
    } catch (e) {
      console.warn("Revalidation notice:", e);
    }

    logSecurityEvent("PROFILE_UPDATED", {
      req: request,
      user: admin.email,
      status: "SUCCESS",
    });

    return NextResponse.json({ success: true, profile: updated });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while updating profile." },
      { status: 500 }
    );
  }
}
