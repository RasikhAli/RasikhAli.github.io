"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, MessageSquare, AlertCircle, Plus, Trash2, Edit2, Check, X, FileSpreadsheet } from "lucide-react";
import { useGitHub } from "@/hooks/use-github";
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
  const router = useRouter();
  const { updateSiteConfig, status, statusMessage, errorMsg } = useGitHub();
  const [successMsg, setSuccessMsg] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [sheets, setSheets] = useState<TestimonialSheet[]>([]);
  const [editingSheet, setEditingSheet] = useState<Partial<TestimonialSheet> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Load existing sheets
    const config = siteConfigData as any;
    if (config.testimonials_sheets) {
      setSheets(config.testimonials_sheets);
    } else if (config.testimonials_config) {
      // Migrate legacy config if present
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

    // ID validation
    const idRegex = /^[a-z0-9-]+$/;
    if (!idRegex.test(editingSheet.id)) {
      alert("ID must be alphanumeric, lowercase, and hyphens only (e.g., 'superior-uni-s25')");
      return;
    }

    if (isAdding) {
      // Check duplicate ID
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
    <div className="min-h-screen bg-neutral-950 text-white py-16 selection:bg-indigo-500/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-sm font-semibold text-neutral-450 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Admin Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-neutral-900 text-neutral-400 border border-neutral-800 px-2.5 py-1 rounded">
              TESTIMONIALS MANAGER
            </span>
          </div>
        </div>

        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <MessageSquare className="w-8 h-8 text-indigo-400" />
              <span>Testimonials Configuration</span>
            </h1>
            <p className="text-sm text-neutral-450">
              Manage multiple Google Sheets integrations to fetch and display student reviews on the portfolio.
            </p>
          </div>
          <button
            onClick={handleAddClick}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-650 hover:bg-indigo-650/80 text-xs font-semibold rounded-lg shadow transition-colors w-fit"
          >
            <Plus className="w-4 h-4" />
            <span>Add Google Sheet</span>
          </button>
        </div>

        {/* Feedback Messages */}
        {successMsg && (
          <div className="flex items-center gap-2.5 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-400 font-semibold animate-in fade-in duration-200">
            <Check className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-center gap-2.5 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 font-semibold animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMsg}</span>
          </div>
        )}

        {status === "loading" && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-center shadow-2xl">
              <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-indigo-400" />
              <h3 className="text-lg font-semibold text-white">Publishing updates</h3>
              <p className="mt-2 text-sm text-neutral-400">{statusMessage || "Committing modifications to Github repository..."}</p>
            </div>
          </div>
        )}

        {/* Modal Overlay / Forms */}
        {editingSheet && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
                  <span>{isAdding ? "Add New Google Sheet" : "Edit Sheet Configuration"}</span>
                </h3>
                <button
                  onClick={() => setEditingSheet(null)}
                  className="text-neutral-450 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Unique ID (Hyphenated, Lowercase)</label>
                    <input
                      type="text"
                      value={editingSheet.id || ""}
                      disabled={isEditing}
                      onChange={(e) => setEditingSheet({ ...editingSheet, id: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      placeholder="e.g. superior-university-s25"
                      className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-300 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Section Heading / Title</label>
                    <input
                      type="text"
                      value={editingSheet.title || ""}
                      onChange={(e) => setEditingSheet({ ...editingSheet, title: e.target.value })}
                      placeholder="e.g. Students Testimonial"
                      className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-300 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Google Sheet sharing URL</label>
                  <input
                    type="url"
                    value={editingSheet.sheet_url || ""}
                    onChange={(e) => setEditingSheet({ ...editingSheet, sheet_url: e.target.value })}
                    placeholder="https://docs.google.com/spreadsheets/d/.../edit?usp=sharing"
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-805 rounded-lg text-sm text-neutral-305 focus:outline-none focus:border-indigo-500"
                    required
                  />
                  <p className="text-[10px] text-neutral-500 mt-1">Make sure anyone with the link can view the sheet.</p>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Display columns & elements</label>
                  <div className="grid grid-cols-2 gap-3 p-4 bg-neutral-950/60 border border-neutral-805 rounded-lg">
                    {[
                      { key: "show_rating", label: "Show Rating Stars" },
                      { key: "show_feedback", label: "Show Positive Feedback" },
                      { key: "show_dislike", label: "Show Dislikes / Critique" },
                      { key: "show_skills", label: "Show Gained Skills" },
                      { key: "show_course", label: "Show Course Names" },
                      { key: "show_linkedin", label: "Show LinkedIn Icons" },
                      { key: "show_github", label: "Show GitHub Icons" }
                    ].map((item) => (
                      <label key={item.key} className="flex items-center gap-2.5 text-xs text-neutral-305 hover:text-white cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={!!(editingSheet as any)[item.key]}
                          onChange={(e) => setEditingSheet({ ...editingSheet, [item.key]: e.target.checked })}
                          className="rounded border-neutral-805 bg-neutral-950 text-indigo-650 focus:ring-indigo-500/20"
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setEditingSheet(null)}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-650 hover:bg-indigo-600 text-xs font-semibold rounded-lg shadow transition-colors"
                  >
                    Confirm Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Sheets List Cards */}
        {sheets.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-neutral-800 bg-neutral-900/10 rounded-2xl space-y-3">
            <FileSpreadsheet className="w-12 h-12 text-neutral-600 mx-auto" />
            <h3 className="text-md font-bold text-neutral-400">No sheets configured</h3>
            <p className="text-xs text-neutral-500 max-w-xs mx-auto">Click "Add Google Sheet" above to link a Google Sheet to retrieve testimonials.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sheets.map((sheet) => (
              <div
                key={sheet.id}
                className="bg-neutral-900/30 border border-neutral-850 p-6 rounded-2xl flex flex-col justify-between hover:border-neutral-700 transition-all shadow-md"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-850 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white">{sheet.title}</h3>
                      <span className="text-[10px] text-indigo-400 font-mono mt-0.5 block">{sheet.id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditClick(sheet)}
                        className="p-1.5 hover:bg-neutral-800 hover:text-white rounded text-neutral-450 transition-colors"
                        title="Edit Configuration"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(sheet.id)}
                        className="p-1.5 hover:bg-red-955/20 hover:text-red-400 rounded text-neutral-450 transition-colors"
                        title="Delete Configuration"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-neutral-400">
                    <p className="truncate"><strong className="text-neutral-500 font-bold uppercase tracking-wider text-[9px] mr-1 block">URL:</strong>{sheet.sheet_url}</p>
                    <div>
                      <strong className="text-neutral-500 font-bold uppercase tracking-wider text-[9px] mr-1 block mb-1">Display elements:</strong>
                      <div className="flex flex-wrap gap-1.5">
                        {sheet.show_rating && <span className="bg-neutral-950 border border-neutral-800 px-2 py-0.5 rounded text-[9px]">Rating</span>}
                        {sheet.show_feedback && <span className="bg-neutral-950 border border-neutral-800 px-2 py-0.5 rounded text-[9px]">Feedback</span>}
                        {sheet.show_dislike && <span className="bg-neutral-950 border border-neutral-800 px-2 py-0.5 rounded text-[9px]">Dislikes</span>}
                        {sheet.show_skills && <span className="bg-neutral-950 border border-neutral-800 px-2 py-0.5 rounded text-[9px]">Skills</span>}
                        {sheet.show_course && <span className="bg-neutral-950 border border-neutral-800 px-2 py-0.5 rounded text-[9px]">Courses</span>}
                        {sheet.show_linkedin && <span className="bg-neutral-950 border border-neutral-800 px-2 py-0.5 rounded text-[9px]">LinkedIn</span>}
                        {sheet.show_github && <span className="bg-neutral-950 border border-neutral-800 px-2 py-0.5 rounded text-[9px]">GitHub</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Global Save Trigger */}
        <div className="flex justify-end pt-6 border-t border-neutral-900">
          <button
            onClick={handleSaveAll}
            disabled={status === "loading"}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-650 hover:bg-indigo-600 text-sm font-semibold rounded-lg shadow-lg hover:shadow-indigo-500/10 transition-all text-white disabled:opacity-50"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Committing all configurations...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save configurations to Git</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
