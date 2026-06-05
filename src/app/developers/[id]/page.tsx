import developersData from "@data/developers.json";
import { DeveloperPageClient } from "./client";

export const dynamicParams = false;

export async function generateStaticParams() {
  return developersData.map((dev) => ({ id: dev.id }));
}

export default async function DeveloperPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  return <DeveloperPageClient id={id} />;
}
