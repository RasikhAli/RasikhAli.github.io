"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, ArrowUpRight, ExternalLink } from "lucide-react";
import { Github } from "./brand-icons";
import { Project } from "@/lib/schemas";
import developersData from "@data/developers.json";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const getCoverImage = () => {
    if (project.screenshots && project.screenshots.length > 0) {
      const cover = project.screenshots[0];
      return cover.startsWith("http") ? cover : `/${cover}`;
    }
    return "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "in_progress":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "planned":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      default:
        return "bg-neutral-500/10 text-neutral-400 border-neutral-500/20";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace("_", " ").toUpperCase();
  };

  // Find developers assigned to this project
  const assignedDevs = developersData.filter((dev) =>
    project.developer_ids.includes(dev.id)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col h-full bg-neutral-900/40 border border-neutral-800 rounded-xl overflow-hidden backdrop-blur-md hover:border-neutral-700/80 transition-colors"
    >
      {/* Dynamic glow decoration */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-indigo-500/0 via-indigo-500/0 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Cover Image Container */}
      <div className="relative aspect-video overflow-hidden bg-neutral-950">
        <img
          src={getCoverImage()}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Status Badge */}
        <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusColor(project.status)}`}>
          {getStatusLabel(project.status)}
        </span>
      </div>

      {/* Content Section */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div className="space-y-3">
          {/* Tech Stack Mini Tagging */}
          <div className="flex flex-wrap gap-1.5">
            {project.tech_stack.slice(0, 3).map((tech) => (
              <span
                key={tech}
                className="text-[10px] font-medium bg-neutral-850 text-neutral-400 px-2 py-0.5 rounded-full border border-neutral-800"
              >
                {tech}
              </span>
            ))}
            {project.tech_stack.length > 3 && (
              <span className="text-[10px] font-medium bg-neutral-850 text-neutral-500 px-2 py-0.5 rounded-full border border-neutral-800">
                +{project.tech_stack.length - 3} more
              </span>
            )}
          </div>

          {/* Project Details */}
          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors flex items-center gap-1">
              <Link href={`/projects/${project.id}`} className="focus:outline-none">
                <span className="absolute inset-0" aria-hidden="true" />
                {project.title}
              </Link>
              <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-indigo-400" />
            </h3>
            <p className="text-sm text-neutral-400 mt-2 line-clamp-2">
              {project.short_description}
            </p>
          </div>
        </div>

        {/* Footer Section */}
        <div className="flex items-center justify-between border-t border-neutral-800/80 pt-4 mt-4">
          {/* Assigned Developer Avatars */}
          <div className="flex -space-x-2 overflow-hidden">
            {assignedDevs.map((dev) => (
              <img
                key={dev.id}
                src={dev.avatar}
                alt={dev.name}
                title={dev.name}
                className="inline-block h-6.5 w-6.5 rounded-full ring-2 ring-neutral-900 object-cover"
              />
            ))}
          </div>

          {/* Action Links */}
          <div className="flex items-center gap-3 relative z-10 text-neutral-400">
            {project.github_repo_url && (
              <a
                href={project.github_repo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
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
                className="hover:text-white transition-colors"
                title="Live Demonstration"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
