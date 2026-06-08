"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Calendar, Circle, ArrowUpRight, Clock } from "lucide-react";
import projectsData from "@data/projects.json";
import { Project } from "@/lib/schemas";
const typedProjects = projectsData as Project[];

export default function ProjectsTimelinePage() {
  const sortedProjects = useMemo(() => {
    return [...typedProjects].sort((a, b) => {
      if (!a.start_date) return 1;
      if (!b.start_date) return -1;
      return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
    });
  }, []);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "Present";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
      case "in_progress":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
      case "planned":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
      default:
        return "bg-neutral-500/10 text-neutral-500 border-neutral-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white selection:bg-indigo-500/30">
      <div className="fixed top-0 left-0 w-full h-[600px] -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.08),transparent)] pointer-events-none" />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">

        {/* Header */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-500/10 rounded-xl">
              <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-neutral-900 to-neutral-500 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent">
              Project Timeline
            </h1>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 ml-[3.25rem]">
            A chronological timeline of project launch dates, ongoing maintenance, and future plans.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative pl-8 md:pl-0">
          {/* Vertical line */}
          <div className="absolute left-[15px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/40 via-indigo-500/20 to-transparent" />

          {sortedProjects.map((project, index) => (
            <div key={project.id} className="relative mb-12 last:mb-0">
              {/* Timeline dot */}
              <div className="absolute left-[7px] md:left-1/2 md:-translate-x-1/2 top-6 w-4 h-4 rounded-full bg-white dark:bg-neutral-950 border-2 border-indigo-500 z-10 shadow-sm shadow-indigo-500/20" />

              {/* Content - alternating sides on desktop */}
              <div className={`md:w-1/2 ${index % 2 === 0 ? "md:pr-12 md:ml-0" : "md:pl-12 md:ml-auto"}`}>
                {/* Mobile date badge */}
                <div className="md:hidden flex items-center gap-1.5 mb-2 ml-2">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {formatDate(project.start_date)} – {formatDate(project.end_date)}
                  </span>
                </div>

                {/* Desktop date label */}
                <div className={`hidden md:flex items-center gap-2 mb-3 ${index % 2 === 0 ? "justify-end" : ""}`}>
                  <div className={`px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-full`}>
                    <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400">
                      {formatDate(project.start_date)}
                    </span>
                    <span className="text-xs text-indigo-400 dark:text-indigo-500 ml-1">
                      → {formatDate(project.end_date)}
                    </span>
                  </div>
                </div>

                {/* Card */}
                <div className="group bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 hover:border-indigo-400/30 dark:hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-neutral-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        <Link href={`/projects/${project.id}`} className="flex items-center gap-1.5">
                          {project.title}
                          <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-y-0.5" />
                        </Link>
                      </h3>
                    </div>
                    <span className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full border ${getStatusColor(project.status)}`}>
                      {project.status.replace("_", " ").toUpperCase()}
                    </span>
                  </div>

                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-2">
                    {project.short_description}
                  </p>

                  {/* Tech pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {project.tech_stack.map((tech) => (
                      <span
                        key={tech}
                        className="text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-2.5 py-1 rounded-full border border-neutral-200 dark:border-neutral-700"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}