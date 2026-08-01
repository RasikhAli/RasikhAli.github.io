"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  as?: React.ElementType;
}

export function TextReveal({ text, className = "", delay = 0, as: Component = "h1" }: TextRevealProps) {
  const shouldReduceMotion = useReducedMotion();
  const words = text.split(" ");

  if (shouldReduceMotion) {
    return <Component className={className}>{text}</Component>;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: delay * i },
    }),
  };

  const childVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", damping: 15, stiffness: 120 },
    },
  };

  return (
    <Component className={`flex flex-wrap items-center justify-center gap-x-[0.25em] ${className}`}>
      <motion.span
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="inline-flex flex-wrap items-center justify-center gap-x-[0.25em]"
      >
        {words.map((word, idx) => (
          <motion.span key={idx} variants={childVariants} className="inline-block">
            {word}
          </motion.span>
        ))}
      </motion.span>
    </Component>
  );
}
