"use client";

import React from "react";
import Link from "next/link";
import { Mail, ArrowRight } from "lucide-react";
import { Github, Linkedin } from "./brand-icons";
import { Developer } from "@/lib/schemas";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Badge } from "@/components/ui/badge";

interface DeveloperCardProps {
  developer: Developer;
}

export function DeveloperCard({ developer }: DeveloperCardProps) {
  return (
    <SpotlightCard className="group flex flex-col justify-between p-6 hover:-translate-y-1 transition-all duration-300">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <img
            src={developer.avatar}
            alt={developer.name}
            className="w-14 h-14 rounded-full object-cover ring-2 ring-indigo-500/20 shadow-md"
            loading="lazy"
            decoding="async"
          />
          <div>
            <h3 className="text-lg font-extrabold text-neutral-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              <Link href={`/developers/${developer.id}`}>
                {developer.name}
              </Link>
            </h3>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">{developer.designation}</p>
          </div>
        </div>

        <p className="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-3 leading-relaxed">
          {developer.bio}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {developer.skills.slice(0, 4).map((skill) => (
            <Badge key={skill} variant="tech">
              {skill}
            </Badge>
          ))}
          {developer.skills.length > 4 && (
            <Badge variant="neutral">
              +{developer.skills.length - 4}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-neutral-200 dark:border-neutral-800/80 pt-4 mt-6">
        <div className="flex items-center gap-3 text-neutral-500 dark:text-neutral-400">
          {developer.github_url && (
            <a
              href={developer.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-900 dark:hover:text-white transition-colors p-1"
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
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-1"
              title="LinkedIn Profile"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          )}
          {developer.email && (
            <a
              href={`mailto:${developer.email}`}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-1"
              title="Send Email"
            >
              <Mail className="w-4 h-4" />
            </a>
          )}
        </div>

        <Link
          href={`/developers/${developer.id}`}
          className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
        >
          <span>View Profile</span>
          <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </SpotlightCard>
  );
}