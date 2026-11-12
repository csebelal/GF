import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { isValidAdminRole } from "@/lib/auth/roles";
import { hashPassword, requireAdminRole } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connection";
import { AdminModel } from "@/lib/db/models/Admin";
import { logSecurityEvent } from "@/lib/security/audit";
import { validatePasswordStrength } from "@/lib/security/password";

type RouteProps = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteProps) {
  const { admin, errorResponse } = await requireAdminRole(["admin"], request);
  if (errorResponse) return errorResponse;

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid user ID." }, { status: 400 });
  }

  try {
    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
    }

    await connectDB();
    const target = await AdminModel.findById(id);
    if (!target) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    let revokeSessions = false;

    if (body.name !== undefined) {
      const name = typeof body.name === "string" ? body.name.trim() : "";
      if (name.length < 2 || name.length > 80) {
        return NextResponse.json(
          { error: "Name must be between 2 and 80 characters." },
          { status: 400 }
        );
      }
      target.name = name;
    }

    if (body.role !== undefined) {
      if (!isValidAdminRole(body.role)) {
        return NextResponse.json(
          { error: "Invalid role. Allowed roles: admin, editor, viewer." },
          { status: 400 }
        );
      }

      if (target.role === "admin" && body.role !== "admin") {
        if (String(target._id) === String(admin._id)) {
          return NextResponse.json(
            { error: "You cannot demote your own active admin account." },
            { status: 400 }
          );
        }
        const adminCount = await AdminModel.countDocuments({ role: "admin" });
        if (adminCount <= 1) {
          return NextResponse.json(
            { error: "Cannot demote the last remaining admin user." },
            { status: 400 }
          );
        }
      }

      if (target.role !== body.role) {
        target.role = body.role;
        revokeSessions = true;
      }
    }

    if (typeof body.newPassword === "string" && body.newPassword.length > 0) {
      const strength = validatePasswordStrength(body.newPassword);
      if (!strength.valid) {
        return NextResponse.json(
          { error: strength.errors[0] || "Password does not meet complexity requirements." },
          { status: 400 }
        );
      }
      target.passwordHash = await hashPassword(body.newPassword);
      revokeSessions = true;
    }

    if (revokeSessions) {
      target.tokenVersion = (target.tokenVersion || 0) + 1;
    }

    await target.save();

    logSecurityEvent("ADMIN_USER_UPDATED", {
      req: request,
      user: admin.email,
      status: "SUCCESS",
      details: {
        targetEmail: target.email,
        role: target.role,
        sessionsRevoked: revokeSessions,
      },
    });

    return NextResponse.json({
      user: {
        _id: String(target._id),
        email: target.email,
        name: target.name,
        role: target.role,
        lastLogin: target.lastLogin ?? null,
        createdAt: target.createdAt,
      },
    });
  } catch (error) {
    console.error("Update admin user error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteProps) {
  const { admin, errorResponse } = await requireAdminRole(["admin"], request);
  if (errorResponse) return errorResponse;

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid user ID." }, { status: 400 });
  }

  try {
    await connectDB();
    const target = await AdminModel.findById(id);
    if (!target) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (String(target._id) === String(admin._id)) {
      return NextResponse.json(
        { error: "You cannot delete your own active account." },
        { status: 400 }
      );
    }

    if (target.role === "admin") {
      const adminCount = await AdminModel.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot delete the last remaining admin user." },
          { status: 400 }
        );
      }
    }

    await AdminModel.deleteOne({ _id: target._id });

    logSecurityEvent("ADMIN_USER_DELETED", {
      req: request,
      user: admin.email,
      status: "SUCCESS",
      details: { targetEmail: target.email, role: target.role },
    });

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Delete admin user error:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
