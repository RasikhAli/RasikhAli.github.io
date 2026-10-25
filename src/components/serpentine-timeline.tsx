"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  ArrowUpRight,
  CheckCircle2,
  PlayCircle,
  CalendarClock,
  Search,
  Filter,
  Sparkles,
  ExternalLink,
  Github,
  Layers,
  ChevronRight,
  RotateCcw
} from "lucide-react";
import { Project } from "@/lib/schemas";
import { Badge } from "@/components/ui/badge";
import { SpotlightCard } from "@/components/ui/spotlight-card";

interface SerpentineTimelineProps {
  projects: Project[];
}

export function SerpentineTimeline({ projects }: SerpentineTimelineProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState<number>(18);

  // Extract unique years
  const availableYears = useMemo(() => {
    const years = projects
      .map((p) => (p.start_date ? new Date(p.start_date).getFullYear().toString() : ""))
      .filter((y) => y !== "");
    return ["all", ...Array.from(new Set(years)).sort((a, b) => b.localeCompare(a))];
  }, [projects]);

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects
      .filter((project) => {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          !q ||
          project.title.toLowerCase().includes(q) ||
          project.short_description.toLowerCase().includes(q) ||
          project.tech_stack.some((t) => t.toLowerCase().includes(q));

        const projectYear = project.start_date
          ? new Date(project.start_date).getFullYear().toString()
          : "";
        const matchesYear = selectedYear === "all" || projectYear === selectedYear;

        const matchesStatus = selectedStatus === "all" || project.status === selectedStatus;

        return matchesQuery && matchesYear && matchesStatus;
      })
      .sort((a, b) => {
        if (!a.start_date) return 1;
        if (!b.start_date) return -1;
        return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
      });
  }, [projects, searchQuery, selectedYear, selectedStatus]);

  const displayedProjects = useMemo(() => {
    return filteredProjects.slice(0, visibleCount);
  }, [filteredProjects, visibleCount]);

  // Split displayed projects into rows of 3 (for desktop serpentine)
  const rows = useMemo(() => {
    const r: Project[][] = [];
    for (let i = 0; i < displayedProjects.length; i += 3) {
      r.push(displayedProjects.slice(i, i + 3));
    }
    return r;
  }, [displayedProjects]);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "Present";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
      case "in_progress":
        return <PlayCircle className="w-3.5 h-3.5 text-blue-500 animate-spin-slow" />;
      default:
        return <CalendarClock className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  const getCoverImage = (project: Project) => {
    if (project.screenshots && project.screenshots.length > 0 && project.screenshots[0]) {
      const cover = project.screenshots[0];
      if (cover.startsWith("http://") || cover.startsWith("https://") || cover.startsWith("data:")) return cover;
      return cover.startsWith("/") ? cover : `/${cover}`;
    }
    return null;
  };

  return (
    <div className="space-y-12">
      {/* Control & Filter Bar */}
      <div className="p-4 sm:p-6 bg-white/70 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800/80 rounded-3xl backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search timeline milestones or tech stack..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-100/80 dark:bg-neutral-950/70 border border-neutral-200 dark:border-neutral-800 rounded-2xl text-xs sm:text-sm text-neutral-900 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Year Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {availableYears.slice(0, 5).map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedYear === yr
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                    : "bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-950 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                }`}
              >
                {yr === "all" ? "All Years" : yr}
              </button>
            ))}

            {/* Status Select */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-300 focus:outline-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
              <option value="planned">Planned</option>
            </select>

            {(searchQuery || selectedYear !== "all" || selectedStatus !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedYear("all");
                  setSelectedStatus("all");
                }}
                className="p-1.5 text-neutral-400 hover:text-rose-500 transition-colors"
                title="Reset filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Showing <strong className="text-neutral-900 dark:text-white">{displayedProjects.length}</strong> of {filteredProjects.length} milestones
          </span>
          <span className="hidden sm:inline-block font-mono text-[11px] text-indigo-500">
            S-Curve Pipeline View
          </span>
        </div>
      </div>

      {/* DESKTOP SERPENTINE S-CURVE PIPELINE (3 Cards per row) */}
      <div className="hidden lg:block relative space-y-16">
        {rows.map((rowProjects, rowIndex) => {
          const isEvenRow = rowIndex % 2 === 0;
          const isLastRow = rowIndex === rows.length - 1;
          const displayOrder = isEvenRow ? rowProjects : [...rowProjects].reverse();

          return (
            <div key={rowIndex} className="relative">
              {/* Row Cards Container */}
              <div
                className={`grid grid-cols-3 gap-8 items-stretch ${
                  !isEvenRow ? "direction-rtl" : ""
                }`}
              >
                {displayOrder.map((project, colIndex) => {
                  const globalIndex = rowIndex * 3 + (isEvenRow ? colIndex : (rowProjects.length - 1 - colIndex));
                  const isLastInRow = colIndex === displayOrder.length - 1;
                  const coverImage = getCoverImage(project);

                  return (
                    <div key={project.id} className="relative flex flex-col">
                      {/* Horizontal Inter-Card Pipe Connector */}
                      {!isLastInRow && (
                        <div
                          className={`absolute top-1/2 ${
                            isEvenRow ? "-right-8" : "-left-8"
                          } -translate-y-1/2 w-8 h-1 z-20 pointer-events-none flex items-center justify-center`}
                        >
                          <div className="w-full h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 relative">
                            <span
                              className={`absolute top-1/2 -translate-y-1/2 ${
                                isEvenRow ? "right-0" : "left-0"
                              } w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-sm shadow-indigo-500 animate-pulse`}
                            />
                          </div>
                        </div>
                      )}

                      {/* Timeline Milestone Card */}
                      <SpotlightCard className="flex-1 flex flex-col justify-between p-6 bg-white/90 dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800/80 rounded-3xl hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1.5 transition-all duration-300 relative group overflow-hidden">
                        
                        {/* Milestone Number & Date Ribbon */}
                        <div className="flex items-center justify-between gap-2 mb-4">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-[10px] font-black text-indigo-600 dark:text-indigo-400 font-mono">
                              #{String(globalIndex + 1).padStart(2, "0")}
                            </span>
                            <span className="flex items-center gap-1 text-[11px] font-bold text-neutral-500 dark:text-neutral-400">
                              <Calendar className="w-3 h-3 text-indigo-500" />
                              {formatDate(project.start_date)}
                            </span>
                          </div>

                          <Badge variant={project.status === "completed" ? "completed" : project.status === "in_progress" ? "in_progress" : "planned"}>
                            {getStatusIcon(project.status)}
                            <span className="text-[10px] uppercase font-bold">{project.status.replace("_", " ")}</span>
                          </Badge>
                        </div>

                        {/* Optional Screenshot Preview */}
                        {coverImage && (
                          <div className="relative aspect-video w-full rounded-2xl overflow-hidden mb-4 bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                            <img
                              src={coverImage}
                              alt={project.title}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        )}

                        {/* Card Body */}
                        <div className="space-y-2 flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="text-base font-extrabold text-neutral-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                              <Link href={`/projects/${project.id}`} className="inline-flex items-center gap-1">
                                <span>{project.title}</span>
                                <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all text-indigo-500 shrink-0" />
                              </Link>
                            </h3>
                            <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2 mt-1 leading-relaxed">
                              {project.short_description}
                            </p>
                          </div>

                          {/* Tech Stack Pills */}
                          <div className="flex flex-wrap gap-1 pt-3 border-t border-neutral-200/60 dark:border-neutral-800/60 mt-3">
                            {project.tech_stack.slice(0, 3).map((t) => (
                              <span
                                key={t}
                                className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 rounded-md text-[10px] font-semibold"
                              >
                                {t}
                              </span>
                            ))}
                            {project.tech_stack.length > 3 && (
                              <span className="px-1.5 py-0.5 text-neutral-400 text-[10px] font-semibold">
                                +{project.tech_stack.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      </SpotlightCard>
                    </div>
                  );
                })}
              </div>

              {/* CURVED HAIRPIN S-CONNECTOR BETWEEN ROWS */}
              {!isLastRow && (
                <div
                  className={`absolute -bottom-16 ${
                    isEvenRow ? "-right-8" : "-left-8"
                  } w-16 h-16 z-10 pointer-events-none flex items-center justify-center`}
                >
                  {isEvenRow ? (
                    /* Right-hand side U-turn curve connecting to next row */
                    <svg className="w-16 h-16 overflow-visible" viewBox="0 0 64 64" fill="none">
                      <defs>
                        <linearGradient id={`curve-grad-r-${rowIndex}`} x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="50%" stopColor="#a855f7" />
                          <stop offset="100%" stopColor="#6366f1" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M 0,0 C 48,0 48,64 0,64"
                        stroke={`url(#curve-grad-r-${rowIndex})`}
                        strokeWidth="3"
                        strokeLinecap="round"
                        className="opacity-80"
                      />
                      <circle cx="32" cy="32" r="3" fill="#a855f7" className="animate-ping" />
                    </svg>
                  ) : (
                    /* Left-hand side U-turn curve connecting to next row */
                    <svg className="w-16 h-16 overflow-visible" viewBox="0 0 64 64" fill="none">
                      <defs>
                        <linearGradient id={`curve-grad-l-${rowIndex}`} x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="50%" stopColor="#a855f7" />
                          <stop offset="100%" stopColor="#6366f1" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M 64,0 C 16,0 16,64 64,64"
                        stroke={`url(#curve-grad-l-${rowIndex})`}
                        strokeWidth="3"
                        strokeLinecap="round"
                        className="opacity-80"
                      />
                      <circle cx="32" cy="32" r="3" fill="#a855f7" className="animate-ping" />
                    </svg>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MOBILE / TABLET ADAPTIVE SERPENTINE FLOW (< 1024px) */}
      <div className="lg:hidden relative pl-6 space-y-8">
        {/* Continuous glowing vertical trace */}
        <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-emerald-500 z-0" />

        {displayedProjects.map((project, index) => {
          const coverImage = getCoverImage(project);

          return (
            <div key={project.id} className="relative">
              {/* Pulsing Connector Node */}
              <div className="absolute -left-[19px] top-5 w-4 h-4 rounded-full bg-white dark:bg-neutral-950 border-2 border-indigo-500 z-10 shadow-md shadow-indigo-500/30 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
              </div>

              {/* Card */}
              <SpotlightCard className="p-5 bg-white/90 dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl hover:border-indigo-500/50 hover:shadow-xl transition-all">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-md text-[10px] font-black text-indigo-600 dark:text-indigo-400 font-mono">
                    #{String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-indigo-500" />
                    {formatDate(project.start_date)}
                  </span>
                  <Badge variant={project.status === "completed" ? "completed" : project.status === "in_progress" ? "in_progress" : "planned"}>
                    <span className="text-[10px] uppercase font-bold">{project.status.replace("_", " ")}</span>
                  </Badge>
                </div>

                {coverImage && (
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-3 bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                    <img
                      src={coverImage}
                      alt={project.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white line-clamp-1 mb-1">
                  <Link href={`/projects/${project.id}`} className="hover:text-indigo-500 transition-colors">
                    {project.title}
                  </Link>
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2 leading-relaxed mb-3">
                  {project.short_description}
                </p>

                <div className="flex flex-wrap gap-1">
                  {project.tech_stack.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 rounded-md text-[10px] font-semibold"
                    >
                      {t}
                    </span>
                  ))}
                  {project.tech_stack.length > 3 && (
                    <span className="text-[10px] text-neutral-400 self-center">
                      +{project.tech_stack.length - 3}
                    </span>
                  )}
                </div>
              </SpotlightCard>
            </div>
          );
        })}
      </div>

      {/* Load More Button if filtered has more than visible */}
      {filteredProjects.length > visibleCount && (
        <div className="text-center pt-8">
          <button
            onClick={() => setVisibleCount((prev) => prev + 18)}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all hover:scale-105"
          >
            <span>Load More Milestones ({filteredProjects.length - visibleCount} remaining)</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
