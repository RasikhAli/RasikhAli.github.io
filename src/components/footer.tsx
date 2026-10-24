"use client";

import Link from "next/link";
import { Mail, ArrowUp } from "lucide-react";
import { Github, Linkedin, Twitter } from "./brand-icons";
import siteConfig from "@data/site-config.json";

export function Footer() {
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="w-full border-t border-neutral-200/40 dark:border-neutral-800/40 bg-neutral-50/70 dark:bg-neutral-950/70 backdrop-blur-md py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-neutral-200/50 dark:border-neutral-800/50">
          {/* Left Side Details */}
          <div className="text-center md:text-left space-y-1.5">
            <div className="flex items-center justify-center md:justify-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-[10px] font-black text-white shadow-md shadow-indigo-500/20">
                RA
              </div>
              <h3 className="font-extrabold text-neutral-900 dark:text-white text-base">
                {siteConfig.site_title}
              </h3>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Gold Medalist | Junior Lecturer | Artificial Intelligence & Software Engineer
            </p>
          </div>

          {/* Social Links & Back to top */}
          <div className="flex items-center gap-2.5">
            {siteConfig.contact_email && (
              <a
                href={`mailto:${siteConfig.contact_email}`}
                className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 hover:text-indigo-600 dark:text-neutral-400 dark:hover:text-indigo-400 hover:border-indigo-500/30 transition-all shadow-sm"
                title="Email Contact"
              >
                <Mail className="w-4 h-4" />
              </a>
            )}
            {siteConfig.github_url && (
              <a
                href={siteConfig.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 hover:text-indigo-600 dark:text-neutral-400 dark:hover:text-indigo-400 hover:border-indigo-500/30 transition-all shadow-sm"
                title="GitHub Profile"
              >
                <Github className="w-4 h-4" />
              </a>
            )}
            {siteConfig.linkedin_url && (
              <a
                href={siteConfig.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 hover:text-indigo-600 dark:text-neutral-400 dark:hover:text-indigo-400 hover:border-indigo-500/30 transition-all shadow-sm"
                title="LinkedIn Profile"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {siteConfig.twitter_url && (
              <a
                href={siteConfig.twitter_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 hover:text-indigo-600 dark:text-neutral-400 dark:hover:text-indigo-400 hover:border-indigo-500/30 transition-all shadow-sm"
                title="Twitter/X Profile"
              >
                <Twitter className="w-4 h-4" />
              </a>
            )}

            <button
              onClick={scrollToTop}
              className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 hover:text-indigo-600 dark:text-neutral-400 dark:hover:text-indigo-400 hover:border-indigo-500/30 transition-all shadow-sm ml-1"
              title="Back to Top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 dark:text-neutral-400">
          <p>© {new Date().getFullYear()} Rasikh Ali. All rights reserved.</p>
          <p className="flex items-center gap-1.5 font-medium">
            <span>Crafted with</span>
            <span className="text-indigo-500 font-bold">Next.js & Tailwind CSS</span>
            <span>• Optimized for High Performance</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
