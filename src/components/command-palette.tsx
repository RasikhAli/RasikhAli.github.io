"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Command, Sun, Moon, Laptop, Folder, Users, Calendar, Settings, ShieldAlert, X } from "lucide-react";
import { useKeyboard } from "@/hooks/use-keyboard";
import { useTheme } from "./theme-provider";
import projectsData from "@data/projects.json";

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { setTheme } = useTheme();
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Toggle open state on Cmd+K / Ctrl+K
  useKeyboard([
    {
      combo: { key: "k", ctrlKey: true },
      callback: () => setIsOpen((prev) => !prev),
    },
    {
      combo: { key: "k", metaKey: true },
      callback: () => setIsOpen((prev) => !prev),
    },
    {
      combo: { key: "Escape" },
      callback: () => setIsOpen(false),
    },
  ]);

  // Handle click outside modal to close
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("mousedown", handleOutsideClick);
      inputRef.current?.focus();
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      window.removeEventListener("mousedown", handleOutsideClick);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const runCommand = (action: () => void) => {
    action();
    setIsOpen(false);
    setQuery("");
  };

  const navigationCommands = [
    { name: "Go to Dashboard", icon: Laptop, action: () => router.push("/") },
    { name: "Explore Projects Grid", icon: Folder, action: () => router.push("/projects") },
    { name: "View Timeline", icon: Calendar, action: () => router.push("/timeline") },
    { name: "Developer Directory", icon: Users, action: () => router.push("/developers") },
    { name: "Interactive Tech Explorer", icon: Settings, action: () => router.push("/tech") },
    { name: "Admin Dashboard", icon: ShieldAlert, action: () => router.push("/admin") },
  ];

  const themeCommands = [
    { name: "Set Dark Mode", icon: Moon, action: () => setTheme("dark") },
    { name: "Set Light Mode", icon: Sun, action: () => setTheme("light") },
    { name: "Set System Mode", icon: Laptop, action: () => setTheme("system") },
  ];

  const filteredProjects = projectsData.filter((project) =>
    project.title.toLowerCase().includes(query.toLowerCase()) ||
    project.short_description.toLowerCase().includes(query.toLowerCase()) ||
    project.tech_stack.some(t => t.toLowerCase().includes(query.toLowerCase()))
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
      <div
        ref={modalRef}
        className="w-full max-w-xl bg-neutral-900/90 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden backdrop-blur-md animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Search Input */}
        <div className="flex items-center px-4 border-b border-neutral-800">
          <Search className="w-5 h-5 text-neutral-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search projects..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full py-4 bg-transparent border-none outline-none text-neutral-200 placeholder-neutral-500 text-sm"
          />
          <kbd className="hidden sm:inline-flex items-center h-5 select-none pointer-events-none rounded border border-neutral-800 bg-neutral-950 px-1.5 font-mono text-[10px] font-medium text-neutral-400">
            ESC
          </kbd>
          <button
            onClick={() => setIsOpen(false)}
            className="ml-3 p-1 rounded-md text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command Options List */}
        <div className="max-h-[350px] overflow-y-auto p-2 space-y-4">
          {query.length === 0 ? (
            <>
              {/* Navigation Group */}
              <div>
                <div className="px-3 py-1.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Navigation
                </div>
                <div className="mt-1 space-y-1">
                  {navigationCommands.map((cmd) => (
                    <button
                      key={cmd.name}
                      onClick={() => runCommand(cmd.action)}
                      className="w-full flex items-center px-3 py-2 text-sm text-neutral-300 hover:text-white rounded-lg hover:bg-neutral-800/60 transition-colors"
                    >
                      <cmd.icon className="w-4 h-4 mr-3 text-neutral-400" />
                      {cmd.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Settings Group */}
              <div>
                <div className="px-3 py-1.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Theme Options
                </div>
                <div className="mt-1 space-y-1">
                  {themeCommands.map((cmd) => (
                    <button
                      key={cmd.name}
                      onClick={() => runCommand(cmd.action)}
                      className="w-full flex items-center px-3 py-2 text-sm text-neutral-300 hover:text-white rounded-lg hover:bg-neutral-800/60 transition-colors"
                    >
                      <cmd.icon className="w-4 h-4 mr-3 text-neutral-400" />
                      {cmd.name}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div>
              <div className="px-3 py-1.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Matching Projects ({filteredProjects.length})
              </div>
              <div className="mt-1 space-y-1">
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => runCommand(() => router.push(`/projects/${project.id}`))}
                      className="w-full text-left px-3 py-3 text-sm text-neutral-300 hover:text-white rounded-lg hover:bg-neutral-800/60 transition-colors"
                    >
                      <div className="font-semibold text-neutral-200">{project.title}</div>
                      <div className="text-xs text-neutral-400 mt-0.5 line-clamp-1">{project.short_description}</div>
                      <div className="flex gap-1.5 mt-1">
                        {project.tech_stack.map((tech) => (
                          <span key={tech} className="text-[10px] bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-6 text-sm text-neutral-500">
                    No matching projects or commands found.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
