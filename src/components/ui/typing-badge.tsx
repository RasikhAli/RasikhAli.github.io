"use client";

import React, { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

interface TypingBadgeProps {
  lines: string[];
}

export function TypingBadge({ lines }: TypingBadgeProps) {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!lines || lines.length === 0) return;

    const currentLine = lines[currentLineIndex];
    let timeout: NodeJS.Timeout;

    if (!isDeleting) {
      if (displayedText.length < currentLine.length) {
        timeout = setTimeout(() => {
          setDisplayedText(currentLine.slice(0, displayedText.length + 1));
        }, 35);
      } else {
        // Pause at full text
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 2200);
      }
    } else {
      if (displayedText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayedText(currentLine.slice(0, displayedText.length - 1));
        }, 18);
      } else {
        setIsDeleting(false);
        setCurrentLineIndex((prev) => (prev + 1) % lines.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, currentLineIndex, lines]);

  if (!lines || lines.length === 0) return null;

  return (
    <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-neutral-900/80 dark:bg-neutral-900/90 border border-neutral-700/60 dark:border-neutral-800 rounded-full shadow-lg backdrop-blur-md transition-all group hover:border-indigo-500/50">
      <div className="p-1 rounded-full bg-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-transform">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
      </div>
      <span className="text-xs sm:text-sm font-semibold text-neutral-200 dark:text-neutral-200 min-h-[1.25rem] flex items-center">
        {displayedText}
        <span className="inline-block w-1.5 h-4 ml-1 bg-indigo-500 animate-pulse rounded-sm" />
      </span>
    </div>
  );
}
