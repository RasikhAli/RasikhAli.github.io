import projectsData from "@data/projects.json";
import { ProjectDetailsClient } from "./client";

export async function generateStaticParams() {
  return projectsData.map((project) => ({ id: project.id }));
}

export default async function ProjectDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  return <ProjectDetailsClient id={id} />;
}
