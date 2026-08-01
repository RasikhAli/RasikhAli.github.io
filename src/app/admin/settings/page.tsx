"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Settings as SettingsIcon, AlertCircle, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { siteConfigSchema, SiteConfig } from "@/lib/schemas";
import { useGitHub } from "@/hooks/use-github";
import siteConfigData from "../../../../data/site-config.json";

export default function AdminSettingsPage() {
  const router = useRouter();
  const { updateSiteConfig, status, statusMessage, errorMsg } = useGitHub();
  const [successMsg, setSuccessMsg] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SiteConfig>({
    resolver: zodResolver(siteConfigSchema) as any,
    defaultValues: siteConfigData as SiteConfig,
  });

  const onSubmit = async (data: SiteConfig) => {
    setSuccessMsg("");
    if (typeof data.seo_defaults.keywords === "string") {
      data.seo_defaults.keywords = (data.seo_defaults.keywords as string)
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);
    }

    const success = await updateSiteConfig(data);
    if (success) {
      setSuccessMsg("Site configuration committed and saved successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
    }
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-indigo-500/30">
      <div className="fixed top-0 left-0 w-full h-[600px] -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.08),transparent)] pointer-events-none" />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 space-y-10">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-neutral-900 pb-5">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Admin Dashboard</span>
          </Link>
        </div>

        {/* Header Title */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
              <SettingsIcon className="w-6 h-6 text-indigo-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">Site Settings</h1>
          </div>
          <p className="text-xs text-neutral-400 ml-[3.25rem]">
            Manage portfolio owner details, bio headers, contact emails, social links, and SEO metadata.
          </p>
        </div>

        {/* Feedback Messages */}
        {successMsg && (
          <div className="flex items-center gap-2.5 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs text-emerald-400 font-bold animate-in fade-in duration-200">
            <Sparkles className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-center gap-2.5 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs text-rose-400 font-bold animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMsg}</span>
          </div>
        )}

        {status === "loading" && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-900 p-8 text-center shadow-2xl">
              <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-indigo-400" />
              <h3 className="text-lg font-extrabold text-white">Publishing Changes</h3>
              <p className="mt-2 text-xs text-neutral-400">{statusMessage || "Committing your settings to GitHub..."}</p>
            </div>
          </div>
        )}

        {/* Settings Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-neutral-900/40 border border-neutral-800 p-8 rounded-3xl backdrop-blur-md shadow-xl">
          
          {/* Section: Basic Settings */}
          <div className="space-y-5">
            <h3 className="text-xs font-extrabold text-indigo-400 uppercase tracking-wider border-b border-neutral-800 pb-2">
              Basic Profile Config
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-1.5">Portfolio Owner Name</label>
                <input
                  type="text"
                  {...register("portfolio_owner_name")}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
                {errors.portfolio_owner_name && <p className="text-xs text-rose-500 mt-1">{errors.portfolio_owner_name.message}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-1.5">Contact Email</label>
                <input
                  type="email"
                  {...register("contact_email")}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
                {errors.contact_email && <p className="text-xs text-rose-500 mt-1">{errors.contact_email.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-1.5">Site Title</label>
                <input
                  type="text"
                  {...register("site_title")}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
                {errors.site_title && <p className="text-xs text-rose-500 mt-1">{errors.site_title.message}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-1.5">Resume File URL</label>
                <input
                  type="text"
                  {...register("resume_url")}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-1.5">Hero Profile Bio</label>
              <textarea
                rows={3}
                {...register("profile_bio")}
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Section: Social Profiles */}
          <div className="space-y-5 pt-4">
            <h3 className="text-xs font-extrabold text-indigo-400 uppercase tracking-wider border-b border-neutral-800 pb-2">
              Social Profiles & Handles
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-1.5">GitHub URL</label>
                <input
                  type="url"
                  {...register("github_url")}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-1.5">LinkedIn URL</label>
                <input
                  type="url"
                  {...register("linkedin_url")}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-1.5">Twitter / X URL</label>
                <input
                  type="url"
                  {...register("twitter_url")}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section: SEO Defaults */}
          <div className="space-y-5 pt-4">
            <h3 className="text-xs font-extrabold text-indigo-400 uppercase tracking-wider border-b border-neutral-800 pb-2">
              SEO & OpenGraph Metadata
            </h3>

            <div>
              <label className="block text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-1.5">Meta Description</label>
              <textarea
                rows={2}
                {...register("seo_defaults.description")}
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-4 border-t border-neutral-800">
            <button
              type="submit"
              disabled={status === "loading"}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-extrabold transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save & Commit Site Settings</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
