"use client";

import React from "react";
import { Clock, Sparkles, GitBranch, ArrowRight } from "lucide-react";
import Link from "next/link";
import { SerpentineTimeline } from "@/components/serpentine-timeline";
import projectsData from "@data/projects.json";
import { Project } from "@/lib/schemas";

const typedProjects = projectsData as Project[];

export default function ProjectsTimelinePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white selection:bg-indigo-500/30 relative overflow-x-hidden">
      {/* Background Mesh Gradient & Grid */}
      <div className="fixed inset-0 bg-grid-pattern opacity-40 pointer-events-none -z-10" />
      <div className="fixed top-0 left-0 w-full h-[600px] -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.15),transparent)] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] -z-10 bg-[radial-gradient(circle_at_100%_100%,rgba(168,85,247,0.1),transparent)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-8 lg:px-24 pt-16 sm:pt-20 pb-24">
        {/* Header */}
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 rounded-full border border-indigo-500/25 mb-4 shadow-sm">
            <GitBranch className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              S-Curve Journey • {typedProjects.length} Milestones
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-500 dark:from-white dark:via-neutral-200 dark:to-neutral-500 bg-clip-text text-transparent">
            Engineering Timeline
          </h1>

          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-3 leading-relaxed max-w-2xl mx-auto">
            A continuous serpentine pipeline tracing research, full-stack applications, and open-source contributions from inception to production.
          </p>

          <div className="flex items-center justify-center gap-3 mt-6">
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:border-indigo-500/40 transition-all"
            >
              <span>Explore Project Grid</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Serpentine Timeline Component */}
        <SerpentineTimeline projects={typedProjects} />
      </div>
    </div>
  );
}