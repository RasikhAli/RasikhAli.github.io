"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Plus, Edit2, Trash2, X, FolderKanban, AlertCircle, Loader2, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectSchema, Project } from "@/lib/schemas";
import { ScreenshotUploader, type PendingFile } from "@/components/screenshot-uploader";
import { useGitHub } from "@/hooks/use-github";
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
        // Try next variant
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
    const repoUrl = sourceUrl;
    if (!repoUrl) return;

    try {
      const match = repoUrl.match(/github\.com\/([\w.-]+)\/([\w.-]+)/i);
      if (!match) {
        alert("Invalid GitHub repository URL. Expected format: https://github.com/owner/repo");
        return;
      }
      const [, owner, repoName] = match;
      const repo = repoName.replace(/\.git$/, "").replace(/\/$/, "");

      if (!token) {
        alert("GitHub PAT is required for auto-fill. Configure it in Admin Settings first.");
        return;
      }

      const headers: Record<string, string> = {
        Accept: "application/vnd.github.v3+json",
        Authorization: `Bearer ${token}`,
      };

      const [repoRes, langsRes] = await Promise.all([
        fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers }),
        fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, { headers }).catch(() => null),
      ]);

      if (!repoRes.ok) {
        const errMsg = repoRes.status === 403
          ? "GitHub API rate limit exceeded, or PAT is invalid/expired. Check your token in Admin Settings."
          : repoRes.status === 404
            ? `Repository "${owner}/${repo}" not found on GitHub. Check the URL.`
            : `GitHub API error (${repoRes.status}). Make sure your PAT has 'repo' scope.`;
        throw new Error(errMsg);
      }

      const repoData = await repoRes.json();
      const langsData = langsRes ? await langsRes.json() : {};

      const derivedTitle = formatRepoName(repo);
      setValue("title", derivedTitle);
      setValue("id", slugify(derivedTitle));

      const readmeContent = await fetchReadme(owner, repo, headers);
      if (readmeContent) {
        const { full, short } = extractReadmeSummary(readmeContent);
        if (full) setValue("description", full);
        if (short) setValue("short_description", short);
      } else if (repoData.description) {
        setValue("description", repoData.description);
        setValue("short_description", repoData.description.slice(0, 200));
      }

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
        setLocalError("Project ID must be at least 2 characters (lowercase with hyphens).");
        return;
      }

      // Convert pending screenshot files into base64 data URIs and embed them directly in the JSON
      // This way, screenshots are stored inline in projects.json — no separate file uploads needed
      const newScreenshotDataUris: string[] = [];
      for (const pending of pendingFiles) {
        // pending.base64Content is already a data URL (data:image/...;base64,...)
        newScreenshotDataUris.push(pending.base64Content);
      }

      // Keep existing screenshots as-is (they're either data URIs, http URLs, or old file paths)
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
          setLocalError("A project with this ID already exists. Please choose a unique lowercase ID.");
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
    console.error("Form validation failed:", formErrors);
    const errorMessages: string[] = [];
    Object.entries(formErrors).forEach(([field, err]: [string, any]) => {
      if (err?.message) {
        errorMessages.push(`${field}: ${err.message}`);
      }
    });
    const summary = errorMessages.length > 0
      ? `Please fix the following errors:\n• ${errorMessages.join("\n• ")}`
      : "Please fill in all required fields correctly before saving.";
    setLocalError(summary);
  };

  const handleDelete = async (proj: Project) => {
    if (!confirm(`Are you sure you want to delete ${proj.title}? This will commit changes directly to the repository.`)) {
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

  /** Returns a usable image src from a screenshot entry (http URL, data URI, or file path) */
  const getScreenshotSrc = (src: string): string => {
    if (!src) return "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120";
    if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:")) return src;
    return `/${src}`;
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-indigo-500/30">
      <div className="fixed top-0 left-0 w-full h-[600px] -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.08),transparent)] pointer-events-none" />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 space-y-10">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between pb-5 border-b border-neutral-800">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Admin Dashboard</span>
          </Link>
          
          <button
            onClick={openCreateForm}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold rounded-xl text-white transition-all shadow-lg shadow-indigo-600/25"
          >
            <Plus className="w-4 h-4" />
            <span>Add Project</span>
          </button>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-xl">
              <FolderKanban className="w-6 h-6 text-indigo-400" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Manage Projects</h1>
          </div>
          <p className="text-sm text-neutral-400 ml-[3.25rem]">
            Create, edit, or delete projects showcase details, timelines, technologies, and screenshots.
          </p>
        </div>

        {/* Feedback Alert messages */}
        {successMsg && (
          <div className="flex items-center gap-2.5 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-400 font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {(errorMsg || localError) && (
          <div className="flex items-start gap-2.5 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 font-semibold">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span style={{ whiteSpace: "pre-line" }}>{localError || errorMsg}</span>
          </div>
        )}

        {/* Project Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8">
              
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
                <h3 className="text-lg font-bold text-white">
                  {editingProject ? `Edit Project: ${editingProject.title}` : "Create Project Entry"}
                </h3>
                <button
                  onClick={() => {
                    setIsFormOpen(false);
                    setLocalError("");
                  }}
                  className="p-1 rounded-md text-neutral-450 hover:text-white hover:bg-neutral-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Input fields */}
              <form onSubmit={handleSubmit(handleFormSubmit, onInvalid)} className="space-y-6">
                
                {/* ID and Title */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Unique ID (lowercase-hyphens)</label>
                    <input
                      type="text"
                      disabled={!!editingProject}
                      {...register("id")}
                      placeholder="cineby-hub"
                      className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-850 rounded-lg text-sm text-neutral-350 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                    />
                    {errors.id && <p className="text-xs text-red-500 mt-1">{errors.id.message}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Project Title</label>
                    <input
                      type="text"
                      {...register("title")}
                      onBlur={(e) => {
                        register("title").onBlur(e);
                        if (!watch("id")) setValue("id", slugify(e.target.value));
                      }}
                      placeholder="My Streaming App"
                      className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-850 rounded-lg text-sm text-neutral-300 focus:outline-none focus:border-indigo-500"
                    />
                    {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
                  </div>
                </div>

                {/* Short and Full Descriptions */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Short Description (Summary)</label>
                    <input
                      type="text"
                      {...register("short_description")}
                      placeholder="A cinematic streaming hub for discovery..."
                      className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-850 rounded-lg text-sm text-neutral-350 focus:outline-none focus:border-indigo-500"
                    />
                    {errors.short_description && <p className="text-xs text-red-500 mt-1">{errors.short_description.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Full Description</label>
                    <textarea
                      rows={4}
                      {...register("description")}
                      placeholder="Provide a comprehensive summary of project, architecture, components, features..."
                      className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-850 rounded-lg text-sm text-neutral-350 focus:outline-none focus:border-indigo-500"
                    />
                    {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
                  </div>
                </div>

                {/* Status and dates */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Status</label>
                    <select
                      {...register("status")}
                      className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-850 rounded-lg text-sm text-neutral-300 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="completed">Completed</option>
                      <option value="in_progress">In Progress</option>
                      <option value="planned">Planned</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Start Date</label>
                    <input
                      type="date"
                      {...register("start_date")}
                      className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-850 rounded-lg text-sm text-neutral-350 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">End Date (optional)</label>
                    <input
                      type="date"
                      {...register("end_date")}
                      className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-850 rounded-lg text-sm text-neutral-355 focus:outline-none"
                    />
                  </div>
                </div>

                {/* External links */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Live Demonstration URL</label>
                    <input
                      type="text"
                      {...register("live_url")}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-850 rounded-lg text-sm text-neutral-350 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">GitHub Repository URL</label>
                    <input
                      type="text"
                      {...register("github_repo_url")}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-850 rounded-lg text-sm text-neutral-350 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const url = watch("github_repo_url");
                        if (url) autoFillRepo(url);
                      }}
                      className="mt-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                    >
                      Auto-fill from GitHub
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">LinkedIn Post URL</label>
                    <input
                      type="text"
                      {...register("linkedin_post_url")}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-850 rounded-lg text-sm text-neutral-355 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Multi-select Developer List */}
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                    Assign Developers
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {developersData.map((dev) => {
                      const isSelected = selectedDevIds.includes(dev.id);
                      return (
                        <button
                          type="button"
                          key={dev.id}
                          onClick={() => toggleDeveloperSelection(dev.id)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                            isSelected
                              ? "bg-indigo-600/10 border-indigo-500 text-indigo-400"
                              : "bg-neutral-950 border-neutral-850 text-neutral-400 hover:text-white"
                          }`}
                        >
                          <img
                            src={dev.avatar}
                            alt={dev.name}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span>{dev.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <p className="text-[11px] text-neutral-500">Tip: a GitHub repository URL auto-fills the description, short summary, and tech stack when available. The ID is generated from the title if left blank.</p>

                {/* Tech stack tags */}
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                    Technology Stack (Comma Separated)
                  </label>
                  <input
                    type="text"
                    placeholder="React, TypeScript, CSS, Node.js"
                    value={(watch("tech_stack") || []).join(", ")}
                    onChange={(e) => {
                      const list = e.target.value.split(",").map((t) => t.trim()).filter(Boolean);
                      setValue("tech_stack", list, { shouldValidate: true });
                    }}
                    className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-850 rounded-lg text-sm text-neutral-300 focus:outline-none focus:border-indigo-500"
                  />
                  {errors.tech_stack && <p className="text-xs text-red-500 mt-1">{errors.tech_stack.message}</p>}
                </div>

                {/* Screenshot Uploader Integration */}
                <div className="border-t border-neutral-850 pt-5">
                  <ScreenshotUploader
                    screenshots={screenshotsList}
                    onChange={(list) => setScreenshotsList(list)}
                    pendingFiles={pendingFiles}
                    onAddPending={(file) => setPendingFiles((prev) => [...prev, file])}
                    onRemovePending={(fileName) => setPendingFiles((prev) => prev.filter((f) => f.fileName !== fileName))}
                    isUploading={status === "loading"}
                  />
                </div>

                {/* Featured Switch */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured-proj-checkbox"
                    {...register("featured")}
                    className="w-4.5 h-4.5 accent-indigo-650 bg-neutral-950 border-neutral-800 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="featured-proj-checkbox" className="text-sm font-semibold text-neutral-305">
                    Feature on Homepage Showcase Grid
                  </label>
                </div>

                {/* Submit panel buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false);
                      setLocalError("");
                    }}
                    className="px-4 py-2 bg-neutral-850 hover:bg-neutral-800 text-sm font-semibold rounded-lg text-neutral-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold rounded-lg text-white disabled:opacity-50"
                  >
                    {status === "loading" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Project</span>
                      </>
                    )}
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

        {status === "loading" && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-center shadow-2xl">
              <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-indigo-400" />
              <h3 className="text-lg font-semibold text-white">Publishing update</h3>
              <p className="mt-2 text-sm text-neutral-400">{statusMessage || "Saving your changes and waiting for the GitHub Pages deployment to finish."}</p>
            </div>
          </div>
        )}

        {/* Existing Projects List Grid with start_date sort */}
        <div className="grid grid-cols-1 gap-4">
          {sortedProjects.map((proj) => (
            <div
              key={proj.id}
              className="group bg-neutral-900/40 border border-neutral-850 rounded-2xl p-5 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-12 bg-neutral-950 rounded-xl overflow-hidden shrink-0 border border-neutral-800 group-hover:border-indigo-500/30 transition-colors">
                  <img
                    src={proj.screenshots && proj.screenshots[0] ? getScreenshotSrc(proj.screenshots[0]) : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120"}
                    alt={proj.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm sm:text-base group-hover:text-indigo-400 transition-colors">{proj.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full font-semibold border border-indigo-500/20 uppercase tracking-wider">
                      {proj.status.replace("_", " ")}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">ID: {proj.id}</span>
                    {proj.start_date && (
                      <span className="text-[10px] text-neutral-500 flex items-center gap-1">
                        <span>·</span>
                        {new Date(proj.start_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 self-end sm:self-auto">
                <button
                  onClick={() => openEditForm(proj)}
                  className="p-2 bg-neutral-850 hover:bg-neutral-800 hover:text-indigo-400 text-neutral-450 rounded-xl transition-all border border-neutral-800 hover:border-indigo-500/30"
                  title="Edit project details"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(proj)}
                  className="p-2 bg-neutral-850 hover:bg-red-950 hover:text-red-400 text-neutral-450 rounded-xl transition-all border border-neutral-800 hover:border-red-500/30"
                  title="Delete project entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}