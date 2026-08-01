"use client";

import React, { useMemo, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useSpring, useReducedMotion } from "framer-motion";
import { Calendar, ArrowUpRight, Clock, CheckCircle2, PlayCircle, CalendarClock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import projectsData from "@data/projects.json";
import { Project } from "@/lib/schemas";

const typedProjects = projectsData as Project[];

export default function ProjectsTimelinePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 80%", "end 90%"],
  });

  const scaleY = useSpring(scrollYProgress, { stiffness: 80, damping: 25 });

  const sortedProjects = useMemo(() => {
    return [...typedProjects].sort((a, b) => {
      if (!a.start_date) return 1;
      if (!b.start_date) return -1;
      return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
    });
  }, []);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "Present";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
      case "in_progress":
        return <PlayCircle className="w-3.5 h-3.5 text-blue-500 animate-spin-slow" />;
      default:
        return <CalendarClock className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white selection:bg-indigo-500/30">
      <div className="fixed top-0 left-0 w-full h-[600px] -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.1),transparent)] pointer-events-none" />
      
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">

        {/* Header */}
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 p-2.5 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 mb-4">
            <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">CHRONOLOGICAL JOURNEY</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-500 dark:from-white dark:via-neutral-200 dark:to-neutral-500 bg-clip-text text-transparent">
            Project Timeline
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-3 leading-relaxed">
            A milestone-by-milestone breakdown of project launches, active builds, and roadmap releases.
          </p>
        </div>

        {/* Timeline Container */}
        <div ref={containerRef} className="relative pl-6 md:pl-0">
          
          {/* Static background track line */}
          <div className="absolute left-[13px] md:left-1/2 top-4 bottom-4 w-0.5 bg-neutral-200 dark:bg-neutral-800 -translate-x-1/2 z-0" />

          {/* Progressive Animated Line */}
          <motion.div
            style={{ scaleY: shouldReduceMotion ? 1 : scaleY, originY: 0 }}
            className="absolute left-[13px] md:left-1/2 top-4 bottom-4 w-0.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-emerald-500 -translate-x-1/2 z-0"
          />

          {sortedProjects.map((project, index) => {
            const isEven = index % 2 === 0;
            return (
              <div key={project.id} className="relative mb-6 md:-mt-8 first:mt-0 last:mb-0">
                {/* Timeline Pulsing Node */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.3, delay: 0.05 }}
                  className="absolute left-[13px] md:left-1/2 -translate-x-1/2 top-6 w-5 h-5 rounded-full bg-white dark:bg-neutral-950 border-2 border-indigo-500 z-10 shadow-lg shadow-indigo-500/30 flex items-center justify-center"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                </motion.div>

                {/* Content Container */}
                <div className={`md:w-1/2 ${isEven ? "md:pr-10 md:ml-0" : "md:pl-10 md:ml-auto"}`}>
                  
                  {/* Mobile Date Badge */}
                  <div className="md:hidden flex items-center gap-1.5 mb-2 ml-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(project.start_date)} – {formatDate(project.end_date)}</span>
                  </div>

                  {/* Desktop Date Label */}
                  <div className={`hidden md:flex items-center gap-2 mb-2 ${isEven ? "justify-end" : "justify-start"}`}>
                    <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs font-bold text-indigo-600 dark:text-indigo-400 backdrop-blur-sm">
                      <span>{formatDate(project.start_date)}</span>
                      <span className="text-neutral-400 mx-1">→</span>
                      <span>{formatDate(project.end_date)}</span>
                    </div>
                  </div>

                  {/* Card with Side Slide Entrance */}
                  <motion.div
                    initial={{ opacity: 0, x: shouldReduceMotion ? 0 : isEven ? -25 : 25 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    <SpotlightCard className="p-5 sm:p-6 group hover:-translate-y-1 transition-all duration-300">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          {/* Title with wrap & no clipping */}
                          <h3 className="text-base sm:text-lg font-extrabold text-neutral-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 break-words">
                            <Link href={`/projects/${project.id}`} className="inline-flex items-center gap-1.5 flex-wrap">
                              <span>{project.title}</span>
                              <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all text-indigo-500 shrink-0" />
                            </Link>
                          </h3>
                        </div>
                        <div className="shrink-0 flex items-center gap-1.5">
                          <Badge variant={project.status === "completed" ? "completed" : project.status === "in_progress" ? "in_progress" : "planned"}>
                            {getStatusIcon(project.status)}
                            <span>{project.status.replace("_", " ").toUpperCase()}</span>
                          </Badge>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 mb-4 line-clamp-2 leading-relaxed">
                        {project.short_description}
                      </p>

                      {/* Tech stack tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {project.tech_stack.map((tech) => (
                          <Badge key={tech} variant="tech">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </SpotlightCard>
                  </motion.div>

                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}