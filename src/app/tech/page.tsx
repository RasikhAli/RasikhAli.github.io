"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Code2, ArrowUpRight, FolderGit } from "lucide-react";
import { ProjectCard } from "@/components/project-card";
import projectsData from "@data/projects.json";
import developersData from "@data/developers.json";
import { Project } from "@/lib/schemas";
const typedProjects = projectsData as Project[];

export default function TechExplorerPage() {
  const [selectedTech, setSelectedTech] = useState<string | null>(null);

  // Group technologies and count usage frequency
  const techStats = useMemo(() => {
    const counts: Record<string, number> = {};
    typedProjects.forEach((project) => {
      project.tech_stack.forEach((tech) => {
        counts[tech] = (counts[tech] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, []);

  // Filter projects associated with the selected technology
  const associatedProjects = useMemo(() => {
    if (!selectedTech) return [];
    return typedProjects.filter((p) => p.tech_stack.includes(selectedTech));
  }, [selectedTech]);

  return (
    <div className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-white py-16 selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header Title */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
            Technology Explorer
          </h1>
          <p className="text-sm text-neutral-450">
            A visual overview of the technologies, libraries, and frameworks utilized across our project catalog.
          </p>
        </div>

        {/* Tech Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {techStats.map((tech) => {
            const isSelected = selectedTech === tech.name;
            return (
              <button
                key={tech.name}
                onClick={() => setSelectedTech(isSelected ? null : tech.name)}
                className={`p-5 rounded-xl border text-left transition-all duration-200 backdrop-blur-md relative ${
                  isSelected
                    ? "bg-indigo-600/10 border-indigo-500 text-indigo-400 ring-1 ring-indigo-500/20"
                    : "bg-neutral-900/40 border-neutral-850 text-neutral-300 hover:border-neutral-700/60 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between mb-3 text-neutral-400">
                  <Code2 className={`w-5 h-5 ${isSelected ? "text-indigo-400" : "text-neutral-500"}`} />
                  <span className="text-[10px] font-bold bg-neutral-850 px-2 py-0.5 rounded border border-neutral-800">
                    {tech.count} {tech.count === 1 ? "proj" : "projs"}
                  </span>
                </div>
                <div className="font-semibold text-sm line-clamp-1">{tech.name}</div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Project Filter Details */}
        {selectedTech && (
          <div className="space-y-6 pt-8 border-t border-neutral-900 animate-in fade-in duration-300">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FolderGit className="w-5 h-5 text-indigo-400" />
                  <span>Projects using {selectedTech}</span>
                </h2>
                <p className="text-xs text-neutral-500 mt-1">Explore implementation details for this technology tag.</p>
              </div>
              <button
                onClick={() => setSelectedTech(null)}
                className="text-xs font-semibold text-neutral-500 hover:text-neutral-305 hover:underline"
              >
                Clear Selection
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {associatedProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
