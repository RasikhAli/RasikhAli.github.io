"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowRight } from "lucide-react";
import { Github, Linkedin } from "./brand-icons";
import { Developer } from "@/lib/schemas";

interface DeveloperCardProps {
  developer: Developer;
}

export function DeveloperCard({ developer }: DeveloperCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col justify-between bg-neutral-900/40 border border-neutral-800 rounded-xl p-6 backdrop-blur-md hover:border-neutral-700/80 transition-colors"
    >
      <div className="space-y-4">
        {/* Profile Header */}
        <div className="flex items-center gap-4">
          <img
            src={developer.avatar}
            alt={developer.name}
            className="w-14 h-14 rounded-full object-cover ring-2 ring-neutral-800"
          />
          <div>
            <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
              <Link href={`/developers/${developer.id}`}>
                {developer.name}
              </Link>
            </h3>
            <p className="text-xs text-indigo-400 font-medium">{developer.designation}</p>
          </div>
        </div>

        {/* Short Bio */}
        <p className="text-sm text-neutral-400 line-clamp-3 leading-relaxed">
          {developer.bio}
        </p>

        {/* Skill Tags */}
        <div className="flex flex-wrap gap-1">
          {developer.skills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="text-[10px] font-medium bg-neutral-850 text-neutral-400 px-2 py-0.5 rounded border border-neutral-850"
            >
              {skill}
            </span>
          ))}
          {developer.skills.length > 4 && (
            <span className="text-[10px] font-medium bg-neutral-850 text-neutral-500 px-2 py-0.5 rounded border border-neutral-850">
              +{developer.skills.length - 4}
            </span>
          )}
        </div>
      </div>

      {/* Footer / Socials / Action */}
      <div className="flex items-center justify-between border-t border-neutral-800/80 pt-4 mt-6">
        <div className="flex items-center gap-3 text-neutral-400">
          {developer.github_url && (
            <a
              href={developer.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
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
              className="hover:text-white transition-colors"
              title="LinkedIn Profile"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          )}
          {developer.email && (
            <a
              href={`mailto:${developer.email}`}
              className="hover:text-white transition-colors"
              title="Send Email"
            >
              <Mail className="w-4 h-4" />
            </a>
          )}
        </div>

        <Link
          href={`/developers/${developer.id}`}
          className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <span>View Profile</span>
          <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}
