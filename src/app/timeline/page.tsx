"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Calendar, Circle, ArrowUpRight } from "lucide-react";
import projectsData from "@data/projects.json";

export default function ProjectsTimelinePage() {
  // Sort projects by start_date descending (empty dates go to bottom)
  const sortedProjects = useMemo(() => {
    return [...projectsData].sort((a, b) => {
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
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "in_progress":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "planned":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      default:
        return "bg-neutral-500/10 text-neutral-400 border-neutral-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white py-16 selection:bg-indigo-500/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header Title */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
            Project Timeline
          </h1>
          <p className="text-sm text-neutral-450">
            A chronological timeline of project launch dates, ongoing maintenance, and future plans.
          </p>
        </div>

        {/* Timeline Line & Grid container */}
        <div className="relative border-l border-neutral-800 ml-4 md:ml-32 pl-8 md:pl-10 space-y-12 py-4">
          {sortedProjects.map((project, index) => (
            <div key={project.id} className="relative group">
              
              {/* Left Side Timeline node dot */}
              <span className="absolute -left-[41px] top-1.5 flex items-center justify-center bg-neutral-950 w-6.5 h-6.5 rounded-full ring-4 ring-neutral-950">
                <Circle className="w-3.5 h-3.5 fill-indigo-500 text-indigo-500 group-hover:scale-115 transition-transform" />
              </span>

              {/* Date Block Left of Timeline (only visible on medium-and-above devices) */}
              <div className="hidden md:block absolute -left-44 top-1 w-32 text-right">
                <span className="text-xs font-bold text-neutral-450 uppercase tracking-wider block">
                  {formatDate(project.start_date)}
                </span>
                <span className="text-[10px] text-neutral-500 block mt-0.5">
                  to {formatDate(project.end_date)}
                </span>
              </div>

              {/* Content Card */}
              <div className="p-6 bg-neutral-900/40 border border-neutral-850 rounded-xl backdrop-blur-md group-hover:border-neutral-700/60 transition-all space-y-3 relative">
                {/* Mobiles Only date block display */}
                <div className="md:hidden flex items-center gap-1.5 text-xs font-bold text-neutral-455 uppercase tracking-wider mb-2">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span>
                    {formatDate(project.start_date)} – {formatDate(project.end_date)}
                  </span>
                </div>

                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                      <Link href={`/projects/${project.id}`}>
                        {project.title}
                      </Link>
                      <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all text-indigo-400" />
                    </h3>
                    <p className="text-sm text-neutral-400 mt-1">{project.short_description}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusColor(project.status)}`}>
                    {project.status.replace("_", " ").toUpperCase()}
                  </span>
                </div>

                {/* Tech stack mini pills */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {project.tech_stack.map((tech) => (
                    <span
                      key={tech}
                      className="text-[10px] font-medium bg-neutral-850 text-neutral-400 px-2 py-0.5 rounded border border-neutral-800"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
