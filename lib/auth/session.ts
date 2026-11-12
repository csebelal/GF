import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "node:crypto";
import type { HydratedDocument } from "mongoose";
import { getAuthSecret } from "@/lib/security/config";
import { hashPassword, verifyPassword } from "@/lib/security/password";
import { logSecurityEvent } from "@/lib/security/audit";
import { connectDB } from "@/lib/db/connection";
import { AdminModel, type IAdmin } from "@/lib/db/models/Admin";
import { hasRequiredRole, isValidAdminRole, type AdminRole } from "./roles";

export { hashPassword, verifyPassword };
export type { AdminRole };

export const SESSION_COOKIE_NAME = "admin_session";

export interface SessionPayload {
  email: string;
  name: string;
  role: AdminRole;
  tokenVersion?: number;
  jti?: string;
  [key: string]: unknown;
}

export interface CreateSessionInput {
  email: string;
  name: string;
  role?: AdminRole;
  tokenVersion?: number;
}

/**
 * Creates a cryptographically signed JWT session token with unique JWT ID (jti)
 * and token versioning for active revocation support.
 */
export async function createSessionToken(payload: CreateSessionInput): Promise<string> {
  const secret = getAuthSecret();
  const jti = crypto.randomUUID();
  const role: AdminRole = isValidAdminRole(payload.role) ? payload.role : "viewer";

  return new SignJWT({
    email: payload.email.toLowerCase().trim(),
    name: payload.name.trim(),
    role,
    tokenVersion: payload.tokenVersion ?? 0,
    jti,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

/**
 * Verifies the JWT signature, structure, and expiration without database lookup.
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const secret = getAuthSecret();
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    if (
      typeof payload.email !== "string" ||
      typeof payload.name !== "string" ||
      !isValidAdminRole(payload.role)
    ) {
      return null;
    }

    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Reads and verifies the session token from cookies.
 */
export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export interface LeanAdminSession {
  _id: unknown;
  email: string;
  name: string;
  role: AdminRole;
  tokenVersion?: number;
  lastLogin?: Date;
}

/**
 * Lightweight lean variant of `getAuthenticatedAdmin` for endpoints that only
 * verify admin identity and do not call `.save()`. Excludes `passwordHash` and
 * skips Mongoose document hydration.
 */
export async function getAuthenticatedAdminLean(): Promise<LeanAdminSession | null> {
  const session = await getSession();
  if (!session || !session.email) return null;

  try {
    await connectDB();
    const admin = await AdminModel.findOne({ email: session.email.toLowerCase().trim() })
      .select("email name role tokenVersion lastLogin")
      .lean<LeanAdminSession>();
    if (!admin) return null;

    if (
      session.tokenVersion !== undefined &&
      admin.tokenVersion !== undefined &&
      session.tokenVersion !== admin.tokenVersion
    ) {
      return null;
    }

    return admin;
  } catch {
    return null;
  }
}

/**
 * Authenticates the admin session against the database, verifying that the user
 * still exists and that their active tokenVersion matches (invalidating sessions on password change).
 */
export async function getAuthenticatedAdmin(): Promise<HydratedDocument<IAdmin> | null> {
  const session = await getSession();
  if (!session || !session.email) return null;

  try {
    await connectDB();
    const admin = await AdminModel.findOne({ email: session.email.toLowerCase().trim() });
    if (!admin) return null;

    // Invalidate if tokenVersion in payload does not match active admin tokenVersion
    if (
      session.tokenVersion !== undefined &&
      admin.tokenVersion !== undefined &&
      session.tokenVersion !== admin.tokenVersion
    ) {
      return null;
    }

    return admin;
  } catch {
    return null;
  }
}

/**
 * Verifies both authentication and RBAC role authorization for API routes.
 */
export async function requireAdminRole(
  allowedRoles: readonly AdminRole[],
  req?: Request
): Promise<
  | { admin: LeanAdminSession; errorResponse: null }
  | { admin: null; errorResponse: NextResponse }
> {
  const admin = await getAuthenticatedAdminLean();
  if (!admin) {
    return {
      admin: null,
      errorResponse: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (!hasRequiredRole(admin.role, allowedRoles)) {
    logSecurityEvent("FORBIDDEN_ACCESS", {
      req,
      user: admin.email,
      status: "BLOCKED",
      details: { role: admin.role, required: allowedRoles },
    });
    return {
      admin: null,
      errorResponse: NextResponse.json(
        { error: "Forbidden: Insufficient role permissions" },
        { status: 403 }
      ),
    };
  }

  return { admin, errorResponse: null };
}
