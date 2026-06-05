"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Settings, AlertCircle, Sparkles } from "lucide-react";
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

  // Form Setup
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SiteConfig>({
    resolver: zodResolver(siteConfigSchema),
    defaultValues: siteConfigData as SiteConfig,
  });

  const onSubmit = async (data: SiteConfig) => {
    setSuccessMsg("");
    // Ensure keywords list is properly formatted as array if it got edited as string
    if (typeof data.seo_defaults.keywords === "string") {
      data.seo_defaults.keywords = (data.seo_defaults.keywords as string)
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);
    }

    const success = await updateSiteConfig(data);
    if (success) {
      setSuccessMsg("Site configuration committed and saved successfully!");
      // Flash success message
      setTimeout(() => setSuccessMsg(""), 4000);
    }
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-neutral-950 text-white py-16 selection:bg-indigo-500/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-sm font-semibold text-neutral-450 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Admin Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-neutral-900 text-neutral-400 border border-neutral-800 px-2.5 py-1 rounded">
              SITE SETTINGS EDITOR
            </span>
          </div>
        </div>

        {/* Header Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Settings className="w-8 h-8 text-indigo-400" />
            <span>Site Configuration</span>
          </h1>
          <p className="text-sm text-neutral-450">
            Edit details like Site Headline, socials, resume file link, and default SEO parameters.
          </p>
        </div>

        {/* Feedback Messages */}
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

        {status === "loading" && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-center shadow-2xl">
              <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-indigo-400" />
              <h3 className="text-lg font-semibold text-white">Publishing update</h3>
              <p className="mt-2 text-sm text-neutral-400">{statusMessage || "Saving your changes and waiting for the GitHub Pages deployment to finish."}</p>
            </div>
          </div>
        )}

        {/* Settings Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-neutral-900/20 border border-neutral-850 p-8 rounded-2xl backdrop-blur-md">
          
          {/* Section: Basic Settings */}
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider border-b border-neutral-850 pb-2">
              Basic Config
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Portfolio Owner Name</label>
                <input
                  type="text"
                  {...register("portfolio_owner_name")}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-300 focus:outline-none focus:border-indigo-500"
                />
                {errors.portfolio_owner_name && <p className="text-xs text-red-500 mt-1">{errors.portfolio_owner_name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Contact Email</label>
                <input
                  type="email"
                  {...register("contact_email")}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-300 focus:outline-none focus:border-indigo-500"
                />
                {errors.contact_email && <p className="text-xs text-red-500 mt-1">{errors.contact_email.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Site Title</label>
                <input
                  type="text"
                  {...register("site_title")}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-300 focus:outline-none focus:border-indigo-500"
                />
                {errors.site_title && <p className="text-xs text-red-500 mt-1">{errors.site_title.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Site Subtitle</label>
                <input
                  type="text"
                  {...register("site_subtitle")}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-300 focus:outline-none focus:border-indigo-500"
                />
                {errors.site_subtitle && <p className="text-xs text-red-500 mt-1">{errors.site_subtitle.message}</p>}
              </div>
            </div>
          </div>

          {/* Section: Hero Copy */}
          <div className="space-y-5 pt-4">
            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider border-b border-neutral-850 pb-2">
              Hero Section Copy
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Hero Headline</label>
                <input
                  type="text"
                  {...register("hero_headline")}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-300 focus:outline-none focus:border-indigo-500"
                />
                {errors.hero_headline && <p className="text-xs text-red-500 mt-1">{errors.hero_headline.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Hero Description</label>
                <textarea
                  rows={3}
                  {...register("hero_description")}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-300 focus:outline-none focus:border-indigo-500"
                />
                {errors.hero_description && <p className="text-xs text-red-500 mt-1">{errors.hero_description.message}</p>}
              </div>
            </div>
          </div>

          {/* Section: Connections & URLs */}
          <div className="space-y-5 pt-4">
            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider border-b border-neutral-850 pb-2">
              Social Handles & Resume URL
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">GitHub Profile URL</label>
                <input
                  type="text"
                  {...register("github_url")}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-300 focus:outline-none focus:border-indigo-500"
                />
                {errors.github_url && <p className="text-xs text-red-500 mt-1">{errors.github_url.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">LinkedIn Profile URL</label>
                <input
                  type="text"
                  {...register("linkedin_url")}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-300 focus:outline-none focus:border-indigo-500"
                />
                {errors.linkedin_url && <p className="text-xs text-red-500 mt-1">{errors.linkedin_url.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Twitter Profile URL</label>
                <input
                  type="text"
                  {...register("twitter_url")}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-300 focus:outline-none focus:border-indigo-500"
                />
                {errors.twitter_url && <p className="text-xs text-red-500 mt-1">{errors.twitter_url.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Resume File URL</label>
                <input
                  type="text"
                  {...register("resume_url")}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-300 focus:outline-none focus:border-indigo-500"
                />
                {errors.resume_url && <p className="text-xs text-red-500 mt-1">{errors.resume_url.message}</p>}
              </div>
            </div>
          </div>

          {/* Section: SEO Defaults */}
          <div className="space-y-5 pt-4">
            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider border-b border-neutral-850 pb-2">
              SEO Parameters & Metadata
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">SEO Title Tag</label>
                  <input
                    type="text"
                    {...register("seo_defaults.title")}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-300 focus:outline-none focus:border-indigo-500"
                  />
                  {errors.seo_defaults?.title && <p className="text-xs text-red-500 mt-1">{errors.seo_defaults.title.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">SEO OpenGraph Image URL</label>
                  <input
                    type="text"
                    {...register("seo_defaults.og_image")}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-300 focus:outline-none focus:border-indigo-500"
                  />
                  {errors.seo_defaults?.og_image && <p className="text-xs text-red-500 mt-1">{errors.seo_defaults.og_image.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">SEO Meta Description</label>
                <textarea
                  rows={2}
                  {...register("seo_defaults.description")}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-300 focus:outline-none focus:border-indigo-500"
                />
                {errors.seo_defaults?.description && <p className="text-xs text-red-500 mt-1">{errors.seo_defaults.description.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">SEO Keywords (Comma Separated)</label>
                <input
                  type="text"
                  defaultValue={siteConfigData.seo_defaults.keywords.join(", ")}
                  onChange={(e) => setValue("seo_defaults.keywords", e.target.value.split(",").map(t => t.trim()))}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-300 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section: Footer Content */}
          <div className="space-y-5 pt-4">
            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider border-b border-neutral-850 pb-2">
              Footer Content
            </h3>
            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Footer Copyright / Text</label>
              <input
                type="text"
                {...register("footer_content")}
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-300 focus:outline-none focus:border-indigo-500"
              />
              {errors.footer_content && <p className="text-xs text-red-500 mt-1">{errors.footer_content.message}</p>}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6 border-t border-neutral-850">
            <button
              type="submit"
              disabled={status === "loading"}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold rounded-lg shadow-lg hover:shadow-indigo-500/10 transition-all text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Committing settings...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save site config</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
