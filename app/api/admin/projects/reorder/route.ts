import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAuthenticatedAdmin } from "@/lib/auth/session";
import { reorderDbProjects } from "@/lib/db/repository";
import { logSecurityEvent } from "@/lib/security/audit";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function POST(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
    }

    const { slugs } = body || {};
    if (!Array.isArray(slugs) || slugs.length === 0 || slugs.length > 500) {
      return NextResponse.json({ error: "Valid slugs array required (1-500 items)." }, { status: 400 });
    }

    // Validate that every slug is a clean valid slug string
    const sanitizedSlugs: string[] = [];
    for (const item of slugs) {
      if (typeof item !== "string" || !SLUG_PATTERN.test(item.trim())) {
        return NextResponse.json({ error: `Invalid slug format in reorder list: ${String(item)}` }, { status: 400 });
      }
      sanitizedSlugs.push(item.trim());
    }

    await reorderDbProjects(sanitizedSlugs);

    try {
      revalidatePath("/", "layout");
      revalidatePath("/portfolio");
    } catch (e) {
      console.warn("Revalidation notice:", e);
    }

    logSecurityEvent("PROJECTS_REORDERED", {
      req: request,
      user: admin.email,
      status: "SUCCESS",
      details: { count: sanitizedSlugs.length },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Reorder error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred while reordering projects." },
      { status: 500 }
    );
  }
}
