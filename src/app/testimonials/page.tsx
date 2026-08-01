"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, GraduationCap, X, ChevronRight, BookOpen, ShieldAlert } from "lucide-react";
import { Github as GithubBrand, Linkedin } from "@/components/brand-icons";
import { Badge } from "@/components/ui/badge";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import siteConfig from "@data/site-config.json";
import { fetchTestimonials, getGithubProfile, type Testimonial } from "@/lib/testimonials";

interface SheetWithData {
  id: string;
  title: string;
  show_rating: boolean;
  show_feedback: boolean;
  show_dislike: boolean;
  show_skills: boolean;
  show_course: boolean;
  show_linkedin: boolean;
  show_github: boolean;
  testimonials: Testimonial[];
}

export default function TestimonialsPage() {
  const [sheetsData, setSheetsData] = useState<SheetWithData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("");
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    async function loadAllSheets() {
      const config = siteConfig as any;
      let configuredSheets: any[] = [];
      
      if (config.testimonials_sheets && config.testimonials_sheets.length > 0) {
        configuredSheets = config.testimonials_sheets;
      } else if (config.testimonials_config && config.testimonials_config.sheet_url) {
        configuredSheets = [
          {
            id: "default",
            title: config.testimonials_config.title || "Students Testimonial",
            sheet_url: config.testimonials_config.sheet_url,
            show_rating: config.testimonials_config.show_rating ?? true,
            show_feedback: config.testimonials_config.show_feedback ?? true,
            show_dislike: config.testimonials_config.show_dislike ?? false,
            show_skills: config.testimonials_config.show_skills ?? true,
            show_course: config.testimonials_config.show_course ?? true,
            show_linkedin: config.testimonials_config.show_linkedin ?? true,
            show_github: config.testimonials_config.show_github ?? true,
          }
        ];
      }

      if (configuredSheets.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const results: SheetWithData[] = [];
        
        for (const sheet of configuredSheets) {
          const list = await fetchTestimonials(sheet.sheet_url);
          results.push({
            id: sheet.id,
            title: sheet.title,
            show_rating: sheet.show_rating,
            show_feedback: sheet.show_feedback,
            show_dislike: sheet.show_dislike,
            show_skills: sheet.show_skills,
            show_course: sheet.show_course,
            show_linkedin: sheet.show_linkedin,
            show_github: sheet.show_github,
            testimonials: list
          });
        }

        setSheetsData(results);
        if (results.length > 0) {
          setActiveTab(results[0].id);
        }
      } catch (err) {
        console.error("Error loading sheet testimonials:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAllSheets();
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
            avatarUrl: prev.avatarUrl || profile.avatarUrl,
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

  const activeSheet = sheetsData.find(s => s.id === activeTab) || sheetsData[0];

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white selection:bg-indigo-500/30">
      <div className="fixed top-0 left-0 w-full h-[600px] -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.1),transparent)] pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 space-y-12">
        
        {/* Header */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-600 dark:text-indigo-400 text-xs font-extrabold uppercase tracking-wider">
            <GraduationCap className="w-4 h-4" />
            <span>Academic Feedback & Course Reviews</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-500 dark:from-white dark:via-neutral-200 dark:to-neutral-500 bg-clip-text text-transparent">
            Student Testimonials & Reviews
          </h1>
          <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Live feedback and course evaluations submitted directly by students from Superior University lab groups.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-semibold text-neutral-500">Connecting to live testimonial sheets...</p>
          </div>
        ) : sheetsData.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl space-y-4">
            <ShieldAlert className="w-12 h-12 text-neutral-400 mx-auto" />
            <h3 className="text-lg font-bold text-neutral-700 dark:text-neutral-300">No Testimonials Configured</h3>
            <p className="text-sm text-neutral-500 max-w-md mx-auto">Please navigate to Admin Controls to configure your Google Sheets response link.</p>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Sheet Tabs */}
            {sheetsData.length > 1 && (
              <div className="flex flex-wrap gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-3">
                {sheetsData.map((sheet) => (
                  <button
                    key={sheet.id}
                    onClick={() => setActiveTab(sheet.id)}
                    className={`px-4 py-2.5 text-xs font-extrabold rounded-xl transition-all border ${
                      activeTab === sheet.id
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/20"
                        : "bg-white/80 dark:bg-neutral-900/60 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-indigo-500/40"
                    }`}
                  >
                    {sheet.title} ({sheet.testimonials.length})
                  </button>
                ))}
              </div>
            )}

            {/* Testimonials Display Grid */}
            {activeSheet && activeSheet.testimonials.length === 0 ? (
              <div className="text-center py-20 border border-neutral-200 dark:border-neutral-900 rounded-3xl">
                <p className="text-sm text-neutral-500">No approved reviews found in this sheet.</p>
              </div>
            ) : (
              activeSheet && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeSheet.testimonials.map((t, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <SpotlightCard
                        onClick={() => handleCardClick(t)}
                        className="group p-6 cursor-pointer hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-5 h-full"
                      >
                        <div className="space-y-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              {t.avatarUrl ? (
                                <img
                                  src={t.avatarUrl}
                                  alt={t.name}
                                  className="w-11 h-11 rounded-full object-cover border border-neutral-200 dark:border-neutral-800 aspect-square shrink-0 ring-2 ring-indigo-500/20"
                                />
                              ) : (
                                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-black text-white aspect-square shrink-0">
                                  {t.name.split(" ").filter(Boolean).map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0">
                                <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                                  {t.name}
                                </h3>
                                <p className="text-[10px] text-neutral-500 font-semibold truncate">
                                  {t.programShort} • {t.sessionShort || "Superior University"}
                                </p>
                              </div>
                            </div>

                            {/* Rating badge with animated fill bar */}
                            {activeSheet.show_rating && t.rating && (
                              <div className="flex flex-col items-end gap-1 shrink-0">
                                <Badge variant="rating">
                                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                  <span>{t.rating}/10</span>
                                </Badge>
                                {/* Animated Rating Fill Bar */}
                                <div className="w-14 h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                                    style={{ width: `${(parseFloat(t.rating) / 10) * 100}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Course Tag */}
                          {activeSheet.show_course && t.courseShort && (
                            <Badge variant="tech" className="truncate max-w-full">
                              Course: {t.courseShort}
                            </Badge>
                          )}

                          {/* Feedback text */}
                          {activeSheet.show_feedback && t.feedback && (
                            <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-3 leading-relaxed italic">
                              "{t.feedback}"
                            </p>
                          )}
                        </div>

                        {/* Footer tags & links */}
                        <div className="space-y-3 pt-3 border-t border-neutral-200/60 dark:border-neutral-800/80 flex flex-col justify-end">
                          {activeSheet.show_skills && t.skills && t.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {t.skills.slice(0, 3).map((skill) => (
                                <span
                                  key={skill}
                                  className="text-[9px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-2 py-0.5 rounded-full border border-neutral-200 dark:border-neutral-700"
                                >
                                  {skill}
                                </span>
                              ))}
                              {t.skills.length > 3 && (
                                <span className="text-[9px] font-bold text-neutral-500 px-1 py-0.5">
                                  +{t.skills.length - 3}
                                </span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold text-neutral-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex items-center gap-0.5 transition-colors">
                              Read details <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                            </span>

                            <div className="flex items-center gap-2">
                              {activeSheet.show_linkedin && t.linkedinUrl && (
                                <a
                                  href={t.linkedinUrl}
                                  onClick={(e) => e.stopPropagation()}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-1"
                                >
                                  <Linkedin className="w-3.5 h-3.5" />
                                </a>
                              )}
                              {activeSheet.show_github && t.githubUrl && (
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
                        </div>
                      </SpotlightCard>
                    </motion.div>
                  ))}
                </div>
              )
            )}
          </div>
        )}

        {/* Testimonial Modal with Staggered Motion */}
        <AnimatePresence>
          {selectedTestimonial && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="w-full max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-y-auto max-h-[90vh] text-left"
              >
                <button
                  onClick={() => setSelectedTestimonial(null)}
                  className="absolute right-6 top-6 p-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-full text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-all"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Header */}
                <div className="flex items-center gap-4">
                  {selectedTestimonial.avatarUrl ? (
                    <img
                      src={selectedTestimonial.avatarUrl}
                      alt={selectedTestimonial.name}
                      className="w-16 h-16 rounded-full object-cover border border-neutral-200 dark:border-neutral-800 aspect-square shrink-0 ring-4 ring-indigo-500/20"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg font-black text-white aspect-square shrink-0">
                      {selectedTestimonial.name.split(" ").filter(Boolean).map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="space-y-1 text-left">
                    <h3 className="text-xl font-extrabold text-neutral-900 dark:text-white">{selectedTestimonial.name}</h3>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 font-semibold">
                      {selectedTestimonial.programLong} {selectedTestimonial.section && `(Sec ${selectedTestimonial.section})`}
                    </p>
                    <p className="text-[10px] text-neutral-500 font-medium">
                      Session: {selectedTestimonial.sessionLong || "Superior University"}
                    </p>
                  </div>
                </div>

                {/* GitHub Bio */}
                {selectedTestimonial.githubUsername && (
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-2 text-left">
                    <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">GitHub Bio</span>
                    {modalLoading ? (
                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <span className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        <span>Fetching profile...</span>
                      </div>
                    ) : selectedTestimonial.githubBio ? (
                      <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed font-medium">
                        {selectedTestimonial.githubBio}
                      </p>
                    ) : (
                      <p className="text-xs text-neutral-500 italic">No GitHub bio written on profile.</p>
                    )}
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  {selectedTestimonial.rating && (
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 rounded-2xl flex items-center gap-3">
                      <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                      <div>
                        <span className="text-[10px] uppercase font-bold text-neutral-500 block">Instructor Rating</span>
                        <span className="text-sm font-black text-neutral-900 dark:text-white">{selectedTestimonial.rating} / 10</span>
                      </div>
                    </div>
                  )}

                  {selectedTestimonial.courseLong && (
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 rounded-2xl flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-indigo-500" />
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold text-neutral-500 block">Registered Course</span>
                        <span className="text-sm font-bold text-neutral-900 dark:text-white block truncate">{selectedTestimonial.courseLong}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Feedback responses - Collapse empty sections cleanly */}
                <div className="space-y-4 text-left">
                  {selectedTestimonial.feedback && selectedTestimonial.feedback.trim() !== "" && (
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-black text-emerald-600 dark:text-emerald-400 block tracking-wider">What they liked most:</span>
                      <p className="italic text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed bg-neutral-50 dark:bg-neutral-950/60 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                        "{selectedTestimonial.feedback}"
                      </p>
                    </div>
                  )}

                  {selectedTestimonial.dislike && selectedTestimonial.dislike.trim() !== "" && (
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-black text-rose-600 dark:text-rose-400 block tracking-wider">Suggestions or constructive feedback:</span>
                      <p className="italic text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed bg-neutral-50 dark:bg-neutral-950/60 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                        "{selectedTestimonial.dislike}"
                      </p>
                    </div>
                  )}

                  {selectedTestimonial.improvement && selectedTestimonial.improvement.trim() !== "" && (
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-black text-indigo-600 dark:text-indigo-400 block tracking-wider">What could be improved:</span>
                      <p className="italic text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed bg-neutral-50 dark:bg-neutral-950/60 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                        "{selectedTestimonial.improvement}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Socials */}
                <div className="flex items-center gap-3 justify-end pt-4 border-t border-neutral-200 dark:border-neutral-800">
                  {selectedTestimonial.linkedinUrl && (
                    <a
                      href={selectedTestimonial.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                      <span>LinkedIn Profile</span>
                    </a>
                  )}

                  {selectedTestimonial.githubUrl && (
                    <a
                      href={selectedTestimonial.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-100 dark:bg-neutral-950 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-all"
                    >
                      <GithubBrand className="w-3.5 h-3.5" />
                      <span>GitHub Profile</span>
                    </a>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
