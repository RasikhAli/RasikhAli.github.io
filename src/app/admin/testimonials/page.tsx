"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Save, Loader2, MessageSquare, AlertCircle, Plus, Trash2, Edit2, Sparkles, X, FileSpreadsheet } from "lucide-react";
import { useGitHub } from "@/hooks/use-github";
import { Badge } from "@/components/ui/badge";
import siteConfigData from "../../../../data/site-config.json";

interface TestimonialSheet {
  id: string;
  sheet_url: string;
  title: string;
  show_rating: boolean;
  show_feedback: boolean;
  show_dislike: boolean;
  show_skills: boolean;
  show_course: boolean;
  show_linkedin: boolean;
  show_github: boolean;
}

export default function AdminTestimonialsPage() {
  const { updateSiteConfig, status, errorMsg } = useGitHub();
  const [successMsg, setSuccessMsg] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [sheets, setSheets] = useState<TestimonialSheet[]>([]);
  const [editingSheet, setEditingSheet] = useState<Partial<TestimonialSheet> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const config = siteConfigData as any;
    if (config.testimonials_sheets) {
      setSheets(config.testimonials_sheets);
    } else if (config.testimonials_config) {
      setSheets([
        {
          id: "default-sheet",
          sheet_url: config.testimonials_config.sheet_url || "",
          title: config.testimonials_config.title || "Students Testimonial",
          show_rating: config.testimonials_config.show_rating ?? true,
          show_feedback: config.testimonials_config.show_feedback ?? true,
          show_dislike: config.testimonials_config.show_dislike ?? false,
          show_skills: config.testimonials_config.show_skills ?? true,
          show_course: config.testimonials_config.show_course ?? true,
          show_linkedin: config.testimonials_config.show_linkedin ?? true,
          show_github: config.testimonials_config.show_github ?? true,
        }
      ]);
    }
  }, []);

  const handleSaveAll = async () => {
    setSuccessMsg("");
    const updatedConfig = {
      ...(siteConfigData as any),
      testimonials_sheets: sheets
    };

    const success = await updateSiteConfig(updatedConfig);
    if (success) {
      setSuccessMsg("Testimonials configuration updated and committed successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
    }
  };

  const handleAddClick = () => {
    setEditingSheet({
      id: "",
      sheet_url: "",
      title: "Students Testimonial",
      show_rating: true,
      show_feedback: true,
      show_dislike: false,
      show_skills: true,
      show_course: true,
      show_linkedin: true,
      show_github: true
    });
    setIsAdding(true);
    setIsEditing(false);
  };

  const handleEditClick = (sheet: TestimonialSheet) => {
    setEditingSheet({ ...sheet });
    setIsEditing(true);
    setIsAdding(false);
  };

  const handleDeleteClick = (id: string) => {
    if (confirm("Are you sure you want to delete this Google Sheet configuration?")) {
      setSheets(sheets.filter(s => s.id !== id));
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSheet || !editingSheet.id || !editingSheet.sheet_url || !editingSheet.title) {
      alert("Please fill in all required fields (ID, Sheet URL, and Title)");
      return;
    }

    const idRegex = /^[a-z0-9-]+$/;
    if (!idRegex.test(editingSheet.id)) {
      alert("ID must be alphanumeric, lowercase, and hyphens only.");
      return;
    }

    if (isAdding) {
      if (sheets.some(s => s.id === editingSheet.id)) {
        alert("A sheet with this ID already exists.");
        return;
      }
      setSheets([...sheets, editingSheet as TestimonialSheet]);
    } else if (isEditing) {
      setSheets(sheets.map(s => s.id === editingSheet.id ? (editingSheet as TestimonialSheet) : s));
    }

    setEditingSheet(null);
    setIsAdding(false);
    setIsEditing(false);
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-indigo-500/30">
      <div className="fixed top-0 left-0 w-full h-[600px] -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.08),transparent)] pointer-events-none" />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 space-y-10">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-neutral-900 pb-5">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Admin Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddClick}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-extrabold rounded-xl text-white transition-all shadow-lg shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Sheet</span>
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
              <MessageSquare className="w-6 h-6 text-indigo-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">Testimonials Config</h1>
          </div>
          <p className="text-xs text-neutral-400 ml-[3.25rem]">
            Manage Google Sheet endpoints, display titles, and field visibility for live student reviews.
          </p>
        </div>

        {/* Alerts */}
        {successMsg && (
          <div className="flex items-center gap-2.5 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs text-emerald-400 font-bold">
            <Sparkles className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-start gap-2.5 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs text-rose-400 font-bold">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Sheets List with Height Collapse Animation */}
        <div className="space-y-3">
          <AnimatePresence>
            {sheets.map((sheet) => (
              <motion.div
                key={sheet.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700/80 rounded-2xl gap-4 transition-all backdrop-blur-md">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-emerald-400">
                      <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold text-white group-hover:text-indigo-400 transition-colors truncate">
                          {sheet.title}
                        </h3>
                        <Badge variant="primary" className="text-[9px] font-mono">{sheet.id}</Badge>
                      </div>
                      <p className="text-xs text-neutral-400 font-mono truncate mt-1">{sheet.sheet_url}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => handleEditClick(sheet)}
                      className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-neutral-300 hover:text-white transition-all text-xs font-bold flex items-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Config</span>
                    </button>
                    <button
                      onClick={() => handleDeleteClick(sheet.id)}
                      className="p-2 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl text-rose-400 transition-all text-xs font-bold flex items-center gap-1.5 border border-rose-500/20"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Global Save Action */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSaveAll}
            disabled={status === "loading"}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-extrabold transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Committing to repository...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save & Commit Configuration</span>
              </>
            )}
          </button>
        </div>

        {/* Edit / Add Sheet Modal */}
        <AnimatePresence>
          {(isAdding || isEditing) && editingSheet && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 relative"
              >
                <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
                  <h3 className="text-xl font-extrabold text-white">
                    {isAdding ? "Add Google Sheet Config" : `Edit Sheet: ${editingSheet.title}`}
                  </h3>
                  <button
                    onClick={() => {
                      setIsAdding(false);
                      setIsEditing(false);
                      setEditingSheet(null);
                    }}
                    className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-1.5">Sheet ID (hyphenated)</label>
                      <input
                        type="text"
                        disabled={isEditing}
                        value={editingSheet.id || ""}
                        onChange={(e) => setEditingSheet({ ...editingSheet, id: e.target.value })}
                        placeholder="superior-lab-s25"
                        className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-1.5">Display Title</label>
                      <input
                        type="text"
                        value={editingSheet.title || ""}
                        onChange={(e) => setEditingSheet({ ...editingSheet, title: e.target.value })}
                        placeholder="Students Testimonials"
                        className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200 focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-1.5">Google Sheet CSV / Export URL</label>
                    <input
                      type="url"
                      value={editingSheet.sheet_url || ""}
                      onChange={(e) => setEditingSheet({ ...editingSheet, sheet_url: e.target.value })}
                      placeholder="https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?output=csv"
                      className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200 focus:outline-none focus:border-indigo-500 font-mono"
                      required
                    />
                  </div>

                  {/* Toggles */}
                  <div className="space-y-3 pt-3 border-t border-neutral-800">
                    <label className="block text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider">Field Display Toggles</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: "show_rating", label: "Show Rating Stars" },
                        { key: "show_feedback", label: "Show Feedback Text" },
                        { key: "show_dislike", label: "Show Dislike Section" },
                        { key: "show_skills", label: "Show Skills Gained" },
                        { key: "show_course", label: "Show Course Code" },
                        { key: "show_linkedin", label: "Show LinkedIn Link" },
                        { key: "show_github", label: "Show GitHub Link" },
                      ].map((t) => (
                        <label key={t.key} className="flex items-center gap-2 text-xs font-semibold text-neutral-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(editingSheet as any)[t.key] ?? false}
                            onChange={(e) => setEditingSheet({ ...editingSheet, [t.key]: e.target.checked })}
                            className="rounded border-neutral-800 bg-neutral-950 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>{t.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-6 border-t border-neutral-800">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAdding(false);
                        setIsEditing(false);
                        setEditingSheet(null);
                      }}
                      className="px-5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-bold text-neutral-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-extrabold transition-all shadow-lg shadow-indigo-600/20"
                    >
                      Save Sheet Config
                    </button>
                  </div>

                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
