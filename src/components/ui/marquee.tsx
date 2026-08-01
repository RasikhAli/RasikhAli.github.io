"use client";

import React from "react";

interface MarqueeProps {
  items: string[];
  speed?: number;
  className?: string;
}

export function Marquee({ items, speed = 25, className = "" }: MarqueeProps) {
  return (
    <div className={`relative overflow-hidden w-full select-none ${className}`}>
      {/* Gradient fades on edges */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white dark:from-neutral-950 to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white dark:from-neutral-950 to-transparent z-10" />

      <div className="flex gap-3 w-max animate-marquee" style={{ animationDuration: `${speed}s` }}>
        {[...items, ...items, ...items].map((item, idx) => (
          <span
            key={idx}
            className="text-xs font-semibold px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 whitespace-nowrap shadow-sm hover:border-indigo-500/40 transition-colors"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
