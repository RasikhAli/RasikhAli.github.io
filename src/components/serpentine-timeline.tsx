"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  ArrowUpRight,
  CheckCircle2,
  PlayCircle,
  CalendarClock,
  Search,
  ExternalLink,
  ChevronRight,
  RotateCcw,
  Zap,
  Grid3X3,
  GitCommit,
  GitBranch,
  Eye
} from "lucide-react";
import { Github } from "@/components/brand-icons";
import { Project } from "@/lib/schemas";
import { Badge } from "@/components/ui/badge";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { TechStackPlaceholder } from "@/components/tech-stack-placeholder";

interface SerpentineTimelineProps {
  projects: Project[];
}

// Fixed geometry constants for mathematical alignment
const CARD_HEIGHT = 460; // Exact height of every card
const ROW_GAP = 64; // gap-y-16 = 64px
const DELTA_Y = CARD_HEIGHT + ROW_GAP; // Exactly 524px from center of row N to center of row N+1
const HORIZONTAL_GAP = 48; // gap-x-12 = 48px

export function SerpentineTimeline({ projects }: SerpentineTimelineProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState<number>(18);
  const [viewMode, setViewMode] = useState<"serpentine" | "grid" | "linear">("serpentine");
  const [quickPreviewProject, setQuickPreviewProject] = useState<Project | null>(null);

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
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case "in_progress":
        return <PlayCircle className="w-3.5 h-3.5 text-indigo-400 animate-spin-slow" />;
      default:
        return <CalendarClock className="w-3.5 h-3.5 text-amber-400" />;
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
      {/* Control & View Mode Switcher */}
      <div className="p-5 sm:p-6 bg-neutral-900/90 border border-neutral-800 rounded-3xl backdrop-blur-2xl shadow-2xl space-y-4 text-left">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search projects, domains, or tech stack..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-950/80 border border-neutral-800 rounded-2xl text-xs sm:text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-2xl border border-neutral-800 shrink-0">
            <button
              onClick={() => setViewMode("serpentine")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === "serpentine"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>S-Curve Flow</span>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === "grid"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>Grid View</span>
            </button>
            <button
              onClick={() => setViewMode("linear")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === "linear"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <GitCommit className="w-3.5 h-3.5" />
              <span>Linear Tree</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-800/80">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 mr-1">Year:</span>
            {availableYears.map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  selectedYear === yr
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm"
                    : "bg-neutral-950 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800/60"
                }`}
              >
                {yr === "all" ? "All Years" : yr}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-bold text-neutral-300 focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed Only</option>
              <option value="in_progress">In Progress Only</option>
              <option value="planned">Planned Only</option>
            </select>

            {(searchQuery || selectedYear !== "all" || selectedStatus !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedYear("all");
                  setSelectedStatus("all");
                }}
                className="p-1.5 text-neutral-400 hover:text-rose-400 transition-colors"
                title="Reset filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* VIEW 1: SERPENTINE S-CURVE CIRCUIT PIPELINE */}
      {viewMode === "serpentine" && (
        <div className="space-y-16 relative">
          
          {/* Desktop Serpentine Grid (3 cards per row) */}
          <div className="hidden lg:block space-y-16">
            {rows.map((rowProjects, rowIndex) => {
              const isEvenRow = rowIndex % 2 === 0;
              const isLastRow = rowIndex === rows.length - 1;
              // On even rows: left to right. On odd rows: right to left.
              const displayOrder = isEvenRow ? rowProjects : [...rowProjects].reverse();

              return (
                <div
                  key={rowIndex}
                  className="relative"
                  style={{ height: `${CARD_HEIGHT}px` }}
                >
                  {/* Grid of 3 Cards */}
                  <div className="grid grid-cols-3 gap-12 h-full relative">
                    {displayOrder.map((project, colIndex) => {
                      const globalIndex = rowIndex * 3 + (isEvenRow ? colIndex : (rowProjects.length - 1 - colIndex));
                      const isLastInRow = colIndex === displayOrder.length - 1;
                      const coverImage = getCoverImage(project);

                      return (
                        <div key={project.id} className="relative h-full flex flex-col">
                          
                          {/* Left Connection Port Socket (at Y = 50%) */}
                          <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-neutral-950 border border-indigo-400 z-30 shadow-[0_0_8px_#6366f1] flex items-center justify-center">
                            <span className="w-1 h-1 rounded-full bg-indigo-300" />
                          </div>

                          {/* Right Connection Port Socket (at Y = 50%) */}
                          <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-neutral-950 border border-purple-400 z-30 shadow-[0_0_8px_#a855f7] flex items-center justify-center">
                            <span className="w-1 h-1 rounded-full bg-purple-300" />
                          </div>

                          {/* Horizontal Animated Conduit Between Adjacent Cards */}
                          {!isLastInRow && (
                            <div
                              className="absolute top-1/2 -translate-y-1/2 w-12 z-20 pointer-events-none"
                              style={{ right: "-48px", height: "16px", marginTop: "-8px" }}
                            >
                              <svg className="w-12 h-4 overflow-visible" viewBox="0 0 48 16" fill="none">
                                {/* Base track */}
                                <line x1="0" y1="8" x2="48" y2="8" stroke="#1e1b4b" strokeWidth="3" strokeLinecap="round" />
                                {/* Animated dash beam */}
                                <line
                                  x1="0"
                                  y1="8"
                                  x2="48"
                                  y2="8"
                                  stroke="#818cf8"
                                  strokeWidth="2.5"
                                  strokeDasharray="8 8"
                                  className={isEvenRow ? "animate-flow-forward" : "animate-flow-reverse"}
                                  strokeLinecap="round"
                                />
                                {/* Laser photon traveling horizontally */}
                                <circle r="3.5" fill="#ffffff" filter="drop-shadow(0 0 6px #818cf8)">
                                  <animateMotion
                                    path={isEvenRow ? "M 0,8 L 48,8" : "M 48,8 L 0,8"}
                                    dur="1.5s"
                                    repeatCount="indefinite"
                                  />
                                </circle>
                              </svg>
                            </div>
                          )}

                          {/* The Milestone Card */}
                          <SpotlightCard className="h-full flex flex-col justify-between bg-neutral-900/90 border border-neutral-800 rounded-3xl hover:border-indigo-500/60 hover:shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-1.5 transition-all duration-300 relative group overflow-hidden ring-1 ring-white/5">
                            
                            {/* Card Top: Header Bar */}
                            <div className="p-5 pb-3">
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="px-2.5 py-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg text-[10px] font-black text-white font-mono shadow-sm">
                                    #{String(globalIndex + 1).padStart(2, "0")}
                                  </span>
                                  <span className="flex items-center gap-1 text-[11px] font-bold text-neutral-400">
                                    <Calendar className="w-3 h-3 text-indigo-400" />
                                    {formatDate(project.start_date)}
                                  </span>
                                </div>

                                <Badge variant={project.status === "completed" ? "completed" : project.status === "in_progress" ? "in_progress" : "planned"}>
                                  {getStatusIcon(project.status)}
                                  <span className="text-[10px] uppercase font-bold">{project.status.replace("_", " ")}</span>
                                </Badge>
                              </div>

                              <h3 className="text-base font-extrabold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                                <Link href={`/projects/${project.id}`} className="inline-flex items-center gap-1">
                                  <span>{project.title}</span>
                                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all text-indigo-400 shrink-0" />
                                </Link>
                              </h3>
                            </div>

                            {/* Card Middle: Aspect-Video Visual Banner (Guarantees Equal Height) */}
                            <div className="relative aspect-video w-full overflow-hidden bg-neutral-950 border-y border-neutral-800/80">
                              {coverImage ? (
                                <img
                                  src={coverImage}
                                  alt={project.title}
                                  loading="lazy"
                                  decoding="async"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              ) : (
                                <TechStackPlaceholder techStack={project.tech_stack} title={project.title} className="h-full" />
                              )}
                              <button
                                onClick={() => setQuickPreviewProject(project)}
                                className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-xl bg-black/70 hover:bg-black/90 text-white text-[10px] font-bold backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 border border-white/10"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Preview</span>
                              </button>
                            </div>

                            {/* Card Body & Footer */}
                            <div className="p-5 pt-3 space-y-3 flex-1 flex flex-col justify-between">
                              <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed">
                                {project.short_description}
                              </p>

                              <div className="space-y-3 pt-2 border-t border-neutral-800/70">
                                <div className="flex flex-wrap gap-1">
                                  {project.tech_stack.slice(0, 3).map((t) => (
                                    <span
                                      key={t}
                                      className="px-2 py-0.5 bg-neutral-950 text-indigo-300 rounded-md text-[10px] font-semibold border border-neutral-800"
                                    >
                                      {t}
                                    </span>
                                  ))}
                                  {project.tech_stack.length > 3 && (
                                    <span className="px-1.5 py-0.5 text-neutral-500 text-[10px] font-semibold self-center">
                                      +{project.tech_stack.length - 3}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center justify-between text-xs pt-1">
                                  <Link
                                    href={`/projects/${project.id}`}
                                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
                                  >
                                    <span>Milestone Details</span>
                                    <ChevronRight className="w-3 h-3" />
                                  </Link>

                                  <div className="flex items-center gap-2">
                                    {project.github_repo_url && (
                                      <a
                                        href={project.github_repo_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition-colors"
                                        title="View GitHub Repository"
                                      >
                                        <Github className="w-3.5 h-3.5" />
                                      </a>
                                    )}
                                    {project.live_url && (
                                      <a
                                        href={project.live_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/30 transition-colors"
                                        title="Open Live Demonstration"
                                      >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </SpotlightCard>
                        </div>
                      );
                    })}
                  </div>

                  {/* S-CURVE CURVED HAIRPIN LOOP CONNECTOR (Mathematically Aligned at Y = 50%) */}
                  {!isLastRow && (
                    <div
                      className={`absolute pointer-events-none z-30 ${
                        isEvenRow ? "right-0 translate-x-full" : "left-0 -translate-x-full"
                      }`}
                      style={{
                        top: "50%",
                        width: "96px",
                        height: `${DELTA_Y}px`,
                      }}
                    >
                      {isEvenRow ? (
                        /* Right side loop from Row N center down to Row N+1 center */
                        <svg
                          className="w-full h-full overflow-visible"
                          viewBox={`0 0 96 ${DELTA_Y}`}
                          fill="none"
                        >
                          <defs>
                            <linearGradient id={`grad-r-${rowIndex}`} x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#6366f1" />
                              <stop offset="50%" stopColor="#a855f7" />
                              <stop offset="100%" stopColor="#ec4899" />
                            </linearGradient>
                            <filter id={`glow-r-${rowIndex}`} x="-30%" y="-30%" width="160%" height="160%">
                              <feGaussianBlur stdDeviation="3.5" result="blur" />
                              <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                              </feMerge>
                            </filter>
                          </defs>

                          {/* Outer ambient glow path */}
                          <path
                            d={`M 0,0 C 64,0 96,64 96,160 L 96,${DELTA_Y - 160} C 96,${DELTA_Y - 64} 64,${DELTA_Y} 0,${DELTA_Y}`}
                            stroke={`url(#grad-r-${rowIndex})`}
                            strokeWidth="8"
                            strokeLinecap="round"
                            className="opacity-25 blur-sm"
                          />

                          {/* Base conduit pipe */}
                          <path
                            d={`M 0,0 C 64,0 96,64 96,160 L 96,${DELTA_Y - 160} C 96,${DELTA_Y - 64} 64,${DELTA_Y} 0,${DELTA_Y}`}
                            stroke="#1e1b4b"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                          />

                          {/* Flowing animated dash track */}
                          <path
                            d={`M 0,0 C 64,0 96,64 96,160 L 96,${DELTA_Y - 160} C 96,${DELTA_Y - 64} 64,${DELTA_Y} 0,${DELTA_Y}`}
                            stroke={`url(#grad-r-${rowIndex})`}
                            strokeWidth="3"
                            strokeDasharray="14 14"
                            className="animate-flow-forward"
                            strokeLinecap="round"
                          />

                          {/* Lead Laser Photon */}
                          <circle r="4.5" fill="#ffffff" filter={`url(#glow-r-${rowIndex})`}>
                            <animateMotion
                              path={`M 0,0 C 64,0 96,64 96,160 L 96,${DELTA_Y - 160} C 96,${DELTA_Y - 64} 64,${DELTA_Y} 0,${DELTA_Y}`}
                              dur="2.4s"
                              repeatCount="indefinite"
                            />
                          </circle>

                          {/* Trailing Energy Pulse */}
                          <circle r="2.5" fill="#a855f7" opacity="0.8">
                            <animateMotion
                              path={`M 0,0 C 64,0 96,64 96,160 L 96,${DELTA_Y - 160} C 96,${DELTA_Y - 64} 64,${DELTA_Y} 0,${DELTA_Y}`}
                              dur="2.4s"
                              begin="1.2s"
                              repeatCount="indefinite"
                            />
                          </circle>
                        </svg>
                      ) : (
                        /* Left side loop from Row N center down to Row N+1 center */
                        <svg
                          className="w-full h-full overflow-visible"
                          viewBox={`0 0 96 ${DELTA_Y}`}
                          fill="none"
                        >
                          <defs>
                            <linearGradient id={`grad-l-${rowIndex}`} x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#ec4899" />
                              <stop offset="50%" stopColor="#a855f7" />
                              <stop offset="100%" stopColor="#6366f1" />
                            </linearGradient>
                            <filter id={`glow-l-${rowIndex}`} x="-30%" y="-30%" width="160%" height="160%">
                              <feGaussianBlur stdDeviation="3.5" result="blur" />
                              <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                              </feMerge>
                            </filter>
                          </defs>

                          {/* Outer ambient glow path */}
                          <path
                            d={`M 96,0 C 32,0 0,64 0,160 L 0,${DELTA_Y - 160} C 0,${DELTA_Y - 64} 32,${DELTA_Y} 96,${DELTA_Y}`}
                            stroke={`url(#grad-l-${rowIndex})`}
                            strokeWidth="8"
                            strokeLinecap="round"
                            className="opacity-25 blur-sm"
                          />

                          {/* Base conduit pipe */}
                          <path
                            d={`M 96,0 C 32,0 0,64 0,160 L 0,${DELTA_Y - 160} C 0,${DELTA_Y - 64} 32,${DELTA_Y} 96,${DELTA_Y}`}
                            stroke="#1e1b4b"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                          />

                          {/* Flowing animated dash track */}
                          <path
                            d={`M 96,0 C 32,0 0,64 0,160 L 0,${DELTA_Y - 160} C 0,${DELTA_Y - 64} 32,${DELTA_Y} 96,${DELTA_Y}`}
                            stroke={`url(#grad-l-${rowIndex})`}
                            strokeWidth="3"
                            strokeDasharray="14 14"
                            className="animate-flow-forward"
                            strokeLinecap="round"
                          />

                          {/* Lead Laser Photon */}
                          <circle r="4.5" fill="#ffffff" filter={`url(#glow-l-${rowIndex})`}>
                            <animateMotion
                              path={`M 96,0 C 32,0 0,64 0,160 L 0,${DELTA_Y - 160} C 0,${DELTA_Y - 64} 32,${DELTA_Y} 96,${DELTA_Y}`}
                              dur="2.4s"
                              repeatCount="indefinite"
                            />
                          </circle>

                          {/* Trailing Energy Pulse */}
                          <circle r="2.5" fill="#6366f1" opacity="0.8">
                            <animateMotion
                              path={`M 96,0 C 32,0 0,64 0,160 L 0,${DELTA_Y - 160} C 0,${DELTA_Y - 64} 32,${DELTA_Y} 96,${DELTA_Y}`}
                              dur="2.4s"
                              begin="1.2s"
                              repeatCount="indefinite"
                            />
                          </circle>
                        </svg>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Tablet & Mobile Adaptive Serpentine Column (< 1024px) */}
          <div className="lg:hidden relative pl-6 sm:pl-8 space-y-10">
            {/* Continuous vertical illuminated bus */}
            <div className="absolute left-3 top-4 bottom-4 w-1 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 rounded-full z-0 shadow-[0_0_12px_rgba(99,102,241,0.5)]" />

            {displayedProjects.map((project, index) => {
              const coverImage = getCoverImage(project);

              return (
                <div key={project.id} className="relative">
                  {/* Glowing Node on the circuit line */}
                  <div className="absolute -left-[23px] sm:-left-[27px] top-6 w-5 h-5 rounded-full bg-neutral-950 border-2 border-indigo-400 z-10 shadow-lg shadow-indigo-500/50 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                  </div>

                  <SpotlightCard className="bg-neutral-900/90 border border-neutral-800 rounded-3xl overflow-hidden hover:border-indigo-500/50 transition-all shadow-xl">
                    <div className="p-5 pb-3 flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg text-[10px] font-black text-white font-mono">
                        #{String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="text-xs font-bold text-neutral-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-indigo-400" />
                        {formatDate(project.start_date)}
                      </span>
                      <Badge variant={project.status === "completed" ? "completed" : project.status === "in_progress" ? "in_progress" : "planned"}>
                        <span className="text-[10px] uppercase font-bold">{project.status.replace("_", " ")}</span>
                      </Badge>
                    </div>

                    <div className="relative aspect-video w-full overflow-hidden bg-neutral-950 border-y border-neutral-800">
                      {coverImage ? (
                        <img
                          src={coverImage}
                          alt={project.title}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <TechStackPlaceholder techStack={project.tech_stack} title={project.title} className="h-full" />
                      )}
                    </div>

                    <div className="p-5 space-y-2">
                      <h3 className="text-base font-extrabold text-white">
                        <Link href={`/projects/${project.id}`} className="hover:text-indigo-400 transition-colors">
                          {project.title}
                        </Link>
                      </h3>
                      <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed">
                        {project.short_description}
                      </p>

                      <div className="flex flex-wrap gap-1 pt-2">
                        {project.tech_stack.slice(0, 3).map((t) => (
                          <span key={t} className="px-2 py-0.5 bg-neutral-950 text-indigo-300 rounded text-[10px] font-semibold border border-neutral-800">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </SpotlightCard>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: UNIFORM MILESTONE MATRIX (Grid View) */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          {displayedProjects.map((project, idx) => {
            const coverImage = getCoverImage(project);
            return (
              <SpotlightCard
                key={project.id}
                className="flex flex-col justify-between bg-neutral-900/90 border border-neutral-800 rounded-3xl hover:border-indigo-500/60 hover:shadow-2xl transition-all duration-300 overflow-hidden group ring-1 ring-white/5"
              >
                <div className="p-5 pb-3 flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg text-[10px] font-black text-white font-mono">
                    #{String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="text-xs font-bold text-neutral-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-indigo-400" />
                    {formatDate(project.start_date)}
                  </span>
                  <Badge variant={project.status === "completed" ? "completed" : project.status === "in_progress" ? "in_progress" : "planned"}>
                    <span className="text-[10px] uppercase font-bold">{project.status.replace("_", " ")}</span>
                  </Badge>
                </div>

                <div className="relative aspect-video w-full overflow-hidden bg-neutral-950 border-y border-neutral-800">
                  {coverImage ? (
                    <img
                      src={coverImage}
                      alt={project.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <TechStackPlaceholder techStack={project.tech_stack} title={project.title} className="h-full" />
                  )}
                </div>

                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                      <Link href={`/projects/${project.id}`}>{project.title}</Link>
                    </h3>
                    <p className="text-xs text-neutral-300 line-clamp-2 mt-1 leading-relaxed">
                      {project.short_description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {project.tech_stack.slice(0, 2).map((t) => (
                        <span key={t} className="px-2 py-0.5 bg-neutral-950 text-indigo-300 rounded text-[10px] border border-neutral-800 font-semibold">
                          {t}
                        </span>
                      ))}
                    </div>
                    <Link href={`/projects/${project.id}`} className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                      <span>Details</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      )}

      {/* VIEW 3: LINEAR CHRONOLOGICAL TREE */}
      {viewMode === "linear" && (
        <div className="max-w-3xl mx-auto space-y-6 text-left relative pl-8 border-l-2 border-indigo-500/40">
          {displayedProjects.map((project, idx) => (
            <div key={project.id} className="relative group">
              <div className="absolute -left-[41px] top-4 w-4 h-4 rounded-full bg-neutral-950 border-2 border-indigo-400 group-hover:border-purple-400 transition-colors" />
              <div className="p-5 bg-neutral-900/90 border border-neutral-800 rounded-2xl hover:border-indigo-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-indigo-400 font-bold">#{String(idx + 1).padStart(2, "0")}</span>
                    <span className="text-xs text-neutral-400">{formatDate(project.start_date)}</span>
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
                    <Link href={`/projects/${project.id}`}>{project.title}</Link>
                  </h4>
                  <p className="text-xs text-neutral-300 line-clamp-1">{project.short_description}</p>
                </div>
                <Link
                  href={`/projects/${project.id}`}
                  className="px-4 py-2 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs font-bold text-neutral-300 hover:text-white shrink-0 self-start sm:self-center transition-colors"
                >
                  View Milestone
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Preview Modal */}
      {quickPreviewProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative text-left">
            <button
              onClick={() => setQuickPreviewProject(null)}
              className="absolute right-6 top-6 p-2 bg-neutral-800 hover:bg-neutral-700 rounded-full text-neutral-400 hover:text-white transition-colors"
            >
              ✕
            </button>

            <div className="space-y-2">
              <Badge variant={quickPreviewProject.status === "completed" ? "completed" : "in_progress"}>
                {quickPreviewProject.status.replace("_", " ").toUpperCase()}
              </Badge>
              <h2 className="text-2xl font-black text-white">{quickPreviewProject.title}</h2>
              <p className="text-xs text-neutral-400 flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>{formatDate(quickPreviewProject.start_date)} — {formatDate(quickPreviewProject.end_date)}</span>
              </p>
            </div>

            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800">
              {getCoverImage(quickPreviewProject) ? (
                <img
                  src={getCoverImage(quickPreviewProject)!}
                  alt={quickPreviewProject.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <TechStackPlaceholder techStack={quickPreviewProject.tech_stack} title={quickPreviewProject.title} className="h-full" />
              )}
            </div>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              {quickPreviewProject.short_description}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
              <div className="flex flex-wrap gap-1">
                {quickPreviewProject.tech_stack.map((t) => (
                  <span key={t} className="px-2 py-0.5 bg-neutral-950 text-indigo-300 rounded text-[10px] border border-neutral-800 font-semibold">
                    {t}
                  </span>
                ))}
              </div>

              <Link
                href={`/projects/${quickPreviewProject.id}`}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/25 transition-all"
              >
                Go to Project Page
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Pagination / Load More */}
      {filteredProjects.length > visibleCount && (
        <div className="text-center pt-6">
          <button
            onClick={() => setVisibleCount((prev) => prev + 18)}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl text-xs font-extrabold shadow-xl shadow-indigo-500/25 transition-all hover:scale-105"
          >
            <span>Load More Milestones ({filteredProjects.length - visibleCount} remaining)</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
