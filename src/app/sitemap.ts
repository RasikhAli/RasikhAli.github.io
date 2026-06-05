import { MetadataRoute } from "next";
import siteConfig from "../../data/site-config.json";
import developersData from "../../data/developers.json";
import projectsData from "../../data/projects.json";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://rasikhali.github.io";

  const staticRoutes = [
    "",
    "/projects",
    "/timeline",
    "/tech",
    "/developers",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  const projectRoutes = projectsData.map((project) => ({
    url: `${baseUrl}/projects/${project.id}`,
    lastModified: new Date(project.updated_at || new Date()),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const developerRoutes = developersData.map((dev) => ({
    url: `${baseUrl}/developers/${dev.id}`,
    lastModified: new Date(dev.updated_at || new Date()),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...projectRoutes, ...developerRoutes];
}
