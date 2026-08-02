"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Edit2, Trash2, X, Users, AlertCircle, Loader2, Sparkles, Wand2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { developerSchema, Developer } from "@/lib/schemas";
import { useGitHub } from "@/hooks/use-github";
import { Octokit } from "octokit";
import { Badge } from "@/components/ui/badge";
import initialDevelopers from "../../../../data/developers.json";

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function AdminDevelopersPage() {
  const { updateDevelopersList, status, errorMsg, token } = useGitHub();
  
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [editingDev, setEditingDev] = useState<Developer | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
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

        let octokit = new Octokit(token ? { auth: token.trim() } : {});
        let user;
        try {
          user = await octokit.rest.users.getByUsername({ username });
        } catch (err: any) {
          if (err.status === 401 && token) {
            octokit = new Octokit({});
            user = await octokit.rest.users.getByUsername({ username });
          } else {
            throw err;
          }
        }
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
      } else {
        throw new Error("Please provide a GitHub profile URL for auto-fill.");
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
      data.updated_at = timestamp;
      updatedList = developers.map((d) => (d.id === editingDev.id ? data : d));
    } else {
      data.created_at = timestamp;
      data.updated_at = timestamp;
      
      if (developers.some((d) => d.id === data.id)) {
        alert("A developer with this ID already exists.");
        return;
      }
      updatedList = [...developers, data];
    }

    const action = editingDev ? "Update" : "Create";
    const success = await updateDevelopersList(updatedList, action, data.name);
    if (success) {
      setDevelopers(updatedList);
      setIsFormOpen(false);
      setSuccessMsg(`Developer "${data.name}" saved successfully!`);
      setTimeout(() => setSuccessMsg(""), 4000);
    }
  };

  const handleDelete = async (dev: Developer) => {
    if (!confirm(`Are you sure you want to delete ${dev.name}?`)) {
      return;
    }

    setSuccessMsg("");
    const updatedList = developers.filter((d) => d.id !== dev.id);
    const success = await updateDevelopersList(updatedList, "Delete", dev.name);
    if (success) {
      setDevelopers(updatedList);
      setSuccessMsg(`Developer "${dev.name}" removed successfully!`);
      setTimeout(() => setSuccessMsg(""), 4000);
    }
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
            <span>Add Developer</span>
          </button>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
              <Users className="w-6 h-6 text-indigo-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">Manage Developers</h1>
          </div>
          <p className="text-xs text-neutral-400 ml-[3.25rem]">
            Create profiles, design roles/designations, write bios, and detail key skill lists.
          </p>
        </div>

        {/* Alerts */}
        {successMsg && (
          <div className="flex items-center gap-2.5 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs text-emerald-400 font-bold">
            <Sparkles className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-start gap-2.5 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs text-rose-400 font-bold">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Rows with Animated Deletion Collapse */}
        <div className="space-y-3">
          <AnimatePresence>
            {developers.map((dev) => (
              <motion.div
                key={dev.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700/80 rounded-2xl gap-4 transition-all backdrop-blur-md">
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={dev.avatar}
                      alt={dev.name}
                      className="w-12 h-12 rounded-full object-cover border border-neutral-800 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold text-white group-hover:text-indigo-400 transition-colors truncate">
                          {dev.name}
                        </h3>
                        {dev.featured && (
                          <Badge variant="primary" className="text-[9px]">Featured</Badge>
                        )}
                      </div>
                      <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider mt-0.5">{dev.designation}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => openEditForm(dev)}
                      className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-neutral-300 hover:text-white transition-all text-xs font-bold flex items-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(dev)}
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

        {/* Form Modal */}
        <AnimatePresence>
          {isFormOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 relative"
              >
                <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
                  <h3 className="text-xl font-extrabold text-white">
                    {editingDev ? `Edit Developer: ${editingDev.name}` : "Create Developer Entry"}
                  </h3>
                  <button
                    onClick={() => setIsFormOpen(false)}
                    className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-1.5">Developer Name</label>
                      <input
                        type="text"
                        {...register("name")}
                        placeholder="Rasikh Ali"
                        className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-1.5">Designation / Role</label>
                      <input
                        type="text"
                        {...register("designation")}
                        placeholder="Software Engineer & Lecturer"
                        className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-1.5">Avatar Image URL</label>
                    <input
                      type="text"
                      {...register("avatar")}
                      placeholder="https://github.com/RasikhAli.png"
                      className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-1.5">Biography & Summary</label>
                    <textarea
                      rows={4}
                      {...register("bio")}
                      placeholder="Passionate engineer building software..."
                      className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-1.5">GitHub Profile URL</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          {...register("github_url")}
                          placeholder="https://github.com/RasikhAli"
                          className="flex-1 px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200 focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => autoFillProfile()}
                          className="px-3 py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-xl text-xs font-bold border border-indigo-500/20 flex items-center gap-1 shrink-0"
                          title="Auto-fill profile from GitHub"
                        >
                          <Wand2 className="w-3.5 h-3.5" />
                          <span>Fetch</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-1.5">LinkedIn Profile URL</label>
                      <input
                        type="text"
                        {...register("linkedin_url")}
                        placeholder="https://linkedin.com/in/rasikhali"
                        className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

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
