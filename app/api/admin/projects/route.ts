import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAuthenticatedAdminLean, requireAdminRole } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connection";
import { ProjectModel } from "@/lib/db/models/Project";
import { invalidateRepositoryCache, getDbProjects } from "@/lib/db/repository";
import { filterProjectPayload } from "@/lib/security/sanitize";
import { logSecurityEvent } from "@/lib/security/audit";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const NO_STORE_HEADERS = { "Cache-Control": "private, no-store" };

export async function GET(request: Request) {
  const admin = await getAuthenticatedAdminLean();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await getDbProjects();
  const { searchParams } = new URL(request.url);
  if (searchParams.get("summary") === "1") {
    const summaries = projects.map((p) => ({
      _id: p._id,
      slug: p.slug,
      title: p.title,
      category: p.category,
      status: p.status,
      featured: p.featured,
      tools: p.tools,
      videoCount: p.videos?.length || 0,
      hasDocs: Boolean(p.documentationContent || p.documentation),
    }));
    return NextResponse.json(summaries, { headers: NO_STORE_HEADERS });
  }

  return NextResponse.json(projects, { headers: NO_STORE_HEADERS });
}

export async function POST(request: Request) {
  try {
    const { admin, errorResponse } = await requireAdminRole(["admin", "editor"], request);
    if (errorResponse) return errorResponse;

    let rawData: any;
    try {
      rawData = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
    }

    if (!rawData || typeof rawData !== "object") {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    const data = filterProjectPayload(rawData);

    const slug = typeof data.slug === "string" ? data.slug.toLowerCase().trim() : "";
    const title = typeof data.title === "string" ? data.title.trim() : "";
    const summary = typeof data.summary === "string" ? data.summary.trim() : "";
    const category = typeof data.category === "string" ? data.category.trim() : "";

    if (!slug || !title || !summary || !category) {
      return NextResponse.json(
        { error: "Slug, title, summary, and category are required." },
        { status: 400 }
      );
    }

    if (!SLUG_PATTERN.test(slug)) {
      return NextResponse.json(
        { error: `Slug "${slug}" is invalid. Use only lowercase letters, numbers, and single hyphens.` },
        { status: 400 }
      );
    }

    await connectDB();

    // Check duplicate slug with minimal projection
    const duplicate = await ProjectModel.findOne({ slug }).select("_id").lean();
    if (duplicate) {
      return NextResponse.json({ error: `Slug "${slug}" is already in use.` }, { status: 400 });
    }

    const count = await ProjectModel.estimatedDocumentCount();
    const newProject = await ProjectModel.create({
      ...data,
      slug,
      title,
      summary,
      category,
      sortOrder: count,
    });

    invalidateRepositoryCache();
    try {
      revalidatePath("/", "layout");
      revalidatePath("/portfolio");
      revalidatePath(`/portfolio/${newProject.slug}`);
    } catch (e) {
      console.warn("Revalidation notice:", e);
    }

    logSecurityEvent("PROJECT_CREATED", {
      req: request,
      user: admin.email,
      status: "SUCCESS",
      details: { slug: newProject.slug, title: newProject.title },
    });

    return NextResponse.json({ success: true, project: newProject }, { status: 201 });
  } catch (error: any) {
    console.error("Create project error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while creating the project." },
      { status: 500 }
    );
  }
}
