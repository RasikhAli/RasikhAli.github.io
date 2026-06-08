"use client";

import React, { useState, useMemo } from "react";
import { Search, SlidersHorizontal, RefreshCw, AlertCircle, FolderKanban } from "lucide-react";
import { ProjectCard } from "@/components/project-card";
import projectsData from "@data/projects.json";
import developersData from "@data/developers.json";
import { Project } from "@/lib/schemas";
const typedProjects = projectsData as Project[];

export default function ProjectsGridPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDeveloper, setSelectedDeveloper] = useState("");
  const [selectedTech, setSelectedTech] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [sortBy, setSortBy] = useState("start_date_desc");
  const [showFilters, setShowFilters] = useState(false);

  const allTechStack = useMemo(() => {
    return Array.from(new Set(typedProjects.flatMap((p) => p.tech_stack))).sort();
  }, []);

  const allYears = useMemo(() => {
    const years = typedProjects
      .map((p) => (p.start_date ? new Date(p.start_date).getFullYear().toString() : ""))
      .filter((y) => y !== "");
    return Array.from(new Set(years)).sort((a, b) => b.localeCompare(a));
  }, []);

  const filteredProjects = useMemo(() => {
    return typedProjects
      .filter((project) => {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          !q ||
          project.title.toLowerCase().includes(q) ||
          project.short_description.toLowerCase().includes(q) ||
          project.description.toLowerCase().includes(q);
        const matchesDev = !selectedDeveloper || project.developer_ids.includes(selectedDeveloper);
        const matchesTech = !selectedTech || project.tech_stack.includes(selectedTech);
        const matchesStatus = !selectedStatus || project.status === selectedStatus;
        const matchesYear =
          !selectedYear ||
          (project.start_date && new Date(project.start_date).getFullYear().toString() === selectedYear);
        return matchesQuery && matchesDev && matchesTech && matchesStatus && matchesYear;
      })
      .sort((a, b) => {
        if (sortBy === "start_date_desc") {
          if (!a.start_date) return 1;
          if (!b.start_date) return -1;
          return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
        }
        if (sortBy === "start_date_asc") {
          if (!a.start_date) return 1;
          if (!b.start_date) return -1;
          return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
        }
        if (sortBy === "alpha") return a.title.localeCompare(b.title);
        return 0;
      });
  }, [searchQuery, selectedDeveloper, selectedTech, selectedStatus, selectedYear, sortBy]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedDeveloper("");
    setSelectedTech("");
    setSelectedStatus("");
    setSelectedYear("");
    setSortBy("start_date_desc");
  };

  const hasActiveFilters = searchQuery || selectedDeveloper || selectedTech || selectedStatus || selectedYear;

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white selection:bg-indigo-500/30">
      <div className="fixed top-0 left-0 w-full h-[600px] -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.08),transparent)] pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-500/10 rounded-xl">
              <FolderKanban className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-neutral-900 to-neutral-500 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent">
              Project Showcase
            </h1>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 ml-[3.25rem]">
            Explore our engineering milestones, side projects, and open-source contributions.
          </p>
        </div>

        {/* Controls */}
        <div className="mb-10 space-y-4">
          {/* Search row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm text-neutral-900 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold border transition-all ${
                  showFilters || hasActiveFilters
                    ? "bg-indigo-600/10 border-indigo-500 text-indigo-600 dark:text-indigo-400"
                    : "bg-white dark:bg-neutral-900/60 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-indigo-400 dark:hover:border-indigo-500"
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
                {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
              </button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm text-neutral-900 dark:text-neutral-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              >
                <option value="start_date_desc">Newest First</option>
                <option value="start_date_asc">Oldest First</option>
                <option value="alpha">Alphabetical</option>
              </select>
            </div>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="bg-white dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Developer</label>
                  <select
                    value={selectedDeveloper}
                    onChange={(e) => setSelectedDeveloper(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs text-neutral-900 dark:text-neutral-300 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">All</option>
                    {developersData.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Technology</label>
                  <select
                    value={selectedTech}
                    onChange={(e) => setSelectedTech(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs text-neutral-900 dark:text-neutral-300 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">All</option>
                    {allTechStack.map((tech) => (
                      <option key={tech} value={tech}>{tech}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs text-neutral-900 dark:text-neutral-300 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">All</option>
                    <option value="completed">Completed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="planned">Planned</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Year</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs text-neutral-900 dark:text-neutral-300 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">All</option>
                    {allYears.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
              {hasActiveFilters && (
                <div className="flex justify-end pt-2 border-t border-neutral-200 dark:border-neutral-800">
                  <button
                    onClick={resetFilters}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-700 dark:hover:text-white transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div key={project.id}>
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl bg-neutral-50 dark:bg-neutral-900/20">
            <AlertCircle className="w-14 h-14 text-neutral-300 dark:text-neutral-600 mb-5" />
            <h3 className="text-lg font-bold text-neutral-700 dark:text-neutral-300">No projects found</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-1 max-w-sm text-center">
              Try adjusting your search or resetting filters to discover projects.
            </p>
            <button
              onClick={resetFilters}
              className="mt-6 px-5 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Results count */}
        {filteredProjects.length > 0 && (
          <p className="mt-8 text-center text-xs text-neutral-400 dark:text-neutral-500">
            Showing {filteredProjects.length} of {typedProjects.length} projects
          </p>
        )}
      </div>
    </div>
  );
}