import { ogSize, renderOgImage } from "@/lib/og";
import { getProjectBySlug, getPublishedProjects } from "@/lib/projects";

export const alt = "Project by Afrin Akter Chishti";
export const size = ogSize;
export const contentType = "image/png";
export const dynamicParams = false;

export function generateStaticParams() {
  return getPublishedProjects().map((project) => ({ slug: project.slug }));
}

export default async function ProjectOpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  return renderOgImage({
    eyebrow: project ? project.category : "Portfolio",
    title: project?.title ?? "Portfolio project",
  });
}
