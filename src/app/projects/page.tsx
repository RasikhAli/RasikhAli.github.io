"use client";

import React, { useState, useMemo } from "react";
import { Search, SlidersHorizontal, RefreshCw, AlertCircle } from "lucide-react";
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
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  // Extract all unique technologies
  const allTechStack = useMemo(() => {
    return Array.from(new Set(typedProjects.flatMap((p) => p.tech_stack))).sort();
  }, []);

  // Extract all years from projects
  const allYears = useMemo(() => {
    const years = typedProjects
      .map((p) => {
        if (p.start_date) {
          return new Date(p.start_date).getFullYear().toString();
        }
        return "";
      })
      .filter((y) => y !== "");
    return Array.from(new Set(years)).sort((a, b) => b.localeCompare(a));
  }, []);

  // Filter projects
  const filteredProjects = useMemo(() => {
    return typedProjects
      .filter((project) => {
        // Search Query
        const matchesQuery =
          project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.short_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.description.toLowerCase().includes(searchQuery.toLowerCase());

        // Developer Filter
        const matchesDev = selectedDeveloper
          ? project.developer_ids.includes(selectedDeveloper)
          : true;

        // Tech Filter
        const matchesTech = selectedTech
          ? project.tech_stack.includes(selectedTech)
          : true;

        // Status Filter
        const matchesStatus = selectedStatus
          ? project.status === selectedStatus
          : true;

        // Year Filter
        const matchesYear = selectedYear
          ? project.start_date && new Date(project.start_date).getFullYear().toString() === selectedYear
          : true;

        return matchesQuery && matchesDev && matchesTech && matchesStatus && matchesYear;
      })
      .sort((a, b) => {
        // Sorting
        if (sortBy === "newest") {
          return new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime();
        }
        if (sortBy === "oldest") {
          return new Date(a.created_at || "").getTime() - new Date(b.created_at || "").getTime();
        }
        if (sortBy === "alpha") {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [searchQuery, selectedDeveloper, selectedTech, selectedStatus, selectedYear, sortBy]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedDeveloper("");
    setSelectedTech("");
    setSelectedStatus("");
    setSelectedYear("");
    setSortBy("newest");
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-white py-16 selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header Title */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-neutral-900 to-neutral-500 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent">
            Project Showcase
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Explore our engineering milestones, side projects, and open-source contributions.
          </p>
        </div>

        {/* Search, Filter, Sort Controls */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Search by title, stack, description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 rounded-lg text-sm text-neutral-900 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
            
            {/* Toggle Filters & Sort */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border transition-all ${
                  showFilters
                    ? "bg-indigo-600/10 border-indigo-500 text-indigo-600 dark:text-indigo-400"
                    : "bg-neutral-100 border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 dark:hover:text-white"
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 bg-white border border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 rounded-lg text-sm text-neutral-900 dark:text-neutral-300 focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="newest">Sort: Newest</option>
                <option value="oldest">Sort: Oldest</option>
                <option value="alpha">Sort: Alphabetical</option>
              </select>
            </div>
          </div>

          {/* Expanded Filter Panel */}
          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-white/90 border border-neutral-200 dark:bg-neutral-900/40 dark:border-neutral-850 rounded-xl backdrop-blur-md animate-in slide-in-from-top-4 duration-200">
              {/* Developer Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-500 dark:text-neutral-450 uppercase tracking-wider">Developer</label>
                <select
                  value={selectedDeveloper}
                  onChange={(e) => setSelectedDeveloper(e.target.value)}
                  className="w-full p-2 bg-neutral-900 border border-neutral-800 rounded-md text-xs text-neutral-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">All Developers</option>
                  {developersData.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Technology Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-450 uppercase tracking-wider">Technology</label>
                <select
                  value={selectedTech}
                  onChange={(e) => setSelectedTech(e.target.value)}
                  className="w-full p-2 bg-neutral-900 border border-neutral-800 rounded-md text-xs text-neutral-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">All Tech</option>
                  {allTechStack.map((tech) => (
                    <option key={tech} value={tech}>
                      {tech}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-450 uppercase tracking-wider">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full p-2 bg-neutral-900 border border-neutral-800 rounded-md text-xs text-neutral-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="planned">Planned</option>
                </select>
              </div>

              {/* Year Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-450 uppercase tracking-wider">Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full p-2 bg-neutral-900 border border-neutral-800 rounded-md text-xs text-neutral-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">All Years</option>
                  {allYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset Button */}
              <div className="col-span-2 md:col-span-4 flex justify-end">
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-400 dark:hover:text-white transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset Filters</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Project Showcase Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-neutral-200 dark:border-neutral-850 rounded-xl bg-neutral-100/70 dark:bg-neutral-900/10">
            <AlertCircle className="w-10 h-10 text-neutral-500 mb-4" />
            <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-350">No projects found</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-500 mt-1 max-w-sm text-center">
              Try adjusting your text search, resetting filters, or refining your query tags.
            </p>
            <button
              onClick={resetFilters}
              className="mt-6 px-4 py-2 bg-neutral-100 border border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 text-sm font-semibold rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-850 text-neutral-700 dark:text-neutral-300 dark:hover:text-white transition-all"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
