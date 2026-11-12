import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { AdminModel } from "@/lib/db/models/Admin";
import { verifyPassword, createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { RateLimiters, resetRateLimit } from "@/lib/security/rate-limit";
import { extractClientIp, logSecurityEvent } from "@/lib/security/audit";

// Precomputed dummy bcrypt hash ($2b$12$) used when user is not found to mitigate timing enumeration
const DUMMY_BCRYPT_HASH = "$2b$12$C6UzMDM.H6dfI/f/IKcEeO7H0oJ8tM1iQe5Q1yG3mM6yS8wN9qK6e";

export async function POST(request: Request) {
  const ip = extractClientIp(request.headers);

  // 1. Rate Limiting Protection against brute-force password guessing
  const rateLimitResult = RateLimiters.authLogin(ip, request);
  if (!rateLimitResult.success) {
    const retryAfter = rateLimitResult.retryAfterSeconds || 60;
    return NextResponse.json(
      {
        error: `Too many failed login attempts. Account temporarily locked out. Please try again in ${Math.ceil(retryAfter / 60)} minutes.`,
      },
      {
        status: 429,
        headers: {
          "Retry-After": retryAfter.toString(),
          "X-RateLimit-Limit": rateLimitResult.limit.toString(),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
    }

    const email = typeof body?.email === "string" ? body.email.toLowerCase().trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    // Email format validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      logSecurityEvent("AUTH_LOGIN_FAILED", {
        req: request,
        user: email,
        status: "FAILURE",
        details: { reason: "Malformed email" },
      });
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // Enforce per-account rate limit (defense against X-Forwarded-For rotation)
    const emailRateLimit = RateLimiters.authLoginEmail(email, request);
    if (!emailRateLimit.success) {
      const retryAfter = emailRateLimit.retryAfterSeconds || 60;
      return NextResponse.json(
        {
          error: `Too many failed login attempts. Account temporarily locked out. Please try again in ${Math.ceil(retryAfter / 60)} minutes.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": retryAfter.toString(),
            "X-RateLimit-Limit": emailRateLimit.limit.toString(),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    await connectDB();
    const admin = await AdminModel.findOne({ email });

    if (!admin) {
      await verifyPassword(password, DUMMY_BCRYPT_HASH);
      logSecurityEvent("AUTH_LOGIN_FAILED", {
        req: request,
        user: email,
        status: "FAILURE",
        details: { reason: "User not found" },
      });
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const isValid = await verifyPassword(password, admin.passwordHash);
    if (!isValid) {
      logSecurityEvent("AUTH_LOGIN_FAILED", {
        req: request,
        user: email,
        status: "FAILURE",
        details: { reason: "Incorrect password" },
      });
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // Successful authentication: reset rate limiters for this IP and email
    resetRateLimit(`login:${ip}`);
    resetRateLimit(`login_email:${email}`);

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    logSecurityEvent("AUTH_LOGIN_SUCCESS", {
      req: request,
      user: admin.email,
      status: "SUCCESS",
    });

    const token = await createSessionToken({
      email: admin.email,
      name: admin.name,
      role: "admin",
      tokenVersion: admin.tokenVersion || 0,
    });

    const response = NextResponse.json({
      success: true,
      user: { email: admin.email, name: admin.name },
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during authentication. Please try again." },
      { status: 500 }
    );
  }
}
