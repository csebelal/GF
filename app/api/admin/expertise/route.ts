import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAuthenticatedAdminLean } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connection";
import { ExpertiseModel } from "@/lib/db/models/Expertise";
import { invalidateRepositoryCache, getDbExpertise } from "@/lib/db/repository";
import { sanitizeNoSql } from "@/lib/security/sanitize";
import { logSecurityEvent } from "@/lib/security/audit";

const NO_STORE_HEADERS = { "Cache-Control": "private, no-store" };

export async function GET() {
  const admin = await getAuthenticatedAdminLean();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const expertise = await getDbExpertise();
  return NextResponse.json(expertise, { headers: NO_STORE_HEADERS });
}

export async function PUT(request: Request) {
  try {
    const admin = await getAuthenticatedAdminLean();
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

    const existing = await ExpertiseModel.findOne({}).select("_id").lean();
    let updated;

    if (existing) {
      updated = await ExpertiseModel.findByIdAndUpdate(
        existing._id,
        { $set: data },
        {
          new: true,
          runValidators: true,
        }
      ).lean();
    } else {
      updated = await ExpertiseModel.create(data);
    }

    invalidateRepositoryCache();
    try {
      revalidatePath("/", "layout");
      revalidatePath("/expertise");
    } catch (e) {
      console.warn("Revalidation notice:", e);
    }

    logSecurityEvent("EXPERTISE_UPDATED", {
      req: request,
      user: admin.email,
      status: "SUCCESS",
    });

    return NextResponse.json({ success: true, expertise: updated });
  } catch (error: any) {
    console.error("Expertise update error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while updating expertise." },
      { status: 500 }
    );
  }
}
