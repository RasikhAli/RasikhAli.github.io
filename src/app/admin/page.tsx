"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { ShieldCheck, LogIn, LogOut, Key, FolderKanban, Users, Settings as SettingsIcon, CheckCircle2, ArrowRight, Activity, GitCommit, MessageSquare } from "lucide-react";
import { Github } from "@/components/brand-icons";
import { useGitHub } from "@/hooks/use-github";
import { StatCounter } from "@/components/ui/stat-counter";
import type { Project } from "@/lib/schemas";
import projectsData from "@data/projects.json";
import developersData from "@data/developers.json";

export default function AdminDashboardPage() {
  const router = useRouter();
  const sessionHook = useSession() as any;
  const session = sessionHook?.data;
  const authStatus = sessionHook?.status;
  const { token, repoOwner, repoName, branch, saveConfig, clearConfig } = useGitHub();

  // Local state for PAT configuration form
  const [patInput, setPatInput] = useState("");
  const [ownerInput, setOwnerInput] = useState("RasikhAli");
  const [repoInput, setRepoInput] = useState("rasikhali.github.io");
  const [branchInput, setBranchInput] = useState("main");
  const [useLocalPat, setUseLocalPat] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (token) {
      setPatInput(token);
    }
    if (repoOwner) setOwnerInput(repoOwner);
    if (repoName) setRepoInput(repoName);
    if (branch) setBranchInput(branch);
  }, [token, repoOwner, repoName, branch]);

  const handlePatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patInput.trim()) {
      alert("Please provide a valid GitHub Personal Access Token");
      return;
    }
    saveConfig(patInput.trim(), ownerInput.trim(), repoInput.trim(), branchInput.trim(), "client");
    alert("GitHub PAT configuration saved successfully!");
  };

  const handleLogoutPat = () => {
    clearConfig();
    setPatInput("");
  };

  const isAuthorized = () => {
    if (!mounted) return false;
    if (authStatus === "authenticated" && session) {
      return true;
    }
    if (useLocalPat && token) {
      return true;
    }
    return false;
  };

  if (!mounted) return null;

  // Render Login Panel if not authorized
  if (!isAuthorized()) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-indigo-500/30">
        <div className="max-w-md w-full space-y-8 p-8 bg-neutral-900/60 border border-neutral-800 rounded-3xl backdrop-blur-md shadow-2xl">
          
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h2 className="mt-6 text-3xl font-black text-white tracking-tight">Admin Control Center</h2>
            <p className="mt-2 text-xs text-neutral-400 font-medium">
              Authenticate to manage projects, developers, site configurations, and live GitHub commits.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-neutral-950 p-1.5 rounded-xl border border-neutral-800">
            <button
              onClick={() => setUseLocalPat(true)}
              className={`py-2 text-xs font-extrabold rounded-lg transition-all ${
                useLocalPat
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              GitHub PAT Access
            </button>
            <button
              onClick={() => setUseLocalPat(false)}
              className={`py-2 text-xs font-extrabold rounded-lg transition-all ${
                !useLocalPat
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              OAuth Server Login
            </button>
          </div>

          {useLocalPat ? (
            <form onSubmit={handlePatSubmit} className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-1.5">
                    GitHub Personal Access Token (PAT)
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                      type="password"
                      placeholder="ghp_xxxxxxxxxxxx"
                      value={patInput}
                      onChange={(e) => setPatInput(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-1.5">
                      Repo Owner
                    </label>
                    <input
                      type="text"
                      placeholder="Username"
                      value={ownerInput}
                      onChange={(e) => setOwnerInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-1.5">
                      Repo Name
                    </label>
                    <input
                      type="text"
                      placeholder="Repository"
                      value={repoInput}
                      onChange={(e) => setRepoInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-1.5">
                    Target Branch
                  </label>
                  <input
                    type="text"
                    value={branchInput}
                    onChange={(e) => setBranchInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-xs font-extrabold rounded-xl shadow-lg shadow-indigo-600/20 transition-all text-white mt-4"
              >
                <LogIn className="w-4 h-4" />
                <span>Save & Authenticate</span>
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <button
                onClick={() => signIn("github")}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-neutral-950 border border-neutral-800 hover:bg-neutral-800 rounded-xl text-xs font-extrabold text-neutral-200 hover:text-white transition-all"
              >
                <Github className="w-5 h-5" />
                <span>Sign in with GitHub OAuth</span>
              </button>
            </div>
          )}

        </div>
      </div>
    );
  }

  const featuredCount = (projectsData as Project[]).filter((p) => p.featured).length;

  return (
    <div className="min-h-screen bg-neutral-950 text-white py-16 selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-900 pb-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent">
              Admin Workspace Overview
            </h1>
            <p className="text-xs text-neutral-400 font-medium">
              Perform Git-based CMS updates and content commits directly.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-bold text-neutral-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Signed in via {token ? "PAT Token" : `OAuth (${session?.user?.username})`}</span>
            </div>
            
            <button
              onClick={token ? handleLogoutPat : () => signOut()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-xs font-bold text-rose-400 rounded-xl transition-colors border border-rose-500/20"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>

        {/* Sync & Target Repo Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 flex items-center justify-between p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30 text-indigo-400">
                <GitCommit className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white">Repository Sync Connection</h4>
                <p className="text-xs text-neutral-400 mt-1 font-mono">
                  {repoOwner || "RasikhAli"}/{repoName || "rasikhali.github.io"} [{branch || "main"}]
                </p>
              </div>
            </div>
            <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full">
              CONNECTED
            </span>
          </div>

          <div className="flex items-center gap-4 p-6 bg-neutral-900/60 border border-neutral-800 rounded-2xl backdrop-blur-md">
            <Activity className="w-6 h-6 text-indigo-400 shrink-0" />
            <div>
              <div className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider">CMS Mode</div>
              <div className="text-sm font-extrabold text-neutral-200 mt-0.5">
                {token ? "Direct GitHub Commits" : "API Proxy Mode"}
              </div>
            </div>
          </div>
        </div>

        {/* Overview metrics cards with animated countup */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-neutral-900/60 border border-neutral-800 p-6 rounded-2xl backdrop-blur-md">
            <StatCounter value={projectsData.length} label="Projects Catalogue" className="text-white" />
          </div>
          <div className="bg-neutral-900/60 border border-neutral-800 p-6 rounded-2xl backdrop-blur-md">
            <StatCounter value={developersData.length} label="Developers Registered" className="text-white" />
          </div>
          <div className="bg-neutral-900/60 border border-neutral-800 p-6 rounded-2xl backdrop-blur-md">
            <StatCounter value={featuredCount} label="Featured Projects" className="text-white" />
          </div>
        </div>

        {/* Dashboard Management Links */}
        <div className="space-y-6">
          <h3 className="text-xl font-extrabold text-white">Management Modules</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="group border border-neutral-800 bg-neutral-900/40 hover:border-indigo-500/40 p-6 rounded-2xl transition-all flex flex-col justify-between h-52 backdrop-blur-md">
              <div>
                <div className="p-3 bg-neutral-950 rounded-xl text-indigo-400 border border-neutral-800 w-fit mb-4">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <h4 className="text-base font-extrabold text-white group-hover:text-indigo-400 transition-colors">Manage Projects</h4>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Add/edit projects, upload screenshots, and manage tech stacks.
                </p>
              </div>
              <button
                onClick={() => router.push("/admin/projects")}
                className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-400 hover:text-indigo-300 mt-4 self-start"
              >
                <span>Launch editor</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="group border border-neutral-800 bg-neutral-900/40 hover:border-indigo-500/40 p-6 rounded-2xl transition-all flex flex-col justify-between h-52 backdrop-blur-md">
              <div>
                <div className="p-3 bg-neutral-950 rounded-xl text-indigo-400 border border-neutral-800 w-fit mb-4">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="text-base font-extrabold text-white group-hover:text-indigo-400 transition-colors">Manage Developers</h4>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Edit developer profiles, assigned roles, bio descriptions, and skills.
                </p>
              </div>
              <button
                onClick={() => router.push("/admin/developers")}
                className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-400 hover:text-indigo-300 mt-4 self-start"
              >
                <span>Launch editor</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="group border border-neutral-800 bg-neutral-900/40 hover:border-indigo-500/40 p-6 rounded-2xl transition-all flex flex-col justify-between h-52 backdrop-blur-md">
              <div>
                <div className="p-3 bg-neutral-950 rounded-xl text-indigo-400 border border-neutral-800 w-fit mb-4">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h4 className="text-base font-extrabold text-white group-hover:text-indigo-400 transition-colors">Testimonials</h4>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Configure Google Sheet links, display toggles, and rating visibility.
                </p>
              </div>
              <button
                onClick={() => router.push("/admin/testimonials")}
                className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-400 hover:text-indigo-300 mt-4 self-start"
              >
                <span>Launch editor</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="group border border-neutral-800 bg-neutral-900/40 hover:border-indigo-500/40 p-6 rounded-2xl transition-all flex flex-col justify-between h-52 backdrop-blur-md">
              <div>
                <div className="p-3 bg-neutral-950 rounded-xl text-indigo-400 border border-neutral-800 w-fit mb-4">
                  <SettingsIcon className="w-5 h-5" />
                </div>
                <h4 className="text-base font-extrabold text-white group-hover:text-indigo-400 transition-colors">Site Settings</h4>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Manage portfolio titles, bio headers, contact emails, and social links.
                </p>
              </div>
              <button
                onClick={() => router.push("/admin/settings")}
                className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-400 hover:text-indigo-300 mt-4 self-start"
              >
                <span>Launch editor</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
