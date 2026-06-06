import developersData from "../../../../data/developers.json";
import type { Developer } from "@/lib/schemas";
import { DeveloperPageClient } from "./client";

export async function generateStaticParams() {
  // Handle case where developers data is empty to prevent build failure
  const developers = Array.isArray(developersData) ? (developersData as Developer[]) : [];
  if (developers.length === 0) {
    // Return a fallback param to allow static export to proceed
    return [{ id: "placeholder" }];
  }
  return developers.map((dev) => ({ id: dev.id }));
}

export default async function DeveloperPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Handle placeholder case in development
  if (id === "placeholder") {
    return <div>Loading developers...</div>;
  }
  return <DeveloperPageClient id={id} />;
}
