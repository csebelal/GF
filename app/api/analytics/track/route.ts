import { NextResponse } from "next/server";
import { recordPageView } from "@/lib/analytics/service";
import { extractClientIp } from "@/lib/security/audit";
import { RateLimiters } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = extractClientIp(request.headers);
    const limit = RateLimiters.analyticsTrack(ip, request);
    if (!limit.success) {
      return new NextResponse(null, { status: 204 });
    }

    const rawText = await request.text();
    if (!rawText || rawText.length > 2048) {
      return new NextResponse(null, { status: 204 });
    }

    const body = JSON.parse(rawText) as { pathname?: unknown; referrer?: unknown };
    const userAgent = request.headers.get("user-agent") || "";
    const host = request.headers.get("host") || "";

    await recordPageView({
      pathname: body?.pathname,
      referrer: body?.referrer,
      userAgent,
      ip,
      host,
    });
  } catch {
    // Analytics tracking must never disrupt or fail the visitor's experience
  }

  return new NextResponse(null, { status: 204 });
}
