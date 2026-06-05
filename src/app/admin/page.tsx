"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { ShieldCheck, LogIn, LogOut, Key, FolderKanban, Users, Settings as SettingsIcon, CheckCircle2, AlertTriangle, ArrowRight, Activity, GitCommit } from "lucide-react";
import { Github } from "@/components/brand-icons";
import { useGitHub } from "@/hooks/use-github";
import projectsData from "@data/projects.json";
import developersData from "@data/developers.json";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession() as any;
  const { token, repoOwner, repoName, branch, isClientMode, saveConfig, clearConfig } = useGitHub();

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

  // Check if authenticated in either mode
  const isAuthorized = () => {
    if (!mounted) return false;
    // Server mode check (NextAuth session)
    if (authStatus === "authenticated" && session) {
      return true;
    }
    // Client mode check (Local PAT)
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
        <div className="max-w-md w-full space-y-8 p-8 bg-neutral-900/40 border border-neutral-850 rounded-2xl backdrop-blur-md">
          
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-white tracking-tight">Admin Gatekeeper</h2>
            <p className="mt-2 text-sm text-neutral-450">
              Sign in to manage projects, developers, site configurations, and upload assets.
            </p>
          </div>

          {/* Toggle Login Method tabs */}
          <div className="grid grid-cols-2 gap-2 bg-neutral-950 p-1 rounded-lg border border-neutral-850">
            <button
              onClick={() => setUseLocalPat(true)}
              className={`py-1.5 text-xs font-bold rounded-md transition-all ${
                useLocalPat
                  ? "bg-neutral-900 text-indigo-400 shadow border border-neutral-800"
                  : "text-neutral-500 hover:text-neutral-350"
              }`}
            >
              Option A: GitHub PAT (Static Pages)
            </button>
            <button
              onClick={() => setUseLocalPat(false)}
              className={`py-1.5 text-xs font-bold rounded-md transition-all ${
                !useLocalPat
                  ? "bg-neutral-900 text-indigo-400 shadow border border-neutral-800"
                  : "text-neutral-500 hover:text-neutral-350"
              }`}
            >
              Option B: OAuth (Server Hosting)
            </button>
          </div>

          {useLocalPat ? (
            /* Option A: Client-side PAT Form */
            <form onSubmit={handlePatSubmit} className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                    GitHub Personal Access Token (PAT)
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                      type="password"
                      placeholder="ghp_xxxxxxxxxxxx"
                      value={patInput}
                      onChange={(e) => setPatInput(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-300 placeholder-neutral-600 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-neutral-550 mt-1">Requires 'repo' scope access permission.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                      Repo Owner
                    </label>
                    <input
                      type="text"
                      placeholder="Username"
                      value={ownerInput}
                      onChange={(e) => setOwnerInput(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-300 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                      Repo Name
                    </label>
                    <input
                      type="text"
                      placeholder="Repository"
                      value={repoInput}
                      onChange={(e) => setRepoInput(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-300 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                    Target Branch
                  </label>
                  <input
                    type="text"
                    value={branchInput}
                    onChange={(e) => setBranchInput(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-300 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold rounded-lg shadow-lg hover:shadow-indigo-500/10 transition-all text-white"
              >
                <LogIn className="w-4 h-4" />
                <span>Save credentials</span>
              </button>
            </form>
          ) : (
            /* Option B: NextAuth OAuth Login */
            <div className="space-y-4">
              <button
                onClick={() => signIn("github")}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-neutral-950 border border-neutral-800 hover:bg-neutral-850 hover:text-white rounded-lg text-sm font-semibold text-neutral-300 transition-all"
              >
                <Github className="w-5 h-5" />
                <span>Sign in with GitHub</span>
              </button>
              <p className="text-[10px] text-center text-neutral-550 leading-relaxed">
                Enforces that your GitHub username matches authorized profile logins configured inside environment scopes.
              </p>
            </div>
          )}

        </div>
      </div>
    );
  }

  // Find featured statistics
  const featuredCount = projectsData.filter((p) => p.featured).length;

  return (
    <div className="min-h-screen bg-neutral-950 text-white py-16 selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-900 pb-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
              Admin Workspace Overview
            </h1>
            <p className="text-sm text-neutral-450">
              Perform Git-based CMS updates and content commits directly.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Display Active Authentication Status */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-semibold text-neutral-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Signed in via {token ? "PAT Token" : `OAuth (${session?.user?.username})`}</span>
            </div>
            
            <button
              onClick={token ? handleLogoutPat : () => signOut()}
              className="flex items-center gap-1 px-3 py-1 bg-red-950 hover:bg-red-900 text-xs font-semibold text-red-300 rounded-lg transition-colors border border-red-900/30"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>

        {/* Sync & Target Repo Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 flex items-center justify-between p-5 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-indigo-400">
                <GitCommit className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Repository Sync Connection</h4>
                <p className="text-xs text-neutral-400 mt-1 font-mono">
                  {repoOwner || "RasikhAli"}/{repoName || "rasikhali.github.io"} [{branch || "main"}]
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
              CONNECTED
            </span>
          </div>

          <div className="flex items-center gap-3 p-5 bg-neutral-900/40 border border-neutral-850 rounded-xl backdrop-blur-md">
            <Activity className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">CMS Mode</div>
              <div className="text-sm font-semibold text-neutral-250 mt-0.5">
                {token ? "Browser direct commits" : "Secure API proxies"}
              </div>
            </div>
          </div>
        </div>

        {/* Overview metrics cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-neutral-900/40 border border-neutral-850 p-6 rounded-xl backdrop-blur-md">
            <div className="text-neutral-505 text-xs font-bold uppercase tracking-wider mb-2">Projects Catalogue</div>
            <div className="text-3xl font-extrabold text-white">{projectsData.length}</div>
          </div>
          <div className="bg-neutral-900/40 border border-neutral-850 p-6 rounded-xl backdrop-blur-md">
            <div className="text-neutral-505 text-xs font-bold uppercase tracking-wider mb-2">Developers Registered</div>
            <div className="text-3xl font-extrabold text-white">{developersData.length}</div>
          </div>
          <div className="bg-neutral-900/40 border border-neutral-850 p-6 rounded-xl backdrop-blur-md">
            <div className="text-neutral-505 text-xs font-bold uppercase tracking-wider mb-2">Featured Projects</div>
            <div className="text-3xl font-extrabold text-white">{featuredCount}</div>
          </div>
        </div>

        {/* Dashboard Modules / Quick Navigation Links */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white">Management Modules</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* Projects Management Card */}
            <div className="group border border-neutral-850 bg-neutral-900/20 hover:border-neutral-700/60 p-6 rounded-xl transition-all flex flex-col justify-between h-48">
              <div>
                <div className="p-3 bg-neutral-850 rounded-lg text-indigo-400 border border-neutral-800 w-fit mb-4">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">Manage Projects</h4>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  Add new project showcases, update stack/screenshot gallery, and assign developers.
                </p>
              </div>
              <button
                onClick={() => router.push("/admin/projects")}
                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 mt-4 self-start"
              >
                <span>Launch editor</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Developers Management Card */}
            <div className="group border border-neutral-850 bg-neutral-900/20 hover:border-neutral-700/60 p-6 rounded-xl transition-all flex flex-col justify-between h-48">
              <div>
                <div className="p-3 bg-neutral-850 rounded-lg text-indigo-400 border border-neutral-800 w-fit mb-4">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">Manage Developers</h4>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  Create profiles, design roles/designations, write bios, and detail key skill lists.
                </p>
              </div>
              <button
                onClick={() => router.push("/admin/developers")}
                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 mt-4 self-start"
              >
                <span>Launch editor</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Site Configuration Card */}
            <div className="group border border-neutral-850 bg-neutral-900/20 hover:border-neutral-700/60 p-6 rounded-xl transition-all flex flex-col justify-between h-48">
              <div>
                <div className="p-3 bg-neutral-850 rounded-lg text-indigo-400 border border-neutral-800 w-fit mb-4">
                  <SettingsIcon className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">Site Settings</h4>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  Configure site headings, portfolio titles, resume/contact details, and search indexes.
                </p>
              </div>
              <button
                onClick={() => router.push("/admin/settings")}
                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 mt-4 self-start"
              >
                <span>Launch editor</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
