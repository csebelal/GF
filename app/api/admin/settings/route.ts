import { NextResponse } from "next/server";
import {
  getAuthenticatedAdmin,
  createSessionToken,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connection";
import { AdminModel } from "@/lib/db/models/Admin";
import { logSecurityEvent } from "@/lib/security/audit";

export async function GET() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    admin: {
      email: admin.email,
      name: admin.name,
      role: admin.role,
      lastLogin: admin.lastLogin,
    },
  });
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
    console.error("Update admin profile error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred while updating settings." },
      { status: 500 }
    );
  }
}
