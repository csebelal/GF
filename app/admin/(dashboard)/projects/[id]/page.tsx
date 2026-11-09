import { notFound } from "next/navigation";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { getDbProjects } from "@/lib/db/repository";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditProjectPage({ params }: PageProps) {
  const { id } = await params;
  const projects = await getDbProjects();
  const project = projects.find((p) => (p as any)._id === id || p.slug === id);

  if (!project) {
    notFound();
  }

  return <ProjectForm initialData={project} isNew={false} />;
}
