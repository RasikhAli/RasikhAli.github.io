"use client";

import React, { useState, useMemo } from "react";
import { Search, Users } from "lucide-react";
import { DeveloperCard } from "@/components/developer-card";
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

  return (
    <div className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-white py-16 selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header Title */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
            Developer Directory
          </h1>
          <p className="text-sm text-neutral-450">
            Meet the engineers, architects, designers, and thinkers behind our digital products.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search by name, role, skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>

        {/* Directory Grid */}
        {filteredDevelopers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredDevelopers.map((developer) => (
              <DeveloperCard key={developer.id} developer={developer} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-neutral-850 rounded-xl bg-neutral-900/10">
            <Users className="w-10 h-10 text-neutral-500 mb-4" />
            <h3 className="text-base font-bold text-neutral-350">No developers found</h3>
            <p className="text-sm text-neutral-500 mt-1 max-w-sm text-center">
              Try adjusting your query filter, checking spelling, or browsing another section.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
