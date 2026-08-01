"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Edit2, Trash2, X, FolderKanban, AlertCircle, Loader2, Sparkles, Wand2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectSchema, Project } from "@/lib/schemas";
import { ScreenshotUploader, type PendingFile } from "@/components/screenshot-uploader";
import { useGitHub } from "@/hooks/use-github";
import { Badge } from "@/components/ui/badge";
import initialProjects from "../../../../data/projects.json";
import developersData from "../../../../data/developers.json";

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function AdminProjectsPage() {
  const { updateProjectsList, status, statusMessage, errorMsg, token } = useGitHub();

  const [projects, setProjects] = useState<Project[]>([]);
  const sortedProjects = React.useMemo(() => {
    return [...projects].sort((a, b) => {
      if (!a.start_date) return 1;
      if (!b.start_date) return -1;
      return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
    });
  }, [projects]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [localError, setLocalError] = useState("");
  const [isClient, setIsClient] = useState(false);

  // Form local state for screenshots array & select tags
  const [screenshotsList, setScreenshotsList] = useState<string[]>([]);
  const [selectedDevIds, setSelectedDevIds] = useState<string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);

  useEffect(() => {
    setIsClient(true);
    setProjects(initialProjects as Project[]);
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Project>({
    resolver: zodResolver(projectSchema) as any,
  });

  const watchedTitle = watch("title");
  const watchedId = watch("id");

  useEffect(() => {
    if (!editingProject && watchedTitle && !watchedId) {
      setValue("id", slugify(watchedTitle));
    }
  }, [watchedTitle, watchedId, editingProject, setValue]);

  const formatRepoName = (name: string): string => {
    return name
      .replace(/[-_]/g, " ")
      .replace(/\.git$/i, "")
      .replace(/\/$/, "")
      .replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  };

  const extractReadmeSummary = (readme: string): { full: string; short: string } => {
    const lines = readme.split("\n");
    const firstHeadingIndex = lines.findIndex((l) => l.trim().startsWith("# "));
    let contentStart = 0;
    if (firstHeadingIndex === 0) {
      contentStart = 1;
      while (contentStart < lines.length && lines[contentStart].trim() === "") contentStart++;
    }
    const body = lines.slice(contentStart).join("\n").trim();
    const plainShort = body
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`([^`]+)`/g, "$1")
      .trim();
    return { full: body, short: plainShort.slice(0, 200) };
  };

  const fetchReadme = async (owner: string, repo: string, headers: Record<string, string>): Promise<string> => {
    const readmeVariants = ["README.md", "Readme.md", "readme.md"];
    for (const variant of readmeVariants) {
      try {
        const res = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${variant}`,
          { headers }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.content) {
            return atob(data.content.replace(/\n/g, ""));
          }
        }
      } catch {
        // Try next
      }
    }
    return "";
  };

  const fetchCommitDates = async (owner: string, repo: string, headers: Record<string, string>): Promise<{ first: string; last: string }> => {
    const firstPageRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1&page=1`,
      { headers }
    );

    let firstCommitDate = "";
    let lastCommitDate = "";

    const firstPageData = firstPageRes.ok ? await firstPageRes.json() : [];
    if (firstPageData.length > 0) {
      lastCommitDate = firstPageData[0].commit?.committer?.date || firstPageData[0].commit?.author?.date || "";
    }

    const linkHeader = firstPageRes.headers.get("link") || "";
    const lastPageMatch = linkHeader.match(/page=(\d+)>; rel="last"/);
    if (lastPageMatch) {
      const lastPage = lastPageMatch[1];
      const lastPageRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1&page=${lastPage}`,
        { headers }
      );
      if (lastPageRes.ok) {
        const lastPageData = await lastPageRes.json();
        if (lastPageData.length > 0) {
          firstCommitDate = lastPageData[0].commit?.committer?.date || lastPageData[0].commit?.author?.date || "";
        }
      }
    }

    return { first: firstCommitDate, last: lastCommitDate };
  };

  const autoFillRepo = async (sourceUrl?: string) => {
    const repoUrl = sourceUrl || watch("github_repo_url");
    if (!repoUrl) return;

    try {
      const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!match) return;
      const owner = match[1];
      const repo = match[2].replace(/\.git$/, "");

      const headers: Record<string, string> = {
        Accept: "application/vnd.github.v3+json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
      if (!repoRes.ok) return;
      const repoData = await repoRes.json();

      if (!watch("title")) {
        setValue("title", formatRepoName(repoData.name));
        if (!watch("id")) setValue("id", slugify(repoData.name));
      }

      const readmeText = await fetchReadme(owner, repo, headers);
      if (readmeText) {
        const { full, short } = extractReadmeSummary(readmeText);
        if (full) setValue("description", full);
        if (short) setValue("short_description", short);
      } else if (repoData.description) {
        setValue("description", repoData.description);
        setValue("short_description", repoData.description.slice(0, 200));
      }

      if (repoData.homepage) {
        setValue("live_url", repoData.homepage);
      }

      const langsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, { headers });
      const langsData = langsRes.ok ? await langsRes.json() : {};

      const languages = Object.keys(langsData).slice(0, 10);
      if (languages.length) {
        setValue("tech_stack", languages);
      }

      const { first, last } = await fetchCommitDates(owner, repo, headers);
      if (first) setValue("start_date", first.split("T")[0]);
      if (last) setValue("end_date", last.split("T")[0]);

    } catch (error: any) {
      alert(error.message || "Unable to fetch repository details right now.");
    }
  };

  const openCreateForm = () => {
    setEditingProject(null);
    setScreenshotsList([]);
    setSelectedDevIds([]);
    setPendingFiles([]);
    reset({
      id: "",
      title: "",
      description: "",
      short_description: "",
      tech_stack: [],
      screenshots: [],
      start_date: null,
      end_date: null,
      status: "completed",
      featured: false,
      github_repo_url: "",
      linkedin_post_url: "",
      live_url: "",
      developer_ids: [],
    });
    setIsFormOpen(true);
  };

  const openEditForm = (proj: Project) => {
    setEditingProject(proj);
    setScreenshotsList(proj.screenshots || []);
    setSelectedDevIds(proj.developer_ids || []);
    setPendingFiles([]);
    reset(proj);
    
    if (proj.start_date) setValue("start_date", proj.start_date.split("T")[0]);
    if (proj.end_date) setValue("end_date", proj.end_date.split("T")[0]);
    
    setIsFormOpen(true);
  };

  const toggleDeveloperSelection = (devId: string) => {
    setSelectedDevIds((prev) => {
      const next = prev.includes(devId)
        ? prev.filter((id) => id !== devId)
        : [...prev, devId];
      return next;
    });
  };

  useEffect(() => {
    if (isFormOpen) {
      setValue("developer_ids", selectedDevIds, { shouldValidate: false });
    }
  }, [selectedDevIds, isFormOpen, setValue]);

  const handleFormSubmit = async (data: Project) => {
    setSuccessMsg("");
    setLocalError("");
    
    try {
      if (!data.title?.trim()) {
        setLocalError("Project title is required.");
        return;
      }
      if (!data.description?.trim()) {
        setLocalError("Project description is required.");
        return;
      }
      if (!data.short_description?.trim()) {
        setLocalError("Short description is required.");
        return;
      }
      if (!data.tech_stack || data.tech_stack.length === 0) {
        setLocalError("Please add at least one technology to the tech stack.");
        return;
      }
      if (selectedDevIds.length === 0) {
        setLocalError("Please assign at least one developer.");
        return;
      }
      if (!data.id || data.id.length < 2) {
        setLocalError("Project ID must be at least 2 characters.");
        return;
      }

      const newScreenshotDataUris: string[] = [];
      for (const pending of pendingFiles) {
        newScreenshotDataUris.push(pending.base64Content);
      }

      const allScreenshots = [...newScreenshotDataUris, ...screenshotsList];

      const projectData: Project = {
        ...data,
        screenshots: allScreenshots,
        developer_ids: selectedDevIds,
      };

      let updatedList: Project[] = [];
      const timestamp = new Date().toISOString();

      if (editingProject) {
        projectData.updated_at = timestamp;
        updatedList = projects.map((p) => (p.id === editingProject.id ? projectData : p));
      } else {
        projectData.created_at = timestamp;
        projectData.updated_at = timestamp;
        
        if (projects.some((p) => p.id === projectData.id)) {
          setLocalError("A project with this ID already exists.");
          return;
        }
        updatedList = [...projects, projectData];
      }

      const action = editingProject ? "Update" : "Create";
      const success = await updateProjectsList(updatedList, action, projectData.title);
      if (success) {
        setProjects(updatedList);
        setPendingFiles([]);
        setIsFormOpen(false);
        setSuccessMsg(`Project "${projectData.title}" saved and committed successfully!`);
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch (err: any) {
      console.error("Form submit error:", err);
      setLocalError(err?.message || "An unexpected error occurred while saving.");
    }
  };

  const onInvalid = (formErrors: any) => {
    const errorMessages: string[] = [];
    Object.entries(formErrors).forEach(([field, err]: [string, any]) => {
      if (err?.message) {
        errorMessages.push(`${field}: ${err.message}`);
      }
    });
    setLocalError(errorMessages.join("\n"));
  };

  const handleDelete = async (proj: Project) => {
    if (!confirm(`Are you sure you want to delete ${proj.title}?`)) {
      return;
    }

    setSuccessMsg("");
    const updatedList = projects.filter((p) => p.id !== proj.id);
    const success = await updateProjectsList(updatedList, "Delete", proj.title);
    if (success) {
      setProjects(updatedList);
      setSuccessMsg(`Project "${proj.title}" removed successfully!`);
      setTimeout(() => setSuccessMsg(""), 4000);
    }
  };

  const getScreenshotSrc = (src: string): string => {
    if (!src) return "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120";
    if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:")) return src;
    return `/${src}`;
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-indigo-500/30">
      <div className="fixed top-0 left-0 w-full h-[600px] -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.08),transparent)] pointer-events-none" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 space-y-10">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between pb-5 border-b border-neutral-900">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Admin Dashboard</span>
          </Link>
          
          <button
            onClick={openCreateForm}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-extrabold rounded-xl text-white transition-all shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Project</span>
          </button>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
              <FolderKanban className="w-6 h-6 text-indigo-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">Manage Projects</h1>
          </div>
          <p className="text-xs text-neutral-400 ml-[3.25rem]">
            Create, edit, or delete projects showcase details, timelines, technologies, and screenshot galleries.
          </p>
        </div>

        {/* Feedback Alert messages */}
        {successMsg && (
          <div className="flex items-center gap-2.5 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs text-emerald-400 font-bold">
            <Sparkles className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {(errorMsg || localError) && (
          <div className="flex items-start gap-2.5 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs text-rose-400 font-bold">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span style={{ whiteSpace: "pre-line" }}>{localError || errorMsg}</span>
          </div>
        )}

        {/* List Rows with Smooth Height Collapse on Removal */}
        <div className="space-y-3">
          <AnimatePresence>
            {sortedProjects.map((proj) => (
              <motion.div
                key={proj.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700/80 rounded-2xl gap-4 transition-all backdrop-blur-md">
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={getScreenshotSrc(proj.screenshots?.[0] || "")}
                      alt={proj.title}
                      className="w-16 h-12 rounded-xl object-cover border border-neutral-800 bg-neutral-950 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold text-white group-hover:text-indigo-400 transition-colors truncate">
                          {proj.title}
                        </h3>
                        {proj.featured && (
                          <Badge variant="primary" className="text-[9px]">Featured</Badge>
                        )}
                        <Badge variant={proj.status === "completed" ? "completed" : proj.status === "in_progress" ? "in_progress" : "planned"} className="text-[9px]">
                          {proj.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-xs text-neutral-400 truncate mt-1">{proj.short_description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => openEditForm(proj)}
                      className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-neutral-300 hover:text-white transition-all text-xs font-bold flex items-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(proj)}
                      className="p-2 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl text-rose-400 transition-all text-xs font-bold flex items-center gap-1.5 border border-rose-500/20"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Project Form Modal */}
        <AnimatePresence>
          {isFormOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 relative"
              >
                <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
                  <h3 className="text-xl font-extrabold text-white">
                    {editingProject ? `Edit Project: ${editingProject.title}` : "Create New Project"}
                  </h3>
                  <button
                    onClick={() => {
                      setIsFormOpen(false);
                      setLocalError("");
                    }}
                    className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(handleFormSubmit, onInvalid)} className="space-y-6">
                  
                  {/* ID and Title */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-1.5">Unique ID</label>
                      <input
                        type="text"
                        disabled={!!editingProject}
                        {...register("id")}
                        placeholder="cineby-hub"
                        className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-1.5">Project Title</label>
                      <input
                        type="text"
                        {...register("title")}
                        placeholder="Streaming Platform"
                        className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>

                  {/* Descriptions */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-1.5">Short Description</label>
                      <input
                        type="text"
                        {...register("short_description")}
                        placeholder="A real-time HTML editor built with Flask..."
                        className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-1.5">Full Markdown Description</label>
                      <textarea
                        rows={5}
                        {...register("description")}
                        placeholder="Provide detailed description in Markdown format..."
                        className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>

                  {/* Status, Dates, Featured */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-1.5">Status</label>
                      <select
                        {...register("status")}
                        className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-300 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="completed">Completed</option>
                        <option value="in_progress">In Progress</option>
                        <option value="planned">Planned</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-1.5">Start Date</label>
                      <input
                        type="date"
                        {...register("start_date")}
                        className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-300 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-1.5">End Date</label>
                      <input
                        type="date"
                        {...register("end_date")}
                        className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-300 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Developer selection */}
                  <div>
                    <label className="block text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-2">Assigned Developers</label>
                    <div className="flex flex-wrap gap-2">
                      {developersData.map((dev) => {
                        const isAssigned = selectedDevIds.includes(dev.id);
                        return (
                          <button
                            type="button"
                            key={dev.id}
                            onClick={() => toggleDeveloperSelection(dev.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                              isAssigned
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700"
                            }`}
                          >
                            {dev.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Submit button */}
                  <div className="flex items-center justify-end gap-3 pt-6 border-t border-neutral-800">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="px-5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-bold text-neutral-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-extrabold transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
                    >
                      {status === "loading" ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Committing changes...</span>
                        </>
                      ) : (
                        <span>Save & Commit to Repo</span>
                      )}
                    </button>
                  </div>

                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}