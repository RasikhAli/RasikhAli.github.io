"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { Github } from "./brand-icons";
import { Project } from "@/lib/schemas";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Badge } from "@/components/ui/badge";
import developersData from "@data/developers.json";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const getCoverImage = () => {
    if (project.screenshots && project.screenshots.length > 0) {
      const cover = project.screenshots[0];
      if (!cover) return "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800";
      if (cover.startsWith("http://") || cover.startsWith("https://") || cover.startsWith("data:")) return cover;
      return `/${cover}`;
    }
    return "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800";
  };

  const statusVariant = (status: string) => {
    if (status === "completed") return "completed";
    if (status === "in_progress") return "in_progress";
    if (status === "planned") return "planned";
    return "neutral";
  };

  const assignedDevs = developersData.filter((dev) =>
    project.developer_ids.includes(dev.id)
  );

  return (
    <SpotlightCard className="group flex flex-col h-full hover:-translate-y-1.5 transition-all duration-300">
      {/* Cover Image Container */}
      <div className="relative aspect-video overflow-hidden bg-neutral-950">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-neutral-800/60 animate-pulse" />
        )}
        <motion.img
          layoutId={`project-img-${project.id}`}
          src={getCoverImage()}
          alt={project.title}
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          loading="lazy"
          decoding="async"
        />
        <div className="absolute top-3 right-3 z-10">
          <Badge variant={statusVariant(project.status)}>
            {project.status.replace("_", " ").toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {project.tech_stack.slice(0, 3).map((tech) => (
              <Badge key={tech} variant="tech">
                {tech}
              </Badge>
            ))}
            {project.tech_stack.length > 3 && (
              <Badge variant="neutral">
                +{project.tech_stack.length - 3} more
              </Badge>
            )}
          </div>

          <div>
            <h3 className="text-xl font-extrabold text-neutral-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1">
              <Link href={`/projects/${project.id}`} className="focus:outline-none">
                <span className="absolute inset-0" aria-hidden="true" />
                {project.title}
              </Link>
              <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-300 text-indigo-400" />
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-2 line-clamp-2 leading-relaxed">
              {project.short_description}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-neutral-200 dark:border-neutral-800/80 pt-4">
          <div className="flex -space-x-2 overflow-hidden">
            {assignedDevs.map((dev) => (
              <img
                key={dev.id}
                src={dev.avatar}
                alt={dev.name}
                title={dev.name}
                loading="lazy"
                decoding="async"
                className="inline-block h-7 w-7 rounded-full ring-2 ring-white dark:ring-neutral-900 object-cover"
              />
            ))}
          </div>

          <div className="flex items-center gap-3 relative z-10 text-neutral-700 dark:text-neutral-300">
            {project.github_repo_url && (
              <a
                href={project.github_repo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors p-1"
                title="View Repository"
              >
                <Github className="w-4 h-4" />
              </a>
            )}
            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors p-1"
                title="Live Demonstration"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </SpotlightCard>
  );
}