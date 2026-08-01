"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, FolderGit, Sparkles, X } from "lucide-react";
import { ProjectCard } from "@/components/project-card";
import { Marquee } from "@/components/ui/marquee";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import projectsData from "@data/projects.json";
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

  const allTechNames = useMemo(() => techStats.map((t) => t.name), [techStats]);

  // Filter projects associated with the selected technology
  const associatedProjects = useMemo(() => {
    if (!selectedTech) return [];
    return typedProjects.filter((p) => p.tech_stack.includes(selectedTech));
  }, [selectedTech]);

  return (
    <div className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-white selection:bg-indigo-500/30">
      <div className="fixed top-0 left-0 w-full h-[600px] -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.1),transparent)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 space-y-12">
        
        {/* Header Title */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-600 dark:text-indigo-400 text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Tech Stack Index</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-500 dark:from-white dark:via-neutral-200 dark:to-neutral-500 bg-clip-text text-transparent">
            Technology Explorer
          </h1>
          <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
            A visual overview of the technologies, frameworks, and tools deployed across our production software. Click any tag to inspect related projects.
          </p>
        </div>

        {/* Top Tech Marquee overview */}
        <div className="py-2 border-y border-neutral-200 dark:border-neutral-800/80">
          <Marquee items={allTechNames} speed={30} />
        </div>

        {/* Interactive Tech Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {techStats.map((tech) => {
            const isSelected = selectedTech === tech.name;
            return (
              <button
                key={tech.name}
                onClick={() => setSelectedTech(isSelected ? null : tech.name)}
                className={`group relative p-5 rounded-2xl border text-left transition-all duration-300 backdrop-blur-md overflow-hidden ${
                  isSelected
                    ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white border-transparent shadow-xl shadow-indigo-500/25 scale-[1.03]"
                    : "bg-white/80 dark:bg-neutral-900/40 border-neutral-200/80 dark:border-neutral-800/80 text-neutral-800 dark:text-neutral-300 hover:border-indigo-500/40 hover:-translate-y-1"
                }`}
              >
                {isSelected && (
                  <div className="absolute -inset-1 bg-indigo-500/30 blur-md -z-10" />
                )}
                <div className="flex items-center justify-between mb-3">
                  <Code2 className={`w-5 h-5 ${isSelected ? "text-white" : "text-indigo-500"}`} />
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                      isSelected
                        ? "bg-white/20 text-white border-white/30"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700"
                    }`}
                  >
                    {tech.count} {tech.count === 1 ? "proj" : "projs"}
                  </span>
                </div>
                <div className={`font-extrabold text-sm truncate ${isSelected ? "text-white" : "text-neutral-900 dark:text-white"}`}>
                  {tech.name}
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Filtered Projects Section */}
        <AnimatePresence mode="wait">
          {selectedTech && (
            <motion.div
              key={selectedTech}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 pt-8 border-t border-neutral-200 dark:border-neutral-800"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
                    <FolderGit className="w-6 h-6 text-indigo-500" />
                    <span>Projects utilizing <span className="text-indigo-600 dark:text-indigo-400">{selectedTech}</span></span>
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1">Found {associatedProjects.length} matching software builds.</p>
                </div>
                <button
                  onClick={() => setSelectedTech(null)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear Selection</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {associatedProjects.map((project) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ProjectCard project={project} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
