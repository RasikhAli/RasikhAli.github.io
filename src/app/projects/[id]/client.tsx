"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { ArrowLeft, Calendar, ShieldAlert, ExternalLink, Share2, Copy, Check, ChevronRight } from "lucide-react";
import { Github, Linkedin } from "@/components/brand-icons";
import { Lightbox } from "@/components/lightbox";
import { ProjectCard } from "@/components/project-card";
import { Badge } from "@/components/ui/badge";
import projectsData from "@data/projects.json";
import developersData from "@data/developers.json";
import { Project } from "@/lib/schemas";
import siteConfig from "@data/site-config.json";

const typedProjects = projectsData as Project[];

export function ProjectDetailsClient({ id }: { id: string }) {
  const router = useRouter();

  const [copied, setCopied] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const project = useMemo(() => typedProjects.find((p) => p.id === id), [id]);

  const developers = useMemo(() => {
    if (!project) return [];
    return developersData.filter((d) => project.developer_ids.includes(d.id));
  }, [project]);

  const relatedProjects = useMemo(() => {
    if (!project) return [];
    return typedProjects
      .filter((p) => p.id !== project.id && p.tech_stack.some((tech) => project.tech_stack.includes(tech)))
      .slice(0, 3);
  }, [project]);

  if (!project) {
    return (
      <div className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-white flex flex-col items-center justify-center p-4">
        <ShieldAlert className="w-12 h-12 text-red-500 mb-4 animate-bounce" />
        <h2 className="text-xl font-bold">Project Not Found</h2>
        <p className="text-sm text-neutral-500 mt-1">The project with ID &quot;{id}&quot; does not exist.</p>
        <button onClick={() => router.push("/projects")} className="mt-6 flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-800 text-sm font-semibold rounded-lg hover:bg-neutral-800">
          <ArrowLeft className="w-4 h-4" /><span>Back to Projects</span>
        </button>
      </div>
    );
  }

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getCoverImage = () => {
    if (project.screenshots && project.screenshots.length > 0) {
      const cover = project.screenshots[0];
      if (!cover) return "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800";
      if (cover.startsWith("http://") || cover.startsWith("https://") || cover.startsWith("data:")) return cover;
      return `/${cover}`;
    }
    return "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800";
  };

  const getFullImageUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;
    return `/${path}`;
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "Present";
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  const shareText = `Check out ${project.title} on ${siteConfig.portfolio_owner_name}'s Portfolio!`;

  return (
    <div className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-white py-16 selection:bg-indigo-500/30">
      <Lightbox images={project.screenshots || []} currentIndex={lightboxIndex} isOpen={lightboxOpen} onClose={() => setLightboxOpen(false)} onNavigate={(index) => setLightboxIndex(index)} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
          <Link href="/projects" className="flex items-center gap-1.5 text-sm font-bold text-neutral-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            <ArrowLeft className="w-4 h-4" /><span>Back to Projects</span>
          </Link>
          <button onClick={handleCopyLink} className="flex items-center gap-1.5 px-3.5 py-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:border-indigo-500 transition-all">
            {copied ? (<><Check className="w-3.5 h-3.5 text-emerald-500" /><span className="text-emerald-500">Copied!</span></>) : (<><Copy className="w-3.5 h-3.5" /><span>Copy Link</span></>)}
          </button>
        </div>

        {/* Hero Cover Image morph */}
        <div className="relative aspect-video max-h-[450px] w-full rounded-3xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-2xl bg-neutral-950">
          <motion.img
            layoutId={`project-img-${project.id}`}
            src={getCoverImage()}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-3">
              <Badge variant={project.status === "completed" ? "completed" : project.status === "in_progress" ? "in_progress" : "planned"}>
                {project.status.replace("_", " ").toUpperCase()}
              </Badge>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-neutral-900 dark:text-white leading-tight">{project.title}</h1>
              <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed font-medium">{project.short_description}</p>
            </div>

            <div className="space-y-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <h3 className="text-xl font-extrabold text-neutral-900 dark:text-white">About the Project</h3>
              <div className="prose prose-neutral dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed text-neutral-700 dark:text-neutral-300">
                <ReactMarkdown
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    h1: ({ children }) => <h1 className="text-2xl font-bold mt-6 mb-3 text-neutral-900 dark:text-white">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-xl font-bold mt-5 mb-2 text-neutral-900 dark:text-white">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-lg font-bold mt-4 mb-2 text-neutral-900 dark:text-white">{children}</h3>,
                    p: ({ children }) => <p className="mb-3 leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="text-neutral-700 dark:text-neutral-300">{children}</li>,
                    strong: ({ children }) => <strong className="font-bold text-neutral-900 dark:text-white">{children}</strong>,
                    code: ({ children, className }) => {
                      const isInline = !className;
                      if (isInline) {
                        return <code className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-sm font-mono text-indigo-600 dark:text-indigo-400">{children}</code>;
                      }
                      return <pre className="p-4 bg-neutral-100 dark:bg-neutral-900 rounded-xl overflow-x-auto border border-neutral-200 dark:border-neutral-800 mb-3"><code className="text-sm font-mono text-neutral-800 dark:text-neutral-200">{children}</code></pre>;
                    },
                    a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold">{children}</a>,
                  }}
                >
                  {project.description}
                </ReactMarkdown>
              </div>
            </div>

            {project.screenshots && project.screenshots.length > 0 && (
              <div className="space-y-4 pt-6">
                <h3 className="text-xl font-extrabold text-neutral-900 dark:text-white">Project Gallery</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {project.screenshots.map((src, index) => (
                    <div key={src} onClick={() => { setLightboxIndex(index); setLightboxOpen(true); }} className="aspect-video rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-900 cursor-zoom-in hover:border-indigo-500/50 transition-colors group shadow-sm">
                      <img src={getFullImageUrl(src)} alt={`Screenshot ${index + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6 p-6 bg-white/90 dark:bg-neutral-900/50 border border-neutral-200/80 dark:border-neutral-800/80 rounded-3xl backdrop-blur-md shadow-xl">
            <div className="space-y-2">
              <h4 className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider">Project Timeline</h4>
              <div className="flex items-center gap-2 text-sm font-bold text-neutral-800 dark:text-neutral-200">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span>{formatDate(project.start_date)} - {formatDate(project.end_date)}</span>
              </div>
            </div>
            <div className="space-y-2 pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <h4 className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider">Technologies</h4>
              <div className="flex flex-wrap gap-1.5">
                {project.tech_stack.map((tech) => (
                  <Badge key={tech} variant="tech">{tech}</Badge>
                ))}
              </div>
            </div>
            <div className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <h4 className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider">Developers</h4>
              <div className="space-y-3">
                {developers.map((dev) => (
                  <Link key={dev.id} href={`/developers/${dev.id}`} className="flex items-center gap-3 p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 rounded-xl transition-colors group">
                    <img src={dev.avatar} alt={dev.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/20" />
                    <div>
                      <div className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-indigo-500 transition-colors">{dev.name}</div>
                      <div className="text-[10px] text-neutral-500 font-semibold">{dev.designation}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            <div className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <h4 className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider">External Links</h4>
              <div className="flex flex-col gap-2">
                {project.live_url && (
                  <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20">
                    <span className="flex items-center gap-2"><ExternalLink className="w-4 h-4" /><span>Live Demo</span></span>
                    <ChevronRight className="w-4 h-4" />
                  </a>
                )}
                {project.github_repo_url && (
                  <a href={project.github_repo_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white rounded-xl text-xs font-bold border border-neutral-200 dark:border-neutral-700 transition-all">
                    <span className="flex items-center gap-2"><Github className="w-4 h-4" /><span>GitHub Repository</span></span>
                    <ChevronRight className="w-4 h-4" />
                  </a>
                )}
                {project.linkedin_post_url && (
                  <a href={project.linkedin_post_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white rounded-xl text-xs font-bold border border-neutral-200 dark:border-neutral-700 transition-all">
                    <span className="flex items-center gap-2"><Linkedin className="w-4 h-4" /><span>LinkedIn Post</span></span>
                    <ChevronRight className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {relatedProjects.length > 0 && (
          <div className="space-y-6 pt-12 border-t border-neutral-200 dark:border-neutral-900">
            <div>
              <h3 className="text-2xl font-extrabold text-neutral-900 dark:text-white">Related Projects</h3>
              <p className="text-xs text-neutral-500 mt-1">Projects built with similar technologies.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProjects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
