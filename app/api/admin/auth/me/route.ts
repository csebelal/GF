import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth/session";

export async function GET() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ user: { email: admin.email, name: admin.name, role: admin.role } });
}
