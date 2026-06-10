"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, Moon, Laptop, Command, Menu, X, ShieldAlert, CheckCircle2 } from "lucide-react";
import { useTheme } from "./theme-provider";
import siteConfig from "@data/site-config.json";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"synced" | "configured" | "pending">("synced");

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("github_pat");
      if (token) {
        setSyncStatus("configured");
      }
    }
  }, []);

  const navLinks = [
    { name: "Projects", path: "/projects" },
    { name: "Timeline", path: "/timeline" },
    { name: "Tech Explorer", path: "/tech" },
    { name: "Developers", path: "/developers" },
    { name: "Testimonials", path: "/testimonials" },
  ];

  const toggleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200/40 dark:border-neutral-800/40 bg-white/70 dark:bg-neutral-950/70 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand/Owner */}
        <div className="flex items-center gap-3">
          <Link href="/" className="font-semibold text-lg tracking-tight bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent">
            {siteConfig.portfolio_owner_name}
          </Link>
          {syncStatus !== "synced" && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-2.5 h-2.5" /> CMS Ready
            </span>
          )}
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.path}
              className={`text-sm font-medium transition-colors ${
                isActive(link.path)
                  ? "text-black dark:text-white"
                  : "text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right side controls */}
        <div className="hidden md:flex items-center gap-4">
          {/* Command Palette Hint Button */}
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                const event = new KeyboardEvent("keydown", {
                  key: "k",
                  ctrlKey: true,
                  bubbles: true,
                });
                window.dispatchEvent(event);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-lg transition-colors"
          >
            <Command className="w-3.5 h-3.5" />
            <span>Search</span>
            <kbd className="font-mono text-[9px] bg-neutral-200 dark:bg-neutral-950 px-1 py-0.5 rounded ml-1 border border-neutral-300 dark:border-neutral-800">
              Ctrl K
            </kbd>
          </button>

          {/* Theme Selector */}
          <button
            onClick={toggleTheme}
            className="p-2 text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
            title="Toggle theme"
          >
            {mounted && theme === "light" && <Sun className="w-4 h-4" />}
            {mounted && theme === "dark" && <Moon className="w-4 h-4" />}
            {(!mounted || theme === "system") && <Laptop className="w-4 h-4" />}
          </button>

          {/* Admin link */}
          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-neutral-950 text-white dark:bg-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-100 rounded-lg transition-colors border border-neutral-800 dark:border-white/20"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Admin</span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
          >
            {mounted && theme === "light" && <Sun className="w-4 h-4" />}
            {mounted && theme === "dark" && <Moon className="w-4 h-4" />}
            {(!mounted || theme === "system") && <Laptop className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu dropdown */}
      {isOpen && (
        <div className="md:hidden border-t border-neutral-200/40 dark:border-neutral-800/40 bg-white dark:bg-neutral-950 transition-all duration-300">
          <div className="px-2 pt-2 pb-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive(link.path)
                    ? "bg-neutral-100 text-black dark:bg-neutral-900 dark:text-white"
                    : "text-neutral-500 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-900"
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-semibold text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900"
            >
              Admin Controls
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
