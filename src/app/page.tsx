"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, FolderKanban, Users2, Code2, Mail, ExternalLink, Check, Sparkles, BookOpen, GraduationCap, Star, ShieldAlert, ChevronRight, X } from "lucide-react";
import { Github as GithubBrand, Linkedin, Twitter } from "@/components/brand-icons";
import { ProjectCard } from "@/components/project-card";
import { DeveloperCard } from "@/components/developer-card";
import { TextReveal } from "@/components/ui/text-reveal";
import { StatCounter } from "@/components/ui/stat-counter";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { GithubAnalytics } from "@/components/github-analytics";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import siteConfig from "../../data/site-config.json";
import developersData from "../../data/developers.json";
import rawProjects from "../../data/projects.json";
import { Project } from "@/lib/schemas";
import { fetchTestimonials, getGithubProfile, type Testimonial } from "@/lib/testimonials";

const typedProjects = rawProjects as Project[];
const projectsData = typedProjects;

export default function HomePage() {
  const [copied, setCopied] = useState(false);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    async function loadTestimonials() {
      const sheets = (siteConfig as any).testimonials_sheets || [];
      const legacyConfig = (siteConfig as any).testimonials_config;
      
      let configuredSheets = [...sheets];
      if (configuredSheets.length === 0 && legacyConfig?.sheet_url) {
        configuredSheets = [
          {
            id: "legacy",
            sheet_url: legacyConfig.sheet_url
          }
        ];
      }

      if (configuredSheets.length === 0) {
        setLoadingTestimonials(false);
        return;
      }

      try {
        let combined: Testimonial[] = [];
        for (const sheet of configuredSheets) {
          const list = await fetchTestimonials(sheet.sheet_url);
          combined = [...combined, ...list];
        }
        setTestimonials(combined);
        
        combined.forEach(async (item, index) => {
          if (item.githubUsername) {
            const profile = await getGithubProfile(item.githubUsername);
            if (profile.avatarUrl) {
              setTestimonials((prev) => {
                const next = [...prev];
                if (next[index]) {
                  next[index] = { ...next[index], avatarUrl: profile.avatarUrl };
                }
                return next;
              });
            }
          }
        });
      } catch (e) {
        console.error("Error loading testimonials:", e);
      } finally {
        setLoadingTestimonials(false);
      }
    }
    loadTestimonials();
  }, []);

  const handleCardClick = async (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    if (testimonial.githubUsername) {
      setModalLoading(true);
      try {
        const profile = await getGithubProfile(testimonial.githubUsername);
        setSelectedTestimonial(prev => {
          if (!prev) return null;
          return {
            ...prev,
            avatarUrl: profile.avatarUrl || prev.avatarUrl,
            githubBio: profile.bio
          };
        });
      } catch (e) {
        console.warn(e);
      } finally {
        setModalLoading(false);
      }
    }
  };

  const featuredProjects = useMemo(() => {
    return [...projectsData]
      .filter((p) => p.featured)
      .sort((a, b) => {
        if (!a.start_date) return 1;
        if (!b.start_date) return -1;
        return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
      });
  }, []);
  const featuredDevelopers = developersData.filter((d) => d.featured);
  const uniqueTechs = Array.from(new Set(typedProjects.flatMap((p) => p.tech_stack)));
  const owner = developersData.find((d) => d.name === siteConfig.portfolio_owner_name) || developersData[0];

  const handleCopyEmail = () => {
    if (siteConfig.contact_email) {
      navigator.clipboard.writeText(siteConfig.contact_email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const socialLinks = [
    { href: siteConfig.github_url, icon: GithubBrand, label: "GitHub", show: !!siteConfig.github_url },
    { href: siteConfig.linkedin_url, icon: Linkedin, label: "LinkedIn", show: !!siteConfig.linkedin_url },
    { href: siteConfig.twitter_url, icon: Twitter, label: "Twitter", show: !!siteConfig.twitter_url },
    { href: `mailto:${siteConfig.contact_email}`, icon: Mail, label: "Email", show: !!siteConfig.contact_email },
  ].filter((l) => l.show);

  const typingLines = siteConfig.profile_typing_lines || [];
  const displayName = owner?.name || siteConfig.portfolio_owner_name;

  return (
    <div className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-white selection:bg-indigo-500/30">
      {/* Background Mesh Gradient */}
      <div className="fixed top-0 left-0 w-full h-[900px] -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(99,102,241,0.12),transparent_70%)] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[700px] h-[700px] -z-10 bg-[radial-gradient(circle_at_100%_100%,rgba(168,85,247,0.08),transparent_65%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 space-y-24">
        
        {/* Profile / Hero Section */}
        <header className="max-w-4xl mx-auto text-center">
          {owner?.avatar && (
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative inline-block mb-8"
            >
              {/* Soft breathing avatar glow */}
              <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full blur-2xl opacity-40 animate-pulse-slow" />
              <img
                src={owner.avatar}
                alt={displayName}
                className="relative w-32 h-32 rounded-full object-cover ring-4 ring-white/90 dark:ring-neutral-900 shadow-2xl"
              />
            </motion.div>
          )}

          {/* Animated Name Reveal */}
          <div className="mb-4">
            <TextReveal
              text={displayName}
              as="h1"
              className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight bg-gradient-to-br from-neutral-900 via-neutral-700 to-neutral-500 dark:from-white dark:via-neutral-200 dark:to-neutral-500 bg-clip-text text-transparent justify-center"
            />
          </div>

          {owner?.designation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
              </span>
              <p className="text-xs font-extrabold tracking-wider uppercase text-indigo-600 dark:text-indigo-400">
                {owner.designation}
              </p>
            </motion.div>
          )}

          {siteConfig.profile_bio && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto leading-relaxed"
            >
              {siteConfig.profile_bio}
            </motion.p>
          )}

          {typingLines.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 bg-white/80 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 rounded-full shadow-sm backdrop-blur-md"
            >
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">{typingLines[0]}</span>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-3 mt-10"
          >
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/90 dark:bg-neutral-900/90 border border-neutral-200/80 dark:border-neutral-800/80 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:border-indigo-500/40 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-lg transition-all duration-200 backdrop-blur-sm"
              >
                <link.icon className="w-4 h-4" />
                <span>{link.label}</span>
              </a>
            ))}
            {siteConfig.resume_url && (
              <a
                href={siteConfig.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/90 dark:bg-neutral-900/90 border border-neutral-200/80 dark:border-neutral-800/80 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:border-indigo-500/40 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-lg transition-all duration-200 backdrop-blur-sm"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Resume</span>
              </a>
            )}
            {siteConfig.contact_email && (
              <button
                onClick={handleCopyEmail}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/90 dark:bg-neutral-900/90 border border-neutral-200/80 dark:border-neutral-800/80 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:border-indigo-500/40 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-lg transition-all duration-200 backdrop-blur-sm"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Mail className="w-4 h-4" />}
                <span>{copied ? "Copied!" : "Copy Email"}</span>
              </button>
            )}
          </motion.div>
        </header>

        {/* Animated Stat Tiles */}
        <section className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white/80 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800/80 p-6 rounded-2xl backdrop-blur-md shadow-sm hover:border-indigo-500/30 transition-all">
              <FolderKanban className="w-6 h-6 text-indigo-500 mx-auto mb-3" />
              <StatCounter value={projectsData.length} label="Projects" className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="bg-white/80 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800/80 p-6 rounded-2xl backdrop-blur-md shadow-sm hover:border-indigo-500/30 transition-all">
              <Code2 className="w-6 h-6 text-purple-500 mx-auto mb-3" />
              <StatCounter value={uniqueTechs.length} label="Technologies" className="text-purple-600 dark:text-purple-400" />
            </div>
            <div className="bg-white/80 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800/80 p-6 rounded-2xl backdrop-blur-md shadow-sm hover:border-indigo-500/30 transition-all">
              <Users2 className="w-6 h-6 text-blue-500 mx-auto mb-3" />
              <StatCounter value={developersData.length} label="Contributors" className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="bg-white/80 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800/80 p-6 rounded-2xl backdrop-blur-md shadow-sm hover:border-indigo-500/30 transition-all flex flex-col items-center justify-center">
              <GithubBrand className="w-6 h-6 text-amber-500 mx-auto mb-3" />
              <p className="text-2xl font-black text-neutral-900 dark:text-white font-mono truncate max-w-full">
                @{siteConfig.github_username || "RasikhAli"}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mt-1">
                GitHub Handle
              </p>
            </div>
          </div>
        </section>

        {/* GitHub Analytics Interactive Panel */}
        <section className="max-w-5xl mx-auto">
          <GithubAnalytics githubUrl={siteConfig.github_url} />
        </section>

        {/* Featured Work Section */}
        {featuredProjects.length > 0 && (
          <section className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-10 pb-5 border-b border-neutral-200 dark:border-neutral-800">
              <div>
                <h2 className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">Featured Work</h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1.5">
                  Hand-picked engineering projects with full source and previews.
                </p>
              </div>
              <Link
                href="/projects"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors group"
              >
                <span>All Projects ({projectsData.length})</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {featuredProjects.map((project, idx) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                >
                  <ProjectCard project={project} />
                </motion.div>
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link
                href="/projects"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm font-bold text-neutral-700 dark:text-neutral-300"
              >
                <span>All Projects</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>
        )}

        {/* Key Contributors */}
        {featuredDevelopers.length > 0 && (
          <section className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-10 pb-5 border-b border-neutral-200 dark:border-neutral-800">
              <div>
                <h2 className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">Key Contributors</h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1.5">
                  The talented engineers designing and maintaining our products.
                </p>
              </div>
              <Link
                href="/developers"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors group"
              >
                <span>Directory</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredDevelopers.map((dev) => (
                <DeveloperCard key={dev.id} developer={dev} />
              ))}
            </div>
          </section>
        )}

        {/* Education & Teaching Section */}
        <section className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10 pb-5 border-b border-neutral-200 dark:border-neutral-800">
            <div>
              <h2 className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight flex items-center gap-2.5">
                <GraduationCap className="w-8 h-8 text-indigo-500" />
                <span>Education & Teaching</span>
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1.5">
                Academic lectures, labs, and mentoring the next generation of engineers.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* University Highlight Card with Spotlight Elevation */}
            <SpotlightCard className="lg:col-span-1 p-8 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-neutral-900 dark:text-white">Superior University</h3>
                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Junior Lecturer</p>
                  </div>
                </div>

                <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  <p>
                    Instructing university labs and courses in <span className="font-bold text-neutral-900 dark:text-white">Artificial Intelligence</span>, <span className="font-bold text-neutral-900 dark:text-white">Data Science</span>, and <span className="font-bold text-neutral-900 dark:text-white">Software Engineering</span>.
                  </p>
                  <p>
                    Courses taught include Programming for AI (PAI), Object-Oriented Programming (OOP), Computer Networks (CN), and AI Labs.
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800/80 mt-6">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Active (Fall 2023 – Present)</span>
                </div>
              </div>
            </SpotlightCard>

            {/* Testimonials Preview List (Clean Layout without Inner Scrollbar) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                  {(siteConfig.testimonials_config as any)?.title || "Students Testimonial"}
                </h3>
                {testimonials.length > 0 && (
                  <span className="text-xs bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full font-bold border border-indigo-500/20">
                    {testimonials.length} reviews
                  </span>
                )}
              </div>

              {loadingTestimonials ? (
                <div className="flex flex-col items-center justify-center py-16 border border-neutral-200 dark:border-neutral-800 rounded-3xl bg-neutral-900/20">
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-xs text-neutral-500">Loading student reviews...</p>
                </div>
              ) : testimonials.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl text-center">
                  <ShieldAlert className="w-8 h-8 text-neutral-400 mb-3" />
                  <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">No testimonials to display</p>
                  <p className="text-xs text-neutral-500 mt-1">Configure sheet URL in site admin settings.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-4">
                    {testimonials.slice(0, 3).map((t, index) => (
                      <SpotlightCard
                        key={index}
                        onClick={() => handleCardClick(t)}
                        className="p-5 sm:p-6 space-y-4 cursor-pointer hover:-translate-y-1 transition-all duration-300"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            {t.avatarUrl ? (
                              <img
                                src={t.avatarUrl}
                                alt={t.name}
                                className="w-11 h-11 rounded-full object-cover border border-neutral-200 dark:border-neutral-800 aspect-square shrink-0"
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-black text-white aspect-square shrink-0">
                                {t.name.split(" ").filter(Boolean).map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <h4 className="text-sm font-extrabold text-neutral-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">{t.name}</h4>
                              <p className="text-[10px] text-neutral-500 font-semibold truncate">
                                {t.programShort} {t.section && `(${t.section})`} • {t.sessionShort || "Superior University"}
                              </p>
                            </div>
                          </div>

                          {t.rating && (
                            <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full text-amber-600 dark:text-amber-500 shrink-0">
                              <Star className="w-3 h-3 fill-amber-500" />
                              <span className="text-[10px] font-black">{t.rating}</span>
                            </div>
                          )}
                        </div>

                        {t.courseShort && (
                          <div className="text-[10px] text-indigo-700 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-100 dark:border-indigo-500/20 w-fit truncate">
                            Course: {t.courseShort}
                          </div>
                        )}

                        {t.feedback && (
                          <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed italic">
                            "{t.feedback.length > 180 ? `${t.feedback.substring(0, 180)}...` : t.feedback}"
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-neutral-200/50 dark:border-neutral-800/60 text-xs">
                          <span className="text-[10px] font-bold text-neutral-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-0.5 transition-colors">
                            Read details <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                          <div className="flex items-center gap-2">
                            {t.linkedinUrl && (
                              <a
                                href={t.linkedinUrl}
                                onClick={(e) => e.stopPropagation()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-neutral-400 hover:text-indigo-500 transition-colors p-1"
                              >
                                <Linkedin className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {t.githubUrl && (
                              <a
                                href={t.githubUrl}
                                onClick={(e) => e.stopPropagation()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-neutral-400 hover:text-white transition-colors p-1"
                              >
                                <GithubBrand className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </SpotlightCard>
                    ))}
                  </div>
                  
                  {testimonials.length > 3 && (
                    <div className="pt-2 text-center">
                      <Link
                        href="/testimonials"
                        className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all"
                      >
                        <span>View all student reviews ({testimonials.length})</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Modal for Testimonial detail */}
        {selectedTestimonial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-y-auto max-h-[90vh] text-left">
              <button
                onClick={() => setSelectedTestimonial(null)}
                className="absolute right-6 top-6 p-2 bg-neutral-800/80 hover:bg-neutral-800 rounded-full text-neutral-400 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-4">
                {selectedTestimonial.avatarUrl ? (
                  <img
                    src={selectedTestimonial.avatarUrl}
                    alt={selectedTestimonial.name}
                    className="w-16 h-16 rounded-full object-cover border border-neutral-800 aspect-square shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg font-black text-white aspect-square shrink-0">
                    {selectedTestimonial.name.split(" ").filter(Boolean).map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="space-y-1 text-left">
                  <h3 className="text-lg font-extrabold text-white">{selectedTestimonial.name}</h3>
                  <p className="text-xs text-neutral-400 font-medium">
                    {selectedTestimonial.programLong} {selectedTestimonial.section && `(Sec ${selectedTestimonial.section})`}
                  </p>
                  <p className="text-[10px] text-neutral-500 font-semibold">
                    Session: {selectedTestimonial.sessionLong || "Superior University"}
                  </p>
                </div>
              </div>

              {selectedTestimonial.githubUsername && (
                <div className="p-4 bg-neutral-950/60 border border-neutral-800 rounded-2xl space-y-2 text-left">
                  <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider block">GitHub Bio</span>
                  {modalLoading ? (
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <span className="w-3 h-3 border border-indigo-400 border-t-transparent rounded-full animate-spin" />
                      <span>Fetching profile...</span>
                    </div>
                  ) : selectedTestimonial.githubBio ? (
                    <p className="text-xs text-neutral-300 leading-relaxed font-medium">
                      {selectedTestimonial.githubBio}
                    </p>
                  ) : (
                    <p className="text-xs text-neutral-550 italic">No GitHub bio written on their profile.</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                {selectedTestimonial.rating && (
                  <div className="p-4 bg-neutral-950/40 border border-neutral-800 rounded-2xl flex items-center gap-3">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-500 block">Instructor Rating</span>
                      <span className="text-sm font-black text-white">{selectedTestimonial.rating} / 10</span>
                    </div>
                  </div>
                )}

                {selectedTestimonial.courseLong && (
                  <div className="p-4 bg-neutral-950/40 border border-neutral-800 rounded-2xl flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-indigo-400" />
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-neutral-500 block">Registered Course</span>
                      <span className="text-sm font-bold text-white block truncate">{selectedTestimonial.courseLong}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 text-left">
                {selectedTestimonial.feedback && (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-black text-emerald-500 block tracking-wider">What they liked most:</span>
                    <p className="italic text-xs text-neutral-300 leading-relaxed bg-neutral-950/60 p-3.5 rounded-2xl border border-neutral-800">
                      "{selectedTestimonial.feedback}"
                    </p>
                  </div>
                )}

                {selectedTestimonial.dislike && (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-black text-rose-500 block tracking-wider font-bold">What could be improved:</span>
                    <p className="italic text-xs text-neutral-300 leading-relaxed bg-neutral-950/60 p-3.5 rounded-2xl border border-neutral-800">
                      "{selectedTestimonial.dislike}"
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 justify-end pt-4 border-t border-neutral-800">
                {selectedTestimonial.linkedinUrl && (
                  <a
                    href={selectedTestimonial.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white transition-all"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                  </a>
                )}
                {selectedTestimonial.githubUrl && (
                  <a
                    href={selectedTestimonial.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs font-bold text-neutral-300 hover:text-white transition-all"
                  >
                    <GithubBrand className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Rebuilt Bottom CTA with Magnetic Button */}
        <section className="max-w-3xl mx-auto text-center pt-8">
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 rounded-3xl p-10 sm:p-14 backdrop-blur-xl shadow-2xl">
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" />
            
            <h3 className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white mb-4 tracking-tight">
              Want to collaborate?
            </h3>
            <p className="text-neutral-600 dark:text-neutral-300 max-w-md mx-auto text-sm sm:text-base mb-8 leading-relaxed">
              Reach out if you are interested in working together, building something new, or discussing technical topics.
            </p>

            <a href={`mailto:${siteConfig.contact_email}`}>
              <MagneticButton className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-extrabold rounded-2xl shadow-xl shadow-indigo-500/25 gap-2 group">
                <Mail className="w-4 h-4" />
                <span>Contact Me</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </MagneticButton>
            </a>
          </div>
        </section>

      </div>
    </div>
  );
}