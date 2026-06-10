"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Plus, Edit2, Trash2, X, Users, AlertCircle, Loader2, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { developerSchema, Developer } from "@/lib/schemas";
import { useGitHub } from "@/hooks/use-github";
import { Octokit } from "octokit";
import initialDevelopers from "../../../../data/developers.json";

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function AdminDevelopersPage() {
  const { updateDevelopersList, status, statusMessage, errorMsg, token, repoOwner } = useGitHub();
  
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [editingDev, setEditingDev] = useState<Developer | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Load from local storage sync fallback if existing, or default file import
    setDevelopers(initialDevelopers as Developer[]);
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Developer>({
    resolver: zodResolver(developerSchema) as any,
  });

  const watchedName = watch("name");
  const watchedId = watch("id");
  const watchedGitHub = watch("github_url");
  const watchedLinkedIn = watch("linkedin_url");

  useEffect(() => {
    if (!editingDev && watchedName && !watchedId) {
      setValue("id", slugify(watchedName));
    }
  }, [watchedName, watchedId, editingDev, setValue]);

  const autoFillProfile = async (sourceUrl?: string) => {
    const urlToUse = sourceUrl || watchedGitHub || watchedLinkedIn;
    if (!urlToUse) return;

    try {
      let data: any = {};

      if (urlToUse.includes("github.com")) {
        const usernameMatch = urlToUse.match(/github\.com\/([^/?#]+)/);
        if (!usernameMatch) throw new Error("Invalid GitHub URL format.");
        const username = usernameMatch[1];

        if (!token) throw new Error("GitHub PAT is required for auto-fill. Configure it in Admin Settings.");

        const octokit = new Octokit({ auth: token });
        const user = await octokit.rest.users.getByUsername({ username });
        const userData = user.data;

        data.avatar = userData.avatar_url || "";
        data.bio = userData.bio || "";
        data.name = userData.name || userData.login || "";
        data.id = slugify(data.name || username);

        try {
          const repos = await octokit.rest.repos.listForUser({ username, per_page: 100 });
          const langs = new Set<string>();
          repos.data.forEach((repo: any) => {
            if (repo.language) langs.add(repo.language);
          });
          data.skills = Array.from(langs).slice(0, 10);
        } catch {
          data.skills = [];
        }
      } else if (urlToUse.includes("linkedin.com")) {
        throw new Error("LinkedIn auto-fill is not available without OAuth. Please fill in avatar, bio, and skills manually.");
      } else {
        throw new Error("Please provide a GitHub or LinkedIn profile URL for auto-fill.");
      }

      if (!watch("avatar") && data.avatar) setValue("avatar", data.avatar);
      if (!watch("bio") && data.bio) setValue("bio", data.bio);
      if (!watch("name") && data.name) setValue("name", data.name);
      if (!watch("skills")?.length && data.skills?.length) setValue("skills", data.skills);
      if (!watch("id") && data.id) setValue("id", data.id);
    } catch (error: any) {
      alert(error.message || "Unable to fetch profile details right now.");
    }
  };

  const openCreateForm = () => {
    setEditingDev(null);
    reset({
      id: "",
      name: "",
      designation: "",
      avatar: "",
      bio: "",
      email: "",
      github_url: "",
      linkedin_url: "",
      portfolio_url: "",
      skills: [],
      featured: false,
    });
    setIsFormOpen(true);
  };

  const openEditForm = (dev: Developer) => {
    setEditingDev(dev);
    reset(dev);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: Developer) => {
    setSuccessMsg("");
    let updatedList: Developer[] = [];
    const timestamp = new Date().toISOString();

    if (editingDev) {
      // Edit mode
      data.updated_at = timestamp;
      updatedList = developers.map((d) => (d.id === editingDev.id ? data : d));
    } else {
      // Create mode
      data.created_at = timestamp;
      data.updated_at = timestamp;
      
      // Check if id already exists
      if (developers.some((d) => d.id === data.id)) {
        alert("A developer with this ID already exists. Please choose a unique lowercase ID.");
        return;
      }
      updatedList = [...developers, data];
    }

    const action = editingDev ? "Update" : "Create";
    const success = await updateDevelopersList(updatedList, action, data.name);
    if (success) {
      setDevelopers(updatedList);
      setIsFormOpen(false);
      setSuccessMsg(`Developer ${data.name} saved and committed successfully!`);
      setTimeout(() => setSuccessMsg(""), 4000);
    }
  };

  const handleDelete = async (dev: Developer) => {
    if (!confirm(`Are you sure you want to delete ${dev.name}? This will commit changes directly to the repository.`)) {
      return;
    }

    setSuccessMsg("");
    const updatedList = developers.filter((d) => d.id !== dev.id);
    const success = await updateDevelopersList(updatedList, "Delete", dev.name);
    if (success) {
      setDevelopers(updatedList);
      setSuccessMsg(`Developer ${dev.name} removed successfully!`);
      setTimeout(() => setSuccessMsg(""), 4000);
    }
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
            <span>Add Developer</span>
          </button>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <Users className="w-8 h-8 text-indigo-400" />
            <span>Manage Developers</span>
          </h1>
          <p className="text-sm text-neutral-455">
            Create profiles, designations, biographies, and skills lists for active developers.
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

        {/* Developer Creation/Editing Modal Overlay */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200">
              
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
                <h3 className="text-lg font-bold text-white">
                  {editingDev ? `Edit Profile: ${editingDev.name}` : "Create Developer Profile"}
                </h3>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-1 rounded-md text-neutral-450 hover:text-white hover:bg-neutral-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Developer Input Form */}
              <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                
                {/* ID and Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Unique ID (e.g. rasikh-ali)</label>
                    <input
                      type="text"
                      disabled={!!editingDev}
                      {...register("id")}
                      placeholder="lowercase-with-hyphens"
                      className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-850 rounded-lg text-sm text-neutral-300 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                    />
                    {errors.id && <p className="text-xs text-red-500 mt-1">{errors.id.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Display Name</label>
                    <input
                      type="text"
                      {...register("name")}
                      onBlur={(e) => {
                        register("name").onBlur(e);
                        if (!watch("id")) setValue("id", slugify(e.target.value));
                      }}
                      placeholder="John Doe"
                      className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-850 rounded-lg text-sm text-neutral-300 focus:outline-none focus:border-indigo-500"
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                  </div>
                </div>

                {/* Designation and Avatar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Designation / Role</label>
                    <input
                      type="text"
                      {...register("designation")}
                      placeholder="Backend Lead"
                      className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-850 rounded-lg text-sm text-neutral-300 focus:outline-none focus:border-indigo-500"
                    />
                    {errors.designation && <p className="text-xs text-red-500 mt-1">{errors.designation.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Avatar Image URL</label>
                    <input
                      type="text"
                      {...register("avatar")}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-850 rounded-lg text-sm text-neutral-350 focus:outline-none focus:border-indigo-500"
                    />
                    {errors.avatar && <p className="text-xs text-red-500 mt-1">{errors.avatar.message}</p>}
                  </div>
                </div>

                {/* Biography */}
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Developer Bio</label>
                  <textarea
                    rows={3}
                    {...register("bio")}
                    placeholder="Provide a short professional summary..."
                    className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-850 rounded-lg text-sm text-neutral-350 focus:outline-none focus:border-indigo-500"
                  />
                  {errors.bio && <p className="text-xs text-red-500 mt-1">{errors.bio.message}</p>}
                </div>

                {/* Connections Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Email Address</label>
                    <input
                      type="email"
                      {...register("email")}
                      placeholder="name@domain.com"
                      className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-850 rounded-lg text-sm text-neutral-350 focus:outline-none focus:border-indigo-500"
                    />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">GitHub URL</label>
                    <input
                      type="text"
                      {...register("github_url")}
                      onBlur={(e) => {
                        register("github_url").onBlur(e);
                        if (e.target.value) autoFillProfile(e.target.value);
                      }}
                      placeholder="https://github.com/username"
                      className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-850 rounded-lg text-sm text-neutral-350 focus:outline-none focus:border-indigo-500"
                    />
                    {errors.github_url && <p className="text-xs text-red-500 mt-1">{errors.github_url.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">LinkedIn URL</label>
                    <input
                      type="text"
                      {...register("linkedin_url")}
                      onBlur={(e) => {
                        register("linkedin_url").onBlur(e);
                        if (e.target.value) autoFillProfile(e.target.value);
                      }}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-850 rounded-lg text-sm text-neutral-355 focus:outline-none focus:border-indigo-500"
                    />
                    {errors.linkedin_url && <p className="text-xs text-red-500 mt-1">{errors.linkedin_url.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Portfolio URL</label>
                    <input
                      type="text"
                      {...register("portfolio_url")}
                      placeholder="https://dev.domain"
                      className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-850 rounded-lg text-sm text-neutral-355 focus:outline-none focus:border-indigo-500"
                    />
                    {errors.portfolio_url && <p className="text-xs text-red-500 mt-1">{errors.portfolio_url.message}</p>}
                  </div>
                </div>

                <p className="text-[11px] text-neutral-500">Tip: GitHub or LinkedIn links auto-fill avatar, bio, and skills when available. Unique ID is generated from the name if you leave it blank.</p>

                {/* Skills tags selection */}
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                    Skills / Core tags (Comma Separated)
                  </label>
                  <input
                    type="text"
                    placeholder="React, Next.js, Node.js, CSS"
                    defaultValue={editingDev ? editingDev.skills.join(", ") : ""}
                    onChange={(e) => {
                      const list = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                      setValue("skills", list);
                    }}
                    className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-850 rounded-lg text-sm text-neutral-300 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Feature switch */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured-checkbox"
                    {...register("featured")}
                    className="w-4.5 h-4.5 accent-indigo-650 bg-neutral-950 border-neutral-800 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="featured-checkbox" className="text-sm font-semibold text-neutral-300">
                    Feature on Homepage Dashboard
                  </label>
                </div>

                {/* Submit Panel */}
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
                        <span>Save Profile</span>
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

        {/* Existing Developers List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {developers.map((dev) => (
            <div
              key={dev.id}
              className="bg-neutral-900/40 border border-neutral-850 rounded-xl p-5 backdrop-blur-md hover:border-neutral-800 flex items-start justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <img
                  src={dev.avatar}
                  alt={dev.name}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-neutral-800"
                />
                <div>
                  <h3 className="font-bold text-white text-base">{dev.name}</h3>
                  <p className="text-xs text-indigo-400 font-medium mt-0.5">{dev.designation}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {dev.skills.slice(0, 3).map((s) => (
                      <span key={s} className="text-[10px] bg-neutral-850 text-neutral-450 px-1.5 py-0.5 rounded">
                        {s}
                      </span>
                    ))}
                    {dev.skills.length > 3 && (
                      <span className="text-[10px] bg-neutral-850 text-neutral-500 px-1.5 py-0.5 rounded">
                        +{dev.skills.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action operations buttons */}
              <div className="flex gap-1">
                <button
                  onClick={() => openEditForm(dev)}
                  className="p-2 bg-neutral-850 hover:bg-neutral-800 hover:text-indigo-400 text-neutral-450 rounded-lg transition-colors border border-neutral-800"
                  title="Edit profile"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(dev)}
                  className="p-2 bg-neutral-850 hover:bg-red-950 hover:text-red-400 text-neutral-450 rounded-lg transition-colors border border-neutral-800"
                  title="Delete developer profile"
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
