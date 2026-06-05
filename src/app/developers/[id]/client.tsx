"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, ExternalLink, ShieldAlert, Award, FolderGit } from "lucide-react";
import { Github, Linkedin } from "@/components/brand-icons";
import { ProjectCard } from "@/components/project-card";
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
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] -z-10 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.05),transparent_50%)] pointer-events-none" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        <div>
          <Link href="/developers" className="flex items-center gap-1.5 text-sm font-semibold text-neutral-600 dark:text-neutral-400 dark:hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /><span>Developers</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start bg-white/90 border border-neutral-200 dark:bg-neutral-900/40 dark:border-neutral-800 p-8 rounded-2xl backdrop-blur-md">
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4">
            <img src={developer.avatar} alt={developer.name} className="w-32 h-32 rounded-full object-cover ring-4 ring-neutral-200 dark:ring-neutral-800 shadow-xl" />
            <div>
              <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
                {developer.name}
                {developer.featured && (<span className="p-1 bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20" title="Featured"><Award className="w-3.5 h-3.5" /></span>)}
              </h1>
              <p className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold mt-1">{developer.designation}</p>
            </div>
          </div>
          <div className="md:col-span-2 space-y-5">
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-neutral-500 dark:text-neutral-500 uppercase tracking-wider">Biography</h3>
              <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">{developer.bio}</p>
            </div>
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-neutral-500 dark:text-neutral-500 uppercase tracking-wider">Core Skills</h3>
              <div className="flex flex-wrap gap-1.5">{developer.skills.map((skill) => (<span key={skill} className="text-xs font-medium bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 px-2.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-700">{skill}</span>))}</div>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              {developer.github_url && (<a href={developer.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 dark:hover:text-white rounded border border-neutral-200 dark:border-neutral-700 transition-colors"><Github className="w-3.5 h-3.5" /><span>GitHub</span></a>)}
              {developer.linkedin_url && (<a href={developer.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 dark:hover:text-white rounded border border-neutral-200 dark:border-neutral-700 transition-colors"><Linkedin className="w-3.5 h-3.5" /><span>LinkedIn</span></a>)}
              {developer.portfolio_url && (<a href={developer.portfolio_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 dark:hover:text-white rounded border border-neutral-200 dark:border-neutral-700 transition-colors"><ExternalLink className="w-3.5 h-3.5" /><span>Website</span></a>)}
              {developer.email && (<a href={`mailto:${developer.email}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 dark:hover:text-white rounded border border-neutral-200 dark:border-neutral-700 transition-colors"><Mail className="w-3.5 h-3.5" /><span>Email</span></a>)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 border border-neutral-200 dark:border-neutral-800 p-6 rounded-xl bg-neutral-100/80 dark:bg-neutral-900/20 backdrop-blur-md">
          <div className="text-center">
            <div className="text-neutral-500 dark:text-neutral-500 text-xs font-bold uppercase tracking-wider">All Projects</div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">{stats.total}</div>
          </div>
          <div className="text-center border-l border-neutral-800">
            <div className="text-neutral-500 dark:text-neutral-500 text-xs font-bold uppercase tracking-wider">Completed</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{stats.completed}</div>
          </div>
          <div className="text-center border-l border-neutral-800">
            <div className="text-neutral-500 dark:text-neutral-500 text-xs font-bold uppercase tracking-wider">Ongoing</div>
            <div className="text-2xl font-bold text-blue-400 mt-1">{stats.inProgress}</div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <FolderGit className="w-5 h-5 text-indigo-400" /><span>Assigned Projects</span>
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">All projects by {developer.name}.</p>
          </div>
          {developerProjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {developerProjects.map((project) => (<ProjectCard key={project.id} project={project} />))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-100/70 dark:bg-neutral-900/10">
              <p className="text-sm text-neutral-600 dark:text-neutral-500">No projects assigned yet.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
