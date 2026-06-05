import projectsData from "@data/projects.json";
import { ProjectDetailsClient } from "./client";

export function generateStaticParams() {
  return projectsData.map((project) => ({ id: project.id }));
}

export default async function ProjectDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProjectDetailsClient id={id} />;
}
