import developersData from "@data/developers.json";
import { DeveloperPageClient } from "./client";

export function generateStaticParams() {
  return developersData.map((dev) => ({ id: dev.id }));
}

export default async function DeveloperPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DeveloperPageClient id={id} />;
}
