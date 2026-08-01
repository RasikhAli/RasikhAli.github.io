"use client";

import React from "react";

export type BadgeVariant = "completed" | "in_progress" | "planned" | "tech" | "rating" | "neutral" | "primary";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "neutral", children, className = "", ...props }: BadgeProps) {
  const variantStyles: Record<BadgeVariant, string> = {
    completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    in_progress: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    planned: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    tech: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20 hover:bg-indigo-500/20",
    rating: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-black",
    neutral: "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700",
    primary: "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/20",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border transition-colors ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
