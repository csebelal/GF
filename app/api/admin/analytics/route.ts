import { NextResponse } from "next/server";
import { parseAnalyticsRange } from "@/lib/analytics/helpers";
import { getTrafficAnalytics } from "@/lib/analytics/service";
import { getAuthenticatedAdminLean } from "@/lib/auth/session";

export async function GET(request: Request) {
  const admin = await getAuthenticatedAdminLean();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const range = parseAnalyticsRange(searchParams.get("range"));

  const analytics = await getTrafficAnalytics(range);
  return NextResponse.json(analytics);
}
