import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getAuthenticatedAdmin,
  getAuthenticatedAdminLean,
  createSessionToken,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connection";
import { AdminModel } from "@/lib/db/models/Admin";
import { SiteProfileModel } from "@/lib/db/models/SiteProfile";
import { getDbProfile, invalidateRepositoryCache } from "@/lib/db/repository";
import { isValidGoogleAnalyticsId } from "@/lib/analytics/validators";
import { logSecurityEvent } from "@/lib/security/audit";

export async function GET() {
  const admin = await getAuthenticatedAdminLean();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await getDbProfile();

  return NextResponse.json(
    {
      admin: {
        email: admin.email,
        name: admin.name,
        role: admin.role,
        lastLogin: admin.lastLogin,
      },
      googleAnalyticsId: profile.siteMeta?.googleAnalyticsId || "",
    },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}

export async function PUT(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
    }

    // 1. Handle Google Analytics Update
    if (body?.googleAnalyticsId !== undefined) {
      const rawGaId = typeof body.googleAnalyticsId === "string" ? body.googleAnalyticsId.trim() : "";
      const cleanGaId = rawGaId.toUpperCase();

      if (cleanGaId !== "" && !isValidGoogleAnalyticsId(cleanGaId)) {
        return NextResponse.json(
          {
            error:
              "Invalid format. Enter a valid Google Analytics 4 ID (e.g. G-K7MDDXHF72) or Google Tag Manager ID (e.g. GTM-WFSN9MSW).",
          },
          { status: 400 }
        );
      }

      await connectDB();
      await SiteProfileModel.updateOne(
        {},
        { $set: { "siteMeta.googleAnalyticsId": cleanGaId } }
      );

      invalidateRepositoryCache();
      try {
        revalidatePath("/", "layout");
      } catch (e) {
        console.warn("Revalidation warning:", e);
      }

      logSecurityEvent("PROFILE_UPDATED", {
        req: request,
        user: admin.email,
        status: "SUCCESS",
        details: { googleAnalyticsId: cleanGaId },
      });

      // If only updating Google Analytics, respond immediately
      if (!body?.email && !body?.name) {
        return NextResponse.json({
          success: true,
          googleAnalyticsId: cleanGaId,
          message: cleanGaId
            ? "Google Analytics Measurement ID saved and activated."
            : "Google Analytics tracking disabled.",
        });
      }
    }

    // 2. Handle Admin Account Update
    const email = typeof body?.email === "string" ? body.email.toLowerCase().trim() : "";
    const name = typeof body?.name === "string" ? body.name.trim().slice(0, 100) : "";

    if (!email || !name) {
      return NextResponse.json({ error: "Email and name are required." }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    await connectDB();

    // Check if new email is already taken by another admin account
    if (email !== admin.email.toLowerCase()) {
      const emailTaken = await AdminModel.findOne({ email });
      if (emailTaken && emailTaken._id.toString() !== (admin as any)._id.toString()) {
        return NextResponse.json({ error: "Email is already in use." }, { status: 400 });
      }
    }

    admin.name = name;
    admin.email = email;
    await admin.save();

    logSecurityEvent("AUTH_PROFILE_UPDATED", {
      req: request,
      user: admin.email,
      status: "SUCCESS",
      details: { email, name },
    });

    // Re-issue session token with updated credentials
    const token = await createSessionToken({
      email: admin.email,
      name: admin.name,
      role: "admin",
      tokenVersion: admin.tokenVersion || 0,
    });

    const response = NextResponse.json({
      success: true,
      admin: { email: admin.email, name: admin.name, role: admin.role },
      message: "Account details updated successfully.",
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err: any) {
    console.error("Update admin settings error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred while updating settings." },
      { status: 500 }
    );
  }
}
