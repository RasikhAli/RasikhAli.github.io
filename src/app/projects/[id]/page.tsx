import projectsData from "../../../../data/projects.json";
import type { Project } from "@/lib/schemas";
import { ProjectDetailsClient } from "./client";

export async function generateStaticParams() {
  // Handle case where projects data is empty to prevent build failure
  const projects = Array.isArray(projectsData) ? (projectsData as Project[]) : [];
  if (projects.length === 0) {
    // Return a fallback param to allow static export to proceed
    return [{ id: "placeholder" }];
  }
  return projects.map((project) => ({ id: project.id }));
}

export default async function ProjectDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Handle placeholder case in development
  if (id === "placeholder") {
    return <div>Loading projects...</div>;
  }
  return <ProjectDetailsClient id={id} />;
}
