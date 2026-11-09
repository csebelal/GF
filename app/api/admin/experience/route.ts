import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAuthenticatedAdmin } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connection";
import { ExperienceModel } from "@/lib/db/models/Experience";
import { invalidateRepositoryCache, getDbExperience } from "@/lib/db/repository";
import { sanitizeNoSql } from "@/lib/security/sanitize";
import { logSecurityEvent } from "@/lib/security/audit";

export async function GET() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const exp = await getDbExperience();
  return NextResponse.json(exp);
}

export async function PUT(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const data = sanitizeNoSql(rawData);
    await connectDB();

    const existing = await ExperienceModel.findOne({});
    let updated;

    if (existing) {
      updated = await ExperienceModel.findByIdAndUpdate(
        existing._id,
        { $set: data },
        {
          new: true,
          runValidators: true,
        }
      );
    } else {
      updated = await ExperienceModel.create(data);
    }

    invalidateRepositoryCache();
    try {
      revalidatePath("/", "layout");
      revalidatePath("/experience");
      revalidatePath("/about");
    } catch (e) {
      console.warn("Revalidation notice:", e);
    }

    logSecurityEvent("EXPERIENCE_UPDATED", {
      req: request,
      user: admin.email,
      status: "SUCCESS",
    });

    return NextResponse.json({ success: true, experience: updated });
  } catch (error: any) {
    console.error("Experience update error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while updating experience." },
      { status: 500 }
    );
  }
}
