"use client";

import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export function Card({ children, className = "", hoverEffect = true, ...props }: CardProps) {
  return (
    <div
      className={`relative bg-white/80 dark:bg-neutral-900/50 border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl p-6 backdrop-blur-md transition-all duration-300 ${
        hoverEffect
          ? "hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1"
          : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
