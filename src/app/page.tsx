"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Code2, FolderKanban, Users2, Sparkles, FileText, ArrowUpRight } from "lucide-react";
import { ProjectCard } from "@/components/project-card";
import { DeveloperCard } from "@/components/developer-card";
import siteConfig from "../../data/site-config.json";
import developersData from "../../data/developers.json";
import projectsData from "../../data/projects.json";

export default function HomePage() {
  const featuredProjects = projectsData.filter((p) => p.featured);
  const featuredDevelopers = developersData.filter((d) => d.featured);

  // Extract all unique technologies across all projects
  const uniqueTechs = Array.from(
    new Set(projectsData.flatMap((p) => p.tech_stack))
  );

  return (
    <div className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-white selection:bg-indigo-500/30">
      
      {/* Glow Backdrop Accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] -z-10 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.08),transparent_50%)] pointer-events-none" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full text-neutral-600 dark:text-neutral-400 text-xs font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>Introducing Git-based Showcase Platform</span>
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight bg-gradient-to-b from-neutral-900 to-neutral-500 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent max-w-4xl mx-auto leading-tight">
          {siteConfig.hero_headline}
        </h1>
        
        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto mt-6 leading-relaxed">
          {siteConfig.hero_description}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
          <Link
            href="/projects"
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold rounded-lg shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/20 transition-all"
          >
            <span>Explore Projects</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          
          {siteConfig.resume_url && (
            <a
              href={siteConfig.resume_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-neutral-100 border border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 dark:hover:bg-neutral-850 text-sm font-semibold rounded-lg transition-all text-neutral-700 dark:text-neutral-300 dark:hover:text-white"
            >
              <FileText className="w-4 h-4" />
              <span>View Resume</span>
            </a>
          )}
        </div>
      </section>

      {/* Statistics Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-neutral-900/40 border border-neutral-850 p-6 rounded-xl backdrop-blur-md">
            <div className="flex items-center gap-3 text-neutral-400 mb-2">
              <FolderKanban className="w-5 h-5 text-indigo-400" />
              <span className="text-sm font-medium">Showcase Projects</span>
            </div>
            <p className="text-3xl font-bold text-white">{projectsData.length}</p>
          </div>
          <div className="bg-neutral-900/40 border border-neutral-850 p-6 rounded-xl backdrop-blur-md">
            <div className="flex items-center gap-3 text-neutral-400 mb-2">
              <Users2 className="w-5 h-5 text-indigo-400" />
              <span className="text-sm font-medium">Active Developers</span>
            </div>
            <p className="text-3xl font-bold text-white">{developersData.length}</p>
          </div>
          <div className="bg-neutral-900/40 border border-neutral-850 p-6 rounded-xl backdrop-blur-md">
            <div className="flex items-center gap-3 text-neutral-400 mb-2">
              <Code2 className="w-5 h-5 text-indigo-400" />
              <span className="text-sm font-medium">Technologies catalogued</span>
            </div>
            <p className="text-3xl font-bold text-white">{uniqueTechs.length}</p>
          </div>
        </div>
      </section>

      {/* Featured Projects Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        <div className="flex items-end justify-between border-b border-neutral-900 pb-4">
          <div>
            <h2 className="text-2xl font-extrabold text-white">Featured Work</h2>
            <p className="text-sm text-neutral-500 mt-1">Hand-picked engineering projects with full source and previews.</p>
          </div>
          <Link
            href="/projects"
            className="flex items-center gap-1.5 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <span>All Projects</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>

      {/* Featured Developers Section */}
      {featuredDevelopers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
          <div className="flex items-end justify-between border-b border-neutral-900 pb-4">
            <div>
              <h2 className="text-2xl font-extrabold text-white">Key Contributors</h2>
              <p className="text-sm text-neutral-500 mt-1">The talented engineers designing and maintaining our products.</p>
            </div>
            <Link
              href="/developers"
              className="flex items-center gap-1.5 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <span>Directory</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredDevelopers.map((dev) => (
              <DeveloperCard key={dev.id} developer={dev} />
            ))}
          </div>
        </section>
      )}

      {/* Footer Call-to-action */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center border-t border-neutral-200 dark:border-neutral-900">
        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">Want to collaborate?</h3>
        <p className="text-neutral-600 dark:text-neutral-400 max-w-md mx-auto text-sm mb-6">
          Reach out if you are interested in working together, building something new, or discussing technical topics.
        </p>
        <a
          href={`mailto:${siteConfig.contact_email}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-850 text-sm font-semibold rounded-lg transition-colors border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-200 dark:hover:text-white"
        >
          <span>Contact Me</span>
          <ArrowUpRight className="w-4 h-4" />
        </a>
      </section>

    </div>
  );
}
