"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, ExternalLink, ShieldAlert, Award, FolderGit } from "lucide-react";
import { Github, Linkedin } from "@/components/brand-icons";
import { ProjectCard } from "@/components/project-card";
import { Badge } from "@/components/ui/badge";
import { StatCounter } from "@/components/ui/stat-counter";
import developersData from "@data/developers.json";
import projectsData from "@data/projects.json";
import { Project } from "@/lib/schemas";

const typedProjects = projectsData as Project[];

export function DeveloperPageClient({ id }: { id: string }) {
  const router = useRouter();

  const developer = useMemo(() => developersData.find((d) => d.id === id), [id]);

  const developerProjects = useMemo(() => {
    if (!developer) return [];
    return typedProjects.filter((p) => p.developer_ids.includes(developer.id));
  }, [developer]);

  const stats = useMemo(() => {
    if (!developer) return { total: 0, completed: 0, inProgress: 0 };
    const total = developerProjects.length;
    const completed = developerProjects.filter((p) => p.status === "completed").length;
    const inProgress = developerProjects.filter((p) => p.status === "in_progress").length;
    return { total, completed, inProgress };
  }, [developerProjects, developer]);

  if (!developer) {
    return (
      <div className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-white flex flex-col items-center justify-center p-4">
        <ShieldAlert className="w-12 h-12 text-red-500 mb-4 animate-bounce" />
        <h2 className="text-xl font-bold">Developer Not Found</h2>
        <p className="text-sm text-neutral-500 mt-1">The profile for ID &quot;{id}&quot; does not exist.</p>
        <button
          onClick={() => router.push("/developers")}
          className="mt-6 flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-800 text-sm font-semibold rounded-lg hover:bg-neutral-800"
        >
          <ArrowLeft className="w-4 h-4" /><span>Back to Directory</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-white py-16 selection:bg-indigo-500/30">
      <div className="fixed top-0 left-0 w-full h-[600px] -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.1),transparent)] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        <div>
          <Link href="/developers" className="flex items-center gap-1.5 text-sm font-bold text-neutral-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            <ArrowLeft className="w-4 h-4" /><span>Back to Directory</span>
          </Link>
        </div>

        {/* Developer Header Hero Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start bg-white/90 dark:bg-neutral-900/50 border border-neutral-200/80 dark:border-neutral-800/80 p-8 rounded-3xl backdrop-blur-md shadow-xl">
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur-md opacity-40 animate-pulse" />
              <img src={developer.avatar} alt={developer.name} className="relative w-32 h-32 rounded-full object-cover ring-4 ring-white dark:ring-neutral-900 shadow-xl" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
                {developer.name}
                {developer.featured && (
                  <span className="p-1.5 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20" title="Featured Contributor">
                    <Award className="w-4 h-4" />
                  </span>
                )}
              </h1>
              <p className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mt-1">{developer.designation}</p>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="space-y-2">
              <h3 className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider">Biography</h3>
              <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap font-medium">{developer.bio}</p>
            </div>

            {/* Staggered Skill Pills */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider">Technical Competencies</h3>
              <div className="flex flex-wrap gap-2">
                {developer.skills.map((skill, idx) => (
                  <motion.div
                    key={skill}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: idx * 0.05 }}
                  >
                    <Badge variant="tech" className="text-xs px-3 py-1">
                      {skill}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
              {developer.github_url && (
                <a href={developer.github_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3.5 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-bold text-neutral-800 dark:text-neutral-200 rounded-xl border border-neutral-200 dark:border-neutral-700 transition-all">
                  <Github className="w-4 h-4" />
                  <span>GitHub</span>
                </a>
              )}
              {developer.linkedin_url && (
                <a href={developer.linkedin_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3.5 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-bold text-neutral-800 dark:text-neutral-200 rounded-xl border border-neutral-200 dark:border-neutral-700 transition-all">
                  <Linkedin className="w-4 h-4" />
                  <span>LinkedIn</span>
                </a>
              )}
              {developer.portfolio_url && (
                <a href={developer.portfolio_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3.5 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-bold text-neutral-800 dark:text-neutral-200 rounded-xl border border-neutral-200 dark:border-neutral-700 transition-all">
                  <ExternalLink className="w-4 h-4" />
                  <span>Website</span>
                </a>
              )}
              {developer.email && (
                <a href={`mailto:${developer.email}`} className="inline-flex items-center gap-2 px-3.5 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-bold text-neutral-800 dark:text-neutral-200 rounded-xl border border-neutral-200 dark:border-neutral-700 transition-all">
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 border border-neutral-200/80 dark:border-neutral-800/80 p-6 rounded-3xl bg-white/80 dark:bg-neutral-900/40 backdrop-blur-md shadow-md">
          <StatCounter value={stats.total} label="All Projects" className="text-neutral-900 dark:text-white" />
          <StatCounter value={stats.completed} label="Completed" className="text-emerald-500" />
          <StatCounter value={stats.inProgress} label="Ongoing" className="text-blue-500" />
        </div>

        {/* Divider */}
        <hr className="border-neutral-200 dark:border-neutral-800/80 my-8" />

        {/* Assigned Projects Grid */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
              <FolderGit className="w-6 h-6 text-indigo-500" />
              <span>Assigned Projects ({developerProjects.length})</span>
            </h2>
            <p className="text-xs text-neutral-500 mt-1">Products engineered or maintained by {developer.name}.</p>
          </div>
          {developerProjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {developerProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl bg-neutral-900/10">
              <p className="text-sm font-semibold text-neutral-500">No projects assigned yet.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
