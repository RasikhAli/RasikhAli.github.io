"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { Github, Linkedin, Twitter } from "./brand-icons";
import siteConfig from "@data/site-config.json";

export function Footer() {
  return (
    <footer className="w-full border-t border-neutral-200/40 dark:border-neutral-800/40 bg-neutral-50 dark:bg-neutral-950 py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left Side Details */}
        <div className="text-center md:text-left">
          <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm">
            {siteConfig.site_title}
          </h3>
          <p className="text-xs text-neutral-500 mt-1">
            {siteConfig.footer_content}
          </p>
        </div>

        {/* Right Side Social Media Links */}
        <div className="flex items-center gap-4">
          {siteConfig.contact_email && (
            <a
              href={`mailto:${siteConfig.contact_email}`}
              className="text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
              title="Email Contact"
            >
              <Mail className="w-4.5 h-4.5" />
            </a>
          )}
          {siteConfig.github_url && (
            <a
              href={siteConfig.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
              title="GitHub Profile"
            >
              <Github className="w-4.5 h-4.5" />
            </a>
          )}
          {siteConfig.linkedin_url && (
            <a
              href={siteConfig.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
              title="LinkedIn Profile"
            >
              <Linkedin className="w-4.5 h-4.5" />
            </a>
          )}
          {siteConfig.twitter_url && (
            <a
              href={siteConfig.twitter_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
              title="Twitter/X Profile"
            >
              <Twitter className="w-4.5 h-4.5" />
            </a>
          )}
        </div>

      </div>
    </footer>
  );
}
