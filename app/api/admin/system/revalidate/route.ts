import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAuthenticatedAdminLean, requireAdminRole } from "@/lib/auth/session";
import { invalidateRepositoryCache } from "@/lib/db/repository";
import { logSecurityEvent } from "@/lib/security/audit";

export async function POST(request: Request) {
  const { admin, errorResponse } = await requireAdminRole(["admin"], request);
  if (errorResponse) return errorResponse;

  invalidateRepositoryCache();
  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");

  logSecurityEvent("CACHE_INVALIDATED", {
    req: request,
    user: admin.email || "admin",
    status: "SUCCESS",
    details: { scope: "repository+next-layout" },
  });

  return NextResponse.json({
    ok: true,
    invalidatedAt: new Date().toISOString(),
  });
}
