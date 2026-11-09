import { NextResponse } from "next/server";
import {
  getAuthenticatedAdmin,
  verifyPassword,
  hashPassword,
  createSessionToken,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/session";
import { validatePasswordStrength } from "@/lib/security/password";
import { RateLimiters } from "@/lib/security/rate-limit";
import { extractClientIp, logSecurityEvent } from "@/lib/security/audit";

export async function PUT(request: Request) {
  const ip = extractClientIp(request.headers);

  // Rate Limiting Protection on password changes
  const rateLimitResult = RateLimiters.passwordChange(ip, request);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many password change attempts. Please try again later." },
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

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
    }

    const currentPassword = typeof body?.currentPassword === "string" ? body.currentPassword : "";
    const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required." },
        { status: 400 }
      );
    }

    // Verify current password
    const isMatch = await verifyPassword(currentPassword, admin.passwordHash);
    if (!isMatch) {
      logSecurityEvent("AUTH_PASSWORD_CHANGE_FAILED", {
        req: request,
        user: admin.email,
        status: "FAILURE",
        details: { reason: "Incorrect current password" },
      });
      return NextResponse.json({ error: "Incorrect current password." }, { status: 400 });
    }

    // Check if new password is same as current password
    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: "New password must be different from your current password." },
        { status: 400 }
      );
    }

    // Enforce strong password complexity policy
    const policyResult = validatePasswordStrength(newPassword);
    if (!policyResult.valid) {
      return NextResponse.json(
        { error: policyResult.errors[0] || "Password does not meet complexity requirements." },
        { status: 400 }
      );
    }

    // Hash password with 12 bcrypt rounds
    admin.passwordHash = await hashPassword(newPassword);

    // Invalidate all existing tokens on other devices by incrementing tokenVersion
    admin.tokenVersion = (admin.tokenVersion || 0) + 1;
    await admin.save();

    logSecurityEvent("AUTH_PASSWORD_CHANGED", {
      req: request,
      user: admin.email,
      status: "SUCCESS",
    });

    // Re-issue a fresh token for the current active session
    const newToken = await createSessionToken({
      email: admin.email,
      name: admin.name,
      role: "admin",
      tokenVersion: admin.tokenVersion,
    });

    const response = NextResponse.json({
      success: true,
      message: "Password updated successfully. Other active sessions have been invalidated.",
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: newToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err: any) {
    console.error("Change password error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred while changing password." },
      { status: 500 }
    );
  }
}
