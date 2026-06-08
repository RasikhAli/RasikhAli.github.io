"use client";

import React from "react";
import Link from "next/link";
import { Mail, ArrowRight } from "lucide-react";
import { Github, Linkedin } from "./brand-icons";
import { Developer } from "@/lib/schemas";

interface DeveloperCardProps {
  developer: Developer;
}

export function DeveloperCard({ developer }: DeveloperCardProps) {
  return (
    <div className="group relative flex flex-col justify-between bg-white/90 border border-neutral-200 dark:bg-neutral-900/40 dark:border-neutral-800 rounded-xl p-6 backdrop-blur-md hover:border-neutral-300 dark:hover:border-neutral-700/80 hover:-translate-y-1 transition-all duration-300">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <img
            src={developer.avatar}
            alt={developer.name}
            className="w-14 h-14 rounded-full object-cover ring-2 ring-neutral-200 dark:ring-neutral-800"
            loading="lazy"
            decoding="async"
          />
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              <Link href={`/developers/${developer.id}`}>
                {developer.name}
              </Link>
            </h3>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{developer.designation}</p>
          </div>
        </div>

        <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3 leading-relaxed">
          {developer.bio}
        </p>

        <div className="flex flex-wrap gap-1">
          {developer.skills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="text-[10px] font-medium bg-neutral-100 text-neutral-700 dark:bg-neutral-850 dark:text-neutral-400 px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-850"
            >
              {skill}
            </span>
          ))}
          {developer.skills.length > 4 && (
            <span className="text-[10px] font-medium bg-neutral-100 text-neutral-600 dark:bg-neutral-850 dark:text-neutral-500 px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-850">
              +{developer.skills.length - 4}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-neutral-200 dark:border-neutral-800/80 pt-4 mt-6">
        <div className="flex items-center gap-3 text-neutral-700 dark:text-neutral-400">
          {developer.github_url && (
            <a
              href={developer.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-700 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
              title="GitHub Profile"
            >
              <Github className="w-4 h-4" />
            </a>
          )}
          {developer.linkedin_url && (
            <a
              href={developer.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-700 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
              title="LinkedIn Profile"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          )}
          {developer.email && (
            <a
              href={`mailto:${developer.email}`}
              className="text-neutral-700 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
              title="Send Email"
            >
              <Mail className="w-4 h-4" />
            </a>
          )}
        </div>

        <Link
          href={`/developers/${developer.id}`}
          className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
        >
          <span>View Profile</span>
          <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}