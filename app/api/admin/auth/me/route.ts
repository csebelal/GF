import { NextResponse } from "next/server";
import { getAuthenticatedAdminLean } from "@/lib/auth/session";

export async function GET() {
  const admin = await getAuthenticatedAdminLean();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(
    { user: { email: admin.email, name: admin.name, role: admin.role } },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
