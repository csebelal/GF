import { NextResponse } from "next/server";
import { isValidAdminRole } from "@/lib/auth/roles";
import { hashPassword, requireAdminRole } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connection";
import { AdminModel } from "@/lib/db/models/Admin";
import { logSecurityEvent } from "@/lib/security/audit";
import { validatePasswordStrength } from "@/lib/security/password";

const NO_STORE_HEADERS = { "Cache-Control": "private, no-store" };
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(request: Request) {
  const { errorResponse } = await requireAdminRole(["admin"], request);
  if (errorResponse) return errorResponse;

  try {
    await connectDB();
    const users = await AdminModel.find({})
      .select("email name role lastLogin createdAt updatedAt")
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json(
      {
        users: users.map((u) => ({
          _id: String(u._id),
          email: u.email,
          name: u.name,
          role: u.role || "admin",
          lastLogin: u.lastLogin ?? null,
          createdAt: u.createdAt,
        })),
      },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    console.error("List admin users error:", error);
    return NextResponse.json({ error: "Failed to list admin users" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { admin, errorResponse } = await requireAdminRole(["admin"], request);
  if (errorResponse) return errorResponse;

  try {
    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
    }

    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const email = typeof body?.email === "string" ? body.email.toLowerCase().trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const role = body?.role ?? "editor";

    if (name.length < 2 || name.length > 80) {
      return NextResponse.json(
        { error: "Name must be between 2 and 80 characters." },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email) || email.length > 254) {
      return NextResponse.json({ error: "Valid email address is required." }, { status: 400 });
    }

    if (!isValidAdminRole(role)) {
      return NextResponse.json(
        { error: "Invalid role. Allowed roles: admin, editor, viewer." },
        { status: 400 }
      );
    }

    const strength = validatePasswordStrength(password);
    if (!strength.valid) {
      return NextResponse.json(
        { error: strength.errors[0] || "Password does not meet complexity requirements." },
        { status: 400 }
      );
    }

    await connectDB();
    const existing = await AdminModel.findOne({ email }).select("_id").lean();
    if (existing) {
      return NextResponse.json(
        { error: "A user with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const created = await AdminModel.create({
      name,
      email,
      role,
      passwordHash,
      tokenVersion: 0,
    });

    logSecurityEvent("ADMIN_USER_CREATED", {
      req: request,
      user: admin.email,
      status: "SUCCESS",
      details: { targetEmail: created.email, role: created.role },
    });

    return NextResponse.json(
      {
        user: {
          _id: String(created._id),
          email: created.email,
          name: created.name,
          role: created.role,
          lastLogin: null,
          createdAt: created.createdAt,
        },
      },
      { status: 201, headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    console.error("Create admin user error:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
