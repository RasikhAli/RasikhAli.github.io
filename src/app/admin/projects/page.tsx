"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Plus, Edit2, Trash2, X, FolderKanban, AlertCircle, Loader2, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectSchema, Project } from "@/lib/schemas";
import { ScreenshotUploader } from "@/components/screenshot-uploader";
import { useGitHub } from "@/hooks/use-github";
import { Octokit } from "octokit";
import initialProjects from "../../../../data/projects.json";
import developersData from "../../../../data/developers.json";

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function AdminProjectsPage() {
  const { updateProjectsList, uploadFile, status, statusMessage, errorMsg, token } = useGitHub();

  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [isClient, setIsClient] = useState(false);

  // Form local state for screenshots array & select tags
  const [screenshotsList, setScreenshotsList] = useState<string[]>([]);
  const [selectedDevIds, setSelectedDevIds] = useState<string[]>([]);

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
    resolver: zodResolver(projectSchema),
  });

  const watchedTitle = watch("title");
  const watchedId = watch("id");
  const watchedRepoUrl = watch("github_repo_url");

  useEffect(() => {
    if (!editingProject && watchedTitle && !watchedId) {
      setValue("id", slugify(watchedTitle));
    }
  }, [watchedTitle, watchedId, editingProject, setValue]);

  const autoFillRepo = async (sourceUrl?: string) => {
    const repoUrl = sourceUrl || watchedRepoUrl;
    if (!repoUrl) return;

    try {
      const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!match) throw new Error("Invalid GitHub repository URL. Expected format: https://github.com/owner/repo");
      const [, owner, repo] = match;

      if (!token) throw new Error("GitHub PAT is required for auto-fill. Configure it in Admin Settings.");

      const octokit = new Octokit({ auth: token });
      const [repoData, langsData] = await Promise.all([
        octokit.rest.repos.getBySlug({ owner, repo }),
        octokit.rest.repos.listLanguages({ owner, repo }).catch(() => ({ data: {} })),
      ]);

      const languages = Object.keys(langsData.data).slice(0, 10);
      const desc = repoData.data.description || "";

      if (!watch("description") && desc) setValue("description", desc);
      if (!watch("short_description") && desc) setValue("short_description", desc.slice(0, 200));
      if (!watch("tech_stack")?.length && languages.length) setValue("tech_stack", languages);
    } catch (error: any) {
      alert(error.message || "Unable to fetch repository details right now.");
    }
  };

  const openCreateForm = () => {
    setEditingProject(null);
    setScreenshotsList([]);
    setSelectedDevIds([]);
    reset({
      id: "",
      title: "",
      description: "",
      short_description: "",
      tech_stack: [],
      screenshots: [],
      start_date: "",
      end_date: "",
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
    reset(proj);
    
    // Fallback: react-hook-form date inputs require yyyy-MM-dd format
    if (proj.start_date) setValue("start_date", proj.start_date.split("T")[0]);
    if (proj.end_date) setValue("end_date", proj.end_date.split("T")[0]);
    
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: Project) => {
    setSuccessMsg("");
    
    // Bind current screen/dev lists
    data.screenshots = screenshotsList;
    data.developer_ids = selectedDevIds;

    if (data.developer_ids.length === 0) {
      alert("Please assign at least one developer.");
      return;
    }

    let updatedList: Project[] = [];
    const timestamp = new Date().toISOString();

    if (editingProject) {
      data.updated_at = timestamp;
      updatedList = projects.map((p) => (p.id === editingProject.id ? data : p));
    } else {
      data.created_at = timestamp;
      data.updated_at = timestamp;
      
      if (projects.some((p) => p.id === data.id)) {
        alert("A project with this ID already exists. Please choose a unique lowercase ID.");
        return;
      }
      updatedList = [...projects, data];
    }

    const action = editingProject ? "Update" : "Create";
    const success = await updateProjectsList(updatedList, action, data.title);
    if (success) {
      setProjects(updatedList);
      setIsFormOpen(false);
      setSuccessMsg(`Project "${data.title}" saved and committed successfully!`);
      setTimeout(() => setSuccessMsg(""), 4000);
    }
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

  const toggleDeveloperSelection = (devId: string) => {
    setSelectedDevIds((prev) => {
      const next = prev.includes(devId)
        ? prev.filter((id) => id !== devId)
        : [...prev, devId];
      setValue("developer_ids", next);
      return next;
    });
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-neutral-950 text-white py-16 selection:bg-indigo-500/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-sm font-semibold text-neutral-450 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Admin Dashboard</span>
          </Link>
          
          <button
            onClick={openCreateForm}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold rounded-lg text-white transition-colors shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Add Project</span>
          </button>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <FolderKanban className="w-8 h-8 text-indigo-400" />
            <span>Manage Projects</span>
          </h1>
          <p className="text-sm text-neutral-455">
            Create, edit, or delete projects showcase details, timelines, technologies, and screenshots.
          </p>
        </div>

        {/* Feedback Alert messages */}
        {successMsg && (
          <div className="flex items-center gap-2.5 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-400 font-semibold animate-in fade-in duration-200">
            <Sparkles className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-center gap-2.5 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 font-semibold animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Project Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200">
              
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
                <h3 className="text-lg font-bold text-white">
                  {editingProject ? `Edit Project: ${editingProject.title}` : "Create Project Entry"}
                </h3>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-1 rounded-md text-neutral-450 hover:text-white hover:bg-neutral-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Input fields */}
              <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                
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
                      onBlur={(e) => {
                        register("github_repo_url").onBlur(e);
                        if (e.target.value) autoFillRepo(e.target.value);
                      }}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-850 rounded-lg text-sm text-neutral-350 focus:outline-none focus:border-indigo-500"
                    />
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
                    defaultValue={editingProject ? editingProject.tech_stack.join(", ") : ""}
                    onChange={(e) => {
                      const list = e.target.value.split(",").map((t) => t.trim()).filter(Boolean);
                      setValue("tech_stack", list);
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
                    onUpload={uploadFile}
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
                    onClick={() => setIsFormOpen(false)}
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

        {/* Existing Projects List Grid */}
        <div className="grid grid-cols-1 gap-4">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="bg-neutral-900/40 border border-neutral-850 rounded-xl p-5 backdrop-blur-md hover:border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-12 bg-neutral-950 rounded overflow-hidden shrink-0 border border-neutral-850">
                  <img
                    src={proj.screenshots && proj.screenshots[0] ? (proj.screenshots[0].startsWith("http") ? proj.screenshots[0] : `/${proj.screenshots[0]}`) : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120"}
                    alt={proj.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm sm:text-base">{proj.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-[10px] bg-neutral-850 text-indigo-400 px-1.5 py-0.5 rounded uppercase font-semibold">
                      {proj.status.replace("_", " ")}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">ID: {proj.id}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 self-end sm:self-auto">
                <button
                  onClick={() => openEditForm(proj)}
                  className="p-2 bg-neutral-850 hover:bg-neutral-800 hover:text-indigo-400 text-neutral-450 rounded-lg transition-colors border border-neutral-800"
                  title="Edit project details"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(proj)}
                  className="p-2 bg-neutral-850 hover:bg-red-950 hover:text-red-400 text-neutral-450 rounded-lg transition-colors border border-neutral-800"
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
