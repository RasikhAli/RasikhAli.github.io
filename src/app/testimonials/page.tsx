"use client";

import React, { useState, useEffect } from "react";
import { Star, MessageSquare, GraduationCap, X, ChevronRight, BookOpen, Clock, ShieldAlert } from "lucide-react";
import { Github as GithubBrand, Linkedin } from "@/components/brand-icons";
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
      // Find configured sheets
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

        // Fetch avatars asynchronously for each sheet
        results.forEach((sheet, sheetIdx) => {
          sheet.testimonials.forEach(async (t, tIdx) => {
            if (t.githubUsername) {
              const profile = await getGithubProfile(t.githubUsername);
              if (profile.avatarUrl) {
                setSheetsData(prev => {
                  const updated = [...prev];
                  if (updated[sheetIdx] && updated[sheetIdx].testimonials[tIdx]) {
                    updated[sheetIdx].testimonials[tIdx] = {
                      ...updated[sheetIdx].testimonials[tIdx],
                      avatarUrl: profile.avatarUrl
                    };
                  }
                  return updated;
                });
              }
            }
          });
        });

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

  const activeSheet = sheetsData.find(s => s.id === activeTab) || sheetsData[0];

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white selection:bg-indigo-500/30">
      <div className="fixed top-0 left-0 w-full h-[600px] -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.08),transparent)] pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        
        {/* Header */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-500/10 rounded-xl">
              <GraduationCap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-neutral-900 to-neutral-500 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent">
              Student Testimonials & Reviews
            </h1>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 ml-[3.25rem] max-w-2xl leading-relaxed">
            Live feedback and reviews submitted by my students from Superior University lab groups.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm text-neutral-500">Loading student testimonials live...</p>
          </div>
        ) : sheetsData.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl space-y-4">
            <ShieldAlert className="w-12 h-12 text-neutral-400 mx-auto" />
            <h3 className="text-lg font-bold text-neutral-700 dark:text-neutral-350">No Testimonials Setup</h3>
            <p className="text-sm text-neutral-550 max-w-md mx-auto">Please go to /admin / Testimonials and configure your Google Sheet sharing link.</p>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Tabs for Multiple Sheets */}
            {sheetsData.length > 1 && (
              <div className="flex flex-wrap gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2">
                {sheetsData.map((sheet) => (
                  <button
                    key={sheet.id}
                    onClick={() => setActiveTab(sheet.id)}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all border ${
                      activeTab === sheet.id
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/20"
                        : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                    }`}
                  >
                    {sheet.title} ({sheet.testimonials.length})
                  </button>
                ))}
              </div>
            )}

            {/* Testimonials Display Grid */}
            {activeSheet && activeSheet.testimonials.length === 0 ? (
              <div className="text-center py-20 border border-neutral-100 dark:border-neutral-900 rounded-3xl">
                <p className="text-sm text-neutral-500">No approved reviews found in this sheet.</p>
              </div>
            ) : (
              activeSheet && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeSheet.testimonials.map((t, index) => (
                    <div
                      key={index}
                      onClick={() => handleCardClick(t)}
                      className="group bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl cursor-pointer hover:border-indigo-400/30 dark:hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            {t.avatarUrl ? (
                              <img
                                src={t.avatarUrl}
                                alt={t.name}
                                className="w-10 h-10 rounded-full object-cover border border-neutral-200 dark:border-neutral-800"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-650 flex items-center justify-center text-xs font-black text-white">
                                {t.name.split(" ").filter(Boolean).map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <h3 className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
                                {t.name}
                              </h3>
                              <p className="text-[10px] text-neutral-500 dark:text-neutral-450">
                                {t.program} • {t.session || "Superior University"}
                              </p>
                            </div>
                          </div>

                          {activeSheet.show_rating && t.rating && (
                            <div className="flex items-center gap-0.5 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full text-amber-500 shrink-0">
                              <Star className="w-3.5 h-3.5 fill-amber-500" />
                              <span className="text-xs font-black">{t.rating}</span>
                            </div>
                          )}
                        </div>

                        {/* Course Name */}
                        {activeSheet.show_course && t.course && (
                          <div className="text-[10px] font-semibold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-100 dark:border-indigo-550/20 w-fit truncate max-w-full">
                            Course: {t.course}
                          </div>
                        )}

                        {/* Snippet / Feedback */}
                        {activeSheet.show_feedback && t.feedback && (
                          <p className="text-xs text-neutral-600 dark:text-neutral-350 line-clamp-3 italic">
                            "{t.feedback}"
                          </p>
                        )}
                      </div>

                      {/* Card Footer tags and social icons */}
                      <div className="space-y-3 pt-3 border-t border-neutral-100 dark:border-neutral-800/60 flex flex-col justify-end">
                        {activeSheet.show_skills && t.skills && t.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {t.skills.slice(0, 3).map((skill) => (
                              <span
                                key={skill}
                                className="text-[9px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-2 py-0.5 rounded-full border border-neutral-200 dark:border-neutral-700"
                              >
                                {skill}
                              </span>
                            ))}
                            {t.skills.length > 3 && (
                              <span className="text-[9px] font-bold text-neutral-450 dark:text-neutral-500 px-1.5 py-0.5">
                                +{t.skills.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-neutral-450 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-0.5">
                            Read details <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </span>

                          <div className="flex items-center gap-2">
                            {activeSheet.show_linkedin && t.linkedinUrl && (
                              <a
                                href={t.linkedinUrl}
                                onClick={(e) => e.stopPropagation()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-neutral-450 hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors"
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
                                className="text-neutral-450 hover:text-white transition-colors"
                              >
                                <GithubBrand className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        )}

        {/* Testimonials Detail Popup Modal */}
        {selectedTestimonial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-y-auto max-h-[90vh]">
              
              {/* Close Button */}
              <button
                onClick={() => setSelectedTestimonial(null)}
                className="absolute right-6 top-6 p-2 bg-neutral-800/80 hover:bg-neutral-800 rounded-full text-neutral-400 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Student Identification header */}
              <div className="flex items-center gap-4">
                {selectedTestimonial.avatarUrl ? (
                  <img
                    src={selectedTestimonial.avatarUrl}
                    alt={selectedTestimonial.name}
                    className="w-16 h-16 rounded-full object-cover border border-neutral-800"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-655 flex items-center justify-center text-lg font-black text-white">
                    {selectedTestimonial.name.split(" ").filter(Boolean).map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="space-y-1">
                  <h3 className="text-lg font-extrabold text-white">{selectedTestimonial.name}</h3>
                  <p className="text-xs text-neutral-400">
                    {selectedTestimonial.program} {selectedTestimonial.section && `(Sec ${selectedTestimonial.section})`}
                  </p>
                  <p className="text-[10px] text-neutral-500">
                    Session: {selectedTestimonial.session || "Superior University"}
                  </p>
                </div>
              </div>

              {/* Github Bio (fetched dynamically) */}
              {selectedTestimonial.githubUsername && (
                <div className="p-4 bg-neutral-950/60 border border-neutral-850 rounded-2xl space-y-2">
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
                    <p className="text-xs text-neutral-500 italic">No GitHub bio written on their profile.</p>
                  )}
                </div>
              )}

              {/* Details display grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedTestimonial.rating && (
                  <div className="p-4 bg-neutral-950/40 border border-neutral-850 rounded-2xl flex items-center gap-3">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-500 block">Instructor Rating</span>
                      <span className="text-sm font-black text-white">{selectedTestimonial.rating} / 10</span>
                    </div>
                  </div>
                )}

                {selectedTestimonial.course && (
                  <div className="p-4 bg-neutral-950/40 border border-neutral-850 rounded-2xl flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-indigo-400" />
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-neutral-500 block">Registered Course</span>
                      <span className="text-sm font-bold text-white block truncate">{selectedTestimonial.course}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Feedback responses */}
              <div className="space-y-4">
                {selectedTestimonial.feedback && (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-black text-emerald-500 block tracking-wider">What they liked most about the teaching:</span>
                    <p className="italic text-xs text-neutral-300 leading-relaxed bg-neutral-950/60 p-3.5 rounded-2xl border border-neutral-850">
                      "{selectedTestimonial.feedback}"
                    </p>
                  </div>
                )}

                {selectedTestimonial.dislike && (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-black text-rose-500 block tracking-wider font-bold">What they disliked or suggested:</span>
                    <p className="italic text-xs text-neutral-305 leading-relaxed bg-neutral-950/60 p-3.5 rounded-2xl border border-neutral-850">
                      "{selectedTestimonial.dislike}"
                    </p>
                  </div>
                )}

                {selectedTestimonial.improvement && (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-black text-indigo-400 block tracking-wider font-bold">What could be improved:</span>
                    <p className="italic text-xs text-neutral-305 leading-relaxed bg-neutral-950/60 p-3.5 rounded-2xl border border-neutral-850">
                      "{selectedTestimonial.improvement}"
                    </p>
                  </div>
                )}
              </div>

              {/* Skills and Footer Socials */}
              <div className="space-y-4 pt-4 border-t border-neutral-800">
                {selectedTestimonial.skills && selectedTestimonial.skills.length > 0 && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-500 block mb-2">Skills Gained:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedTestimonial.skills.map((skill) => (
                        <span
                          key={skill}
                          className="text-[10px] font-semibold bg-neutral-950 border border-neutral-800 text-neutral-300 px-2.5 py-1 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 justify-end pt-2">
                  {selectedTestimonial.linkedinUrl && (
                    <a
                      href={selectedTestimonial.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-650 hover:bg-indigo-600 rounded-xl text-xs font-semibold text-white transition-all"
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
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white transition-all"
                    >
                      <GithubBrand className="w-3.5 h-3.5" />
                      <span>GitHub Profile</span>
                    </a>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
