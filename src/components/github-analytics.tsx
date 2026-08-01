"use client";

import React, { useEffect, useRef } from "react";
import { useInView } from "framer-motion";
import { animate, stagger } from "animejs";
import { GitCommit, GitFork, Star, Code2, Flame, Trophy } from "lucide-react";
import { Github as GithubBrand } from "@/components/brand-icons";

interface Language {
  name: string;
  percentage: number;
  color: string;
}

interface GithubAnalyticsProps {
  githubUrl?: string;
}

export function GithubAnalytics({ githubUrl }: GithubAnalyticsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-80px" });

  const languages: Language[] = [
    { name: "TypeScript / JavaScript", percentage: 48, color: "#3178c6" },
    { name: "Python", percentage: 26, color: "#3572A5" },
    { name: "HTML / CSS", percentage: 16, color: "#e34c26" },
    { name: "C++ / Other", percentage: 10, color: "#f34b7d" },
  ];

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const commitActivity = [12, 19, 25, 32, 18, 45, 60, 52, 78, 85, 92, 110];
  const maxCommits = Math.max(...commitActivity);

  useEffect(() => {
    if (!isInView || !containerRef.current) return;

    animate(containerRef.current.querySelectorAll(".lang-bar-fill"), {
      width: (el: HTMLElement) => el.getAttribute("data-percentage") + "%",
      duration: 1200,
      delay: stagger(150),
    });

    animate(containerRef.current.querySelectorAll(".activity-bar"), {
      scaleY: [0, 1],
      duration: 1000,
      delay: stagger(60, { start: 200 }),
    });

    animate(containerRef.current.querySelectorAll(".stat-box"), {
      translateY: [15, 0],
      opacity: [0, 1],
      duration: 700,
      delay: stagger(80),
    });
  }, [isInView]);

  return (
    <div
      ref={containerRef}
      className="bg-white/80 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-xl hover:border-indigo-500/30 transition-all"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
            <GithubBrand className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
              <span>GitHub Engineering Analytics</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                LIVE PULSE
              </span>
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
              Automated repository activity, language breakdown & commit frequency
            </p>
          </div>
        </div>

        {githubUrl && (
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 px-4 py-2 rounded-xl transition-all hover:scale-105 shrink-0"
          >
            <GithubBrand className="w-4 h-4" />
            <span>Follow @GitHub</span>
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Language Breakdown & Activity Chart */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-indigo-500" />
              Primary Stack Breakdown
            </h4>
            <span className="text-xs text-neutral-600 dark:text-neutral-400 font-mono">100% Analyzed</span>
          </div>

          {/* Multi-segment Bar */}
          <div className="h-3.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden flex gap-1 p-0.5">
            {languages.map((lang) => (
              <div
                key={lang.name}
                className="h-full rounded-full lang-bar-fill transition-all"
                style={{ backgroundColor: lang.color, width: "0%" }}
                data-percentage={lang.percentage}
                title={`${lang.name}: ${lang.percentage}%`}
              />
            ))}
          </div>

          {/* Legend Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {languages.map((lang) => (
              <div
                key={lang.name}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950/50 border border-neutral-200/60 dark:border-neutral-800/60"
              >
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: lang.color }} />
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-neutral-900 dark:text-white truncate">{lang.name}</p>
                  <p className="text-[10px] text-neutral-600 dark:text-neutral-400 font-mono">{lang.percentage}%</p>
                </div>
              </div>
            ))}
          </div>

          {/* Commit Sparkline & Month Labels */}
          <div className="pt-2 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" />
                12-Month Commit Cadence
              </h4>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                +45% YoY Growth
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50/50 dark:bg-neutral-950/40 border border-neutral-200/60 dark:border-neutral-800/60 space-y-2">
              <div className="h-32 flex items-end justify-between gap-2 pt-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
                {commitActivity.map((count, idx) => {
                  const heightPercent = (count / maxCommits) * 100;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end">
                      <div
                        className="w-full bg-indigo-500/40 group-hover:bg-indigo-500 rounded-t transition-all origin-bottom activity-bar"
                        style={{ height: `${heightPercent}%` }}
                      />
                      <span className="opacity-0 group-hover:opacity-100 absolute -top-8 text-[9px] font-bold bg-neutral-900 text-white px-2 py-0.5 rounded pointer-events-none transition-opacity font-mono z-20 shadow-md">
                        {count} commits
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Month Labels */}
              <div className="flex justify-between text-[10px] text-neutral-500 font-mono pt-1">
                {months.map((m) => (
                  <span key={m} className="flex-1 text-center">{m}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Highlight Stats (Compact Grid) */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
          <div className="stat-box p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/20 space-y-0.5">
            <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400">
              <GitCommit className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Total Commits
              </span>
            </div>
            <p className="text-2xl font-black text-neutral-900 dark:text-white font-mono">650+</p>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400">Pushed to production repos</p>
          </div>

          <div className="stat-box p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200/80 dark:border-neutral-800/80 space-y-0.5">
            <div className="flex items-center justify-between text-amber-500">
              <Star className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Stars Earned
              </span>
            </div>
            <p className="text-2xl font-black text-neutral-900 dark:text-white font-mono">140+</p>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400">Across open source projects</p>
          </div>

          <div className="stat-box p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200/80 dark:border-neutral-800/80 space-y-0.5">
            <div className="flex items-center justify-between text-blue-500">
              <GitFork className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Forks & Pulls
              </span>
            </div>
            <p className="text-2xl font-black text-neutral-900 dark:text-white font-mono">45+</p>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400">Community collaborations</p>
          </div>

          <div className="stat-box p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 space-y-0.5">
            <div className="flex items-center justify-between text-emerald-500">
              <Trophy className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Longest Streak
              </span>
            </div>
            <p className="text-2xl font-black text-neutral-900 dark:text-white font-mono">28 Days</p>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400">Continuous daily commits</p>
          </div>
        </div>
      </div>
    </div>
  );
}
