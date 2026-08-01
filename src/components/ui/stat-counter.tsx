"use client";

import React, { useEffect, useState, useRef } from "react";
import { useInView, useReducedMotion } from "framer-motion";

interface StatCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
  label?: string;
}

export function StatCounter({
  value,
  suffix = "",
  prefix = "",
  duration = 2000,
  className = "",
  label,
}: StatCounterProps) {
  const shouldReduceMotion = useReducedMotion();
  const [count, setCount] = useState(() => (shouldReduceMotion ? value : 0));
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView || shouldReduceMotion) return;

    let start = 0;
    const end = value;
    const totalSteps = 40;
    const stepTime = duration / totalSteps;
    const increment = (end - start) / totalSteps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isInView, value, duration, shouldReduceMotion]);

  return (
    <div ref={ref} className="text-center">
      <div className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight ${className}`}>
        {prefix}
        {count}
        {suffix}
      </div>
      {label && (
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mt-1">
          {label}
        </p>
      )}
    </div>
  );
}
