import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, getSession } from "@/lib/auth/session";
import { logSecurityEvent } from "@/lib/security/audit";

export async function POST(request: Request) {
  const session = await getSession();

  logSecurityEvent("AUTH_LOGOUT", {
    req: request,
    user: session?.email || "unknown",
    status: "SUCCESS",
  });

  const response = NextResponse.json({ success: true, message: "Logged out" });
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
