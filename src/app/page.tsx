"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, FolderKanban, Users2, Code2, Mail, ExternalLink, Copy, Check, Sparkles } from "lucide-react";
import { Github as GithubBrand, Linkedin, Twitter } from "@/components/brand-icons";
import { ProjectCard } from "@/components/project-card";
import { DeveloperCard } from "@/components/developer-card";
import siteConfig from "../../data/site-config.json";
import developersData from "../../data/developers.json";
import rawProjects from "../../data/projects.json";
import { Project } from "@/lib/schemas";
const typedProjects = rawProjects as Project[];
const projectsData = typedProjects;

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
  const uniqueTechs = Array.from(new Set(typedProjects.flatMap((p) => p.tech_stack)));
  const owner = developersData.find((d) => d.name === siteConfig.portfolio_owner_name) || developersData[0];

  const handleCopyEmail = () => {
    if (siteConfig.contact_email) {
      navigator.clipboard.writeText(siteConfig.contact_email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const socialLinks = [
    { href: siteConfig.github_url, icon: GithubBrand, label: "GitHub", show: !!siteConfig.github_url },
    { href: siteConfig.linkedin_url, icon: Linkedin, label: "LinkedIn", show: !!siteConfig.linkedin_url },
    { href: siteConfig.twitter_url, icon: Twitter, label: "Twitter", show: !!siteConfig.twitter_url },
    { href: `mailto:${siteConfig.contact_email}`, icon: Mail, label: "Email", show: !!siteConfig.contact_email },
  ].filter((l) => l.show);

  const typingLines = siteConfig.profile_typing_lines || [];
  const displayName = owner?.name || siteConfig.portfolio_owner_name;

  return (
    <div className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-white selection:bg-indigo-500/30">
      {/* Hero gradient */}
      <div className="fixed top-0 left-0 w-full h-[800px] -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.12),transparent)] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] -z-10 bg-[radial-gradient(circle_at_100%_100%,rgba(99,102,241,0.06),transparent_60%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        {/* Profile Header */}
        <header className="max-w-4xl mx-auto text-center mb-20">
          {owner?.avatar && (
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full blur-xl opacity-40 animate-pulse" />
              <img
                src={owner.avatar}
                alt={displayName}
                className="relative w-28 h-28 rounded-full object-cover ring-4 ring-white/80 dark:ring-neutral-900 shadow-2xl"
              />
            </div>
          )}

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight bg-gradient-to-br from-neutral-900 via-neutral-700 to-neutral-500 dark:from-white dark:via-neutral-200 dark:to-neutral-500 bg-clip-text text-transparent leading-[1.1]">
            {displayName}
          </h1>

          {owner?.designation && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
              </span>
              <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-400">{owner.designation}</p>
            </div>
          )}

          {siteConfig.profile_bio && (
            <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 mt-6 max-w-2xl mx-auto leading-relaxed">
              {siteConfig.profile_bio}
            </p>
          )}

          {typingLines.length > 0 && (
            <div className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full shadow-sm">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{typingLines[0]}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200"
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
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Resume</span>
              </a>
            )}
            {siteConfig.contact_email && (
              <button
                onClick={handleCopyEmail}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Mail className="w-4 h-4" />}
                <span>{copied ? "Copied!" : "Copy Email"}</span>
              </button>
            )}
          </div>
        </header>

        {/* Stats Row */}
        <section className="max-w-4xl mx-auto mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: FolderKanban, label: "Projects", value: projectsData.length },
              { icon: Code2, label: "Technologies", value: uniqueTechs.length },
              { icon: Users2, label: "Contributors", value: developersData.length },
              { icon: GithubBrand, label: "GitHub", value: siteConfig.github_username || "—" },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="group relative bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl text-center hover:border-indigo-400/30 dark:hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <stat.icon className="w-5 h-5 text-indigo-400 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
                <p className="text-3xl font-bold text-neutral-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* GitHub Stats — using github-profile-summary-cards API (more reliable) */}
        {siteConfig.github_username && (
          <section className="max-w-4xl mx-auto mb-20">
            <div className="bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 rounded-2xl backdrop-blur-sm">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-5 flex items-center gap-2">
                <GithubBrand className="w-4 h-4 text-indigo-400" />
                GitHub Analytics
              </h3>
              <div className="space-y-4">
                <img
                  src={`https://github-profile-summary-cards.vercel.app/api/cards/profile-details?username=${siteConfig.github_username}&theme=algolia`}
                  alt="GitHub profile details"
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800"
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <img
                    src={`https://github-profile-summary-cards.vercel.app/api/cards/repos-per-language?username=${siteConfig.github_username}&theme=algolia`}
                    alt="Repos per language"
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800"
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                  />
                  <img
                    src={`https://github-profile-summary-cards.vercel.app/api/cards/most-commit-language?username=${siteConfig.github_username}&theme=algolia`}
                    alt="Most commit language"
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800"
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Featured Projects */}
        {featuredProjects.length > 0 && (
          <section className="max-w-7xl mx-auto mb-20">
            <div className="flex items-end justify-between mb-10 pb-5 border-b border-neutral-200 dark:border-neutral-800">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white">Featured Work</h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1.5">Hand-picked engineering projects with full source and previews.</p>
              </div>
              <Link
                href="/projects"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors group"
              >
                <span>All Projects</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredProjects.map((project) => (
                <div key={project.id}>
                  <ProjectCard project={project} />
                </div>
              ))}
            </div>
            <div className="mt-8 text-center sm:hidden">
              <Link
                href="/projects"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
              >
                <span>All Projects</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>
        )}

        {/* Featured Developers */}
        {featuredDevelopers.length > 0 && (
          <section className="max-w-7xl mx-auto mb-20">
            <div className="flex items-end justify-between mb-10 pb-5 border-b border-neutral-200 dark:border-neutral-800">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white">Key Contributors</h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1.5">The talented engineers designing and maintaining our products.</p>
              </div>
              <Link
                href="/developers"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors group"
              >
                <span>Directory</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
        <section className="max-w-2xl mx-auto text-center pt-16 border-t border-neutral-200 dark:border-neutral-800">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200 dark:border-indigo-500/20 rounded-3xl p-10 sm:p-14">
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">Want to collaborate?</h3>
            <p className="text-neutral-600 dark:text-neutral-400 max-w-md mx-auto text-sm mb-8">
              Reach out if you are interested in working together, building something new, or discussing technical topics.
            </p>
            <a
              href={`mailto:${siteConfig.contact_email}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30"
            >
              <Mail className="w-4 h-4" />
              <span>Contact Me</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}