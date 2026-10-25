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
  Sparkles,
  ExternalLink,
  Layers,
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
    <div className="space-y-10">
      {/* Control, Search & View Switcher Bar */}
      <div className="p-5 sm:p-6 bg-neutral-900/90 border border-neutral-800 rounded-3xl backdrop-blur-2xl shadow-2xl space-y-4 text-left">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search projects, domains, or tech stack (e.g. Python, AI, Next.js)..."
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
              title="Serpentine S-Curve Pipeline View"
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
              title="Milestone Grid View"
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
              title="Linear Milestone Tree View"
            >
              <GitCommit className="w-3.5 h-3.5" />
              <span>Linear Tree</span>
            </button>
          </div>
        </div>

        {/* Filter Pills row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-800/80">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 mr-1">Era:</span>
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
                {yr === "all" ? "All Eras" : yr}
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

        <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Displaying <strong className="text-white">{displayedProjects.length}</strong> of {filteredProjects.length} engineering milestones
          </span>
          <span className="font-mono text-[11px] text-indigo-400">
            {viewMode === "serpentine" ? "S-Curve Serpentine Circuit" : viewMode === "grid" ? "Uniform Milestone Matrix" : "Linear Sequential Tree"}
          </span>
        </div>
      </div>

      {/* VIEW 1: SERPENTINE S-CURVE CIRCUIT PIPELINE (Desktop: 3 per row, Tablet/Mobile: Adaptive) */}
      {viewMode === "serpentine" && (
        <div className="space-y-16 relative">
          
          {/* Desktop Serpentine Grid */}
          <div className="hidden lg:block space-y-20">
            {rows.map((rowProjects, rowIndex) => {
              const isEvenRow = rowIndex % 2 === 0;
              const isLastRow = rowIndex === rows.length - 1;
              const displayOrder = isEvenRow ? rowProjects : [...rowProjects].reverse();

              return (
                <div key={rowIndex} className="relative">
                  
                  {/* Era Badge if first row of a year */}
                  {rowIndex === 0 && (
                    <div className="flex items-center gap-3 mb-6">
                      <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold">
                        <Zap className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Active Production Pipeline</span>
                      </div>
                      <div className="h-px flex-1 bg-gradient-to-r from-indigo-500/30 to-transparent" />
                    </div>
                  )}

                  {/* 3 Cards Container with horizontal continuous pipeline rail */}
                  <div className="grid grid-cols-3 gap-10 items-stretch relative">
                    {displayOrder.map((project, colIndex) => {
                      const globalIndex = rowIndex * 3 + (isEvenRow ? colIndex : (rowProjects.length - 1 - colIndex));
                      const isLastInRow = colIndex === displayOrder.length - 1;
                      const coverImage = getCoverImage(project);

                      return (
                        <div key={project.id} className="relative flex flex-col h-full">
                          
                          {/* Inter-Card Pipeline Rail Connector */}
                          {!isLastInRow && (
                            <div
                              className={`absolute top-1/2 ${
                                isEvenRow ? "-right-10" : "-left-10"
                              } -translate-y-1/2 w-10 h-1 z-30 pointer-events-none flex items-center justify-center`}
                            >
                              <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
                              </div>
                              {/* Pulse energy particle */}
                              <span
                                className={`absolute top-1/2 -translate-y-1/2 ${
                                  isEvenRow ? "right-1" : "left-1"
                                } w-2 h-2 rounded-full bg-white shadow-[0_0_10px_#818cf8] animate-pulse`}
                              />
                            </div>
                          )}

                          {/* Full Uniform Milestone Card */}
                          <SpotlightCard className="flex-1 flex flex-col justify-between bg-neutral-900/90 border border-neutral-800 rounded-3xl hover:border-indigo-500/60 hover:shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-1.5 transition-all duration-300 relative group overflow-hidden ring-1 ring-white/5">
                            
                            {/* Card Top: Header Bar */}
                            <div className="p-5 pb-3">
                              <div className="flex items-center justify-between gap-2 mb-3">
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

                              {/* Card Title */}
                              <h3 className="text-base font-extrabold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                                <Link href={`/projects/${project.id}`} className="inline-flex items-center gap-1">
                                  <span>{project.title}</span>
                                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all text-indigo-400 shrink-0" />
                                </Link>
                              </h3>
                            </div>

                            {/* Card Middle: Uniform Aspect-Video Visual Banner (Guarantees Equal Height) */}
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
                                <TechStackPlaceholder
                                  techStack={project.tech_stack}
                                  title={project.title}
                                  className="h-full"
                                />
                              )}
                              {/* Hover quick preview button overlay */}
                              <button
                                onClick={() => setQuickPreviewProject(project)}
                                className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-xl bg-black/70 hover:bg-black/90 text-white text-[10px] font-bold backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 border border-white/10"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Preview</span>
                              </button>
                            </div>

                            {/* Card Body & Footer */}
                            <div className="p-5 pt-3.5 space-y-3 flex-1 flex flex-col justify-between">
                              <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed">
                                {project.short_description}
                              </p>

                              {/* Tech Stack Pills */}
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

                                {/* Direct Action Links */}
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

                  {/* S-CURVE CURVED HAIRPIN LOOP CONNECTOR BETWEEN ROWS */}
                  {!isLastRow && (
                    <div
                      className={`absolute -bottom-20 ${
                        isEvenRow ? "-right-12" : "-left-12"
                      } w-24 h-24 z-20 pointer-events-none flex items-center justify-center`}
                    >
                      {isEvenRow ? (
                        /* Right side S-turn loop */
                        <svg className="w-24 h-24 overflow-visible" viewBox="0 0 96 96" fill="none">
                          <defs>
                            <linearGradient id={`sg-r-${rowIndex}`} x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#6366f1" />
                              <stop offset="50%" stopColor="#a855f7" />
                              <stop offset="100%" stopColor="#ec4899" />
                            </linearGradient>
                          </defs>
                          {/* Ambient glow tube */}
                          <path
                            d="M 0,0 C 70,0 70,96 0,96"
                            stroke={`url(#sg-r-${rowIndex})`}
                            strokeWidth="8"
                            strokeLinecap="round"
                            className="opacity-20 blur-sm"
                          />
                          {/* Core high-def energy cable */}
                          <path
                            d="M 0,0 C 70,0 70,96 0,96"
                            stroke={`url(#sg-r-${rowIndex})`}
                            strokeWidth="3.5"
                            strokeLinecap="round"
                          />
                          {/* Animated traveling photon */}
                          <circle cx="48" cy="48" r="4" fill="#ffffff" className="animate-ping" />
                          <circle cx="48" cy="48" r="3" fill="#a855f7" />
                        </svg>
                      ) : (
                        /* Left side S-turn loop */
                        <svg className="w-24 h-24 overflow-visible" viewBox="0 0 96 96" fill="none">
                          <defs>
                            <linearGradient id={`sg-l-${rowIndex}`} x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#ec4899" />
                              <stop offset="50%" stopColor="#a855f7" />
                              <stop offset="100%" stopColor="#6366f1" />
                            </linearGradient>
                          </defs>
                          {/* Ambient glow tube */}
                          <path
                            d="M 96,0 C 26,0 26,96 96,96"
                            stroke={`url(#sg-l-${rowIndex})`}
                            strokeWidth="8"
                            strokeLinecap="round"
                            className="opacity-20 blur-sm"
                          />
                          {/* Core high-def energy cable */}
                          <path
                            d="M 96,0 C 26,0 26,96 96,96"
                            stroke={`url(#sg-l-${rowIndex})`}
                            strokeWidth="3.5"
                            strokeLinecap="round"
                          />
                          {/* Animated traveling photon */}
                          <circle cx="48" cy="48" r="4" fill="#ffffff" className="animate-ping" />
                          <circle cx="48" cy="48" r="3" fill="#a855f7" />
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

                  {/* Card */}
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
                        <TechStackPlaceholder
                          techStack={project.tech_stack}
                          title={project.title}
                          className="h-full"
                        />
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

      {/* Quick Preview Modal if user clicks 'Preview' */}
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
