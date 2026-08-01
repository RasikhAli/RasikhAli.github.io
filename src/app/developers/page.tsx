"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Users, ExternalLink, Mail, Code2, ArrowRight } from "lucide-react";
import { Github, Linkedin } from "@/components/brand-icons";
import { DeveloperCard } from "@/components/developer-card";
import { Badge } from "@/components/ui/badge";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import developersData from "@data/developers.json";

export default function DevelopersDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDevelopers = useMemo(() => {
    return developersData.filter((dev) => {
      const matchesSearch =
        dev.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dev.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dev.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        dev.bio.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [searchQuery]);

  const singleDev = filteredDevelopers.length === 1 ? filteredDevelopers[0] : null;

  return (
    <div className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-white selection:bg-indigo-500/30">
      <div className="fixed top-0 left-0 w-full h-[600px] -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.1),transparent)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 space-y-12">
        
        {/* Header Title */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-600 dark:text-indigo-400 text-xs font-extrabold uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" />
            <span>Engineering Talent</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-500 dark:from-white dark:via-neutral-200 dark:to-neutral-500 bg-clip-text text-transparent">
            Developer Directory
          </h1>
          <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Meet the software engineers, system architects, and lab instructors driving our research and product development.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by name, role, or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white/80 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-2xl text-sm text-neutral-900 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 backdrop-blur-md transition-all shadow-sm"
          />
        </div>

        {/* Directory Layout: Handles single developer intentionally vs multi-developer grid */}
        {filteredDevelopers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl bg-neutral-50/50 dark:bg-neutral-900/20 text-center">
            <Users className="w-12 h-12 text-neutral-400 mb-4" />
            <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-200">No developers found</h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm">
              Try adjusting your search criteria or checking spelling.
            </p>
          </div>
        ) : singleDev ? (
          /* Single Developer Hero Showcase Layout */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-4xl"
          >
            <SpotlightCard className="p-8 sm:p-10 border-indigo-500/30 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur-lg opacity-40 animate-pulse" />
                    <img
                      src={singleDev.avatar}
                      alt={singleDev.name}
                      className="relative w-28 h-28 rounded-full object-cover ring-4 ring-white dark:ring-neutral-900 shadow-xl"
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-neutral-900 dark:text-white">{singleDev.name}</h2>
                    <p className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mt-1">{singleDev.designation}</p>
                  </div>
                  <Link
                    href={`/developers/${singleDev.id}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
                  >
                    <span>Full Profile & Projects</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="md:col-span-2 space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-neutral-400">Biography & Background</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                      {singleDev.bio}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-neutral-400">Core Technical Expertise</h3>
                    <div className="flex flex-wrap gap-2">
                      {singleDev.skills.map((skill) => (
                        <Badge key={skill} variant="tech">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                    {singleDev.github_url && (
                      <a
                        href={singleDev.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:text-white transition-colors"
                      >
                        <Github className="w-4 h-4" />
                        <span>GitHub</span>
                      </a>
                    )}
                    {singleDev.linkedin_url && (
                      <a
                        href={singleDev.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:text-indigo-400 transition-colors"
                      >
                        <Linkedin className="w-4 h-4" />
                        <span>LinkedIn</span>
                      </a>
                    )}
                    {singleDev.email && (
                      <a
                        href={`mailto:${singleDev.email}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:text-indigo-400 transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Email</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </SpotlightCard>
          </motion.div>
        ) : (
          /* Multi-Developer Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredDevelopers.map((developer) => (
              <DeveloperCard key={developer.id} developer={developer} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
