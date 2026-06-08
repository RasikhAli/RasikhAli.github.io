"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, FolderKanban, Users2, Code2, Mail, ExternalLink, Copy, Check, ChevronDown } from "lucide-react";
import { Github, Linkedin, Twitter } from "@/components/brand-icons";
import { ProjectCard } from "@/components/project-card";
import { DeveloperCard } from "@/components/developer-card";
import siteConfig from "../../data/site-config.json";
import developersData from "../../data/developers.json";
import projectsData from "../../data/projects.json";

export default function HomePage() {
  const [copied, setCopied] = useState(false);
  const featuredProjects = useMemo(() => {
    return [...projectsData]
      .filter((p) => p.featured)
      .sort((a, b) => {
        if (!a.start_date) return 1;
        if (!b.start_date) return -1;
        return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
      });
  }, []);
  const featuredDevelopers = developersData.filter((d) => d.featured);
  const uniqueTechs = Array.from(new Set(projectsData.flatMap((p) => p.tech_stack)));
  const owner = developersData.find((d) => d.name === siteConfig.portfolio_owner_name) || developersData[0];

  const handleCopyEmail = () => {
    if (siteConfig.contact_email) {
      navigator.clipboard.writeText(siteConfig.contact_email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const socialLinks = [
    { href: siteConfig.github_url, icon: Github, label: "GitHub", show: !!siteConfig.github_url },
    { href: siteConfig.linkedin_url, icon: Linkedin, label: "LinkedIn", show: !!siteConfig.linkedin_url },
    { href: siteConfig.twitter_url, icon: Twitter, label: "Twitter", show: !!siteConfig.twitter_url },
    { href: `mailto:${siteConfig.contact_email}`, icon: Mail, label: "Email", show: !!siteConfig.contact_email },
  ].filter((l) => l.show);

  const typingLines = siteConfig.profile_typing_lines || [];
  const displayName = owner?.name || siteConfig.portfolio_owner_name;

  return (
    <div className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-white selection:bg-indigo-500/30">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] -z-10 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.08),transparent_50%)] pointer-events-none" />

      {/* Profile Header */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center">
        {owner?.avatar && (
          <img
            src={owner.avatar}
            alt={displayName}
            className="w-28 h-28 rounded-full object-cover ring-4 ring-neutral-200 dark:ring-neutral-800 shadow-xl mx-auto mb-6"
          />
        )}

        <h1 className="text-4xl sm:text-5xl font-black tracking-tight bg-gradient-to-b from-neutral-900 to-neutral-500 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent">
          {displayName}
        </h1>

        {owner?.designation && (
          <p className="text-base sm:text-lg text-indigo-600 dark:text-indigo-400 font-semibold mt-3">
            {owner.designation}
          </p>
        )}

        {siteConfig.profile_bio && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-4 max-w-2xl mx-auto leading-relaxed">
            {siteConfig.profile_bio}
          </p>
        )}

        {typingLines.length > 0 && (
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
            </span>
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{typingLines[0]}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-neutral-100 border border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 rounded-lg text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
            >
              <link.icon className="w-4 h-4" />
              <span>{link.label}</span>
            </a>
          ))}
          {siteConfig.resume_url && (
            <a
              href={siteConfig.resume_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-neutral-100 border border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 rounded-lg text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Resume</span>
            </a>
          )}
          {siteConfig.contact_email && (
            <button
              onClick={handleCopyEmail}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-100 border border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 rounded-lg text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Mail className="w-4 h-4" />}
              <span>{copied ? "Copied!" : "Copy Email"}</span>
            </button>
          )}
        </div>
      </header>

      {/* Stats Row */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white/90 border border-neutral-200 dark:bg-neutral-900/40 dark:border-neutral-850 p-5 rounded-xl backdrop-blur-md text-center">
            <div className="flex items-center justify-center gap-2 text-neutral-400 mb-2">
              <FolderKanban className="w-5 h-5 text-indigo-400" />
            </div>
            <p className="text-3xl font-bold text-neutral-900 dark:text-white">{projectsData.length}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Projects</p>
          </div>
          <div className="bg-white/90 border border-neutral-200 dark:bg-neutral-900/40 dark:border-neutral-850 p-5 rounded-xl backdrop-blur-md text-center">
            <div className="flex items-center justify-center gap-2 text-neutral-400 mb-2">
              <Code2 className="w-5 h-5 text-indigo-400" />
            </div>
            <p className="text-3xl font-bold text-neutral-900 dark:text-white">{uniqueTechs.length}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Technologies</p>
          </div>
          <div className="bg-white/90 border border-neutral-200 dark:bg-neutral-900/40 dark:border-neutral-850 p-5 rounded-xl backdrop-blur-md text-center">
            <div className="flex items-center justify-center gap-2 text-neutral-400 mb-2">
              <Users2 className="w-5 h-5 text-indigo-400" />
            </div>
            <p className="text-3xl font-bold text-neutral-900 dark:text-white">{developersData.length}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Contributors</p>
          </div>
          <div className="bg-white/90 border border-neutral-200 dark:bg-neutral-900/40 dark:border-neutral-850 p-5 rounded-xl backdrop-blur-md text-center">
            <div className="flex items-center justify-center gap-2 text-neutral-400 mb-2">
              <Github className="w-5 h-5 text-indigo-400" />
            </div>
            <p className="text-3xl font-bold text-neutral-900 dark:text-white">{siteConfig.github_username || "—"}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">GitHub</p>
          </div>
        </div>
      </section>

      {/* GitHub Stats Embed (optional) */}
      {siteConfig.github_username && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white/90 border border-neutral-200 dark:bg-neutral-900/40 dark:border-neutral-850 p-6 rounded-xl backdrop-blur-md">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-4">GitHub Analytics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <img
                src={`https://github-readme-stats.vercel.app/api?username=${siteConfig.github_username}&show_icons=true&theme=algolia&hide_border=true&count_private=true`}
                alt="GitHub stats"
                className="w-full rounded-lg"
              />
              <img
                src={`https://github-readme-stats.vercel.app/api/top-langs/?username=${siteConfig.github_username}&layout=compact&theme=algolia&hide_border=true`}
                alt="Top languages"
                className="w-full rounded-lg"
              />
            </div>
            <img
              src={`https://github-readme-streak-stats.herokuapp.com/?user=${siteConfig.github_username}&theme=algolia&hide_border=true`}
              alt="Contribution streak"
              className="w-full mt-4 rounded-lg"
            />
          </div>
        </section>
      )}

      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
          <div className="flex items-end justify-between border-b border-neutral-900 pb-4">
            <div>
              <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white">Featured Work</h2>
              <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-1">Hand-picked engineering projects with full source and previews.</p>
            </div>
            <Link
              href="/projects"
              className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
            >
              <span>All Projects</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredProjects.map((project, idx) => (
              <div key={project.id} className="group opacity-0 animate-in fade-in slide-in-from-bottom-4" style={{ animationDuration: "500ms", animationFillMode: "forwards", animationDelay: `${idx * 80}ms` }}>
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured Developers */}
      {featuredDevelopers.length > 0 && featuredDevelopers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
          <div className="flex items-end justify-between border-b border-neutral-200 dark:border-neutral-900 pb-4">
            <div>
              <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white">Key Contributors</h2>
              <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-1">The talented engineers designing and maintaining our products.</p>
            </div>
            <Link
              href="/developers"
              className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
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

      {/* Footer CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center border-t border-neutral-200 dark:border-neutral-900">
        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">Want to collaborate?</h3>
        <p className="text-neutral-700 dark:text-neutral-300 max-w-md mx-auto text-sm mb-6">
          Reach out if you are interested in working together, building something new, or discussing technical topics.
        </p>
        <a
          href={`mailto:${siteConfig.contact_email}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-850 text-sm font-semibold rounded-lg transition-colors border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-200 dark:hover:text-white"
        >
          <span>Contact Me</span>
          <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
        </a>
      </section>
    </div>
  );
}