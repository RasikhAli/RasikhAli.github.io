"use client";

import React, { useState } from "react";
import { Code2, Terminal, Layers } from "lucide-react";

interface TechStackPlaceholderProps {
  techStack: string[];
  title?: string;
  className?: string;
}

const TECH_ICON_MAP: Record<string, string> = {
  react: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
  "react.js": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
  next: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg",
  "next.js": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg",
  typescript: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
  javascript: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
  python: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
  node: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
  "node.js": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
  express: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg",
  tailwind: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg",
  tailwindcss: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg",
  html: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
  css: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",
  vue: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg",
  "vue.js": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg",
  angular: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg",
  docker: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
  mongodb: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg",
  postgresql: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",
  mysql: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg",
  git: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg",
  github: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg",
  flask: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg",
  django: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg",
  fastapi: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg",
  java: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",
  "c++": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg",
  csharp: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg",
  go: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg",
  rust: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rust/rust-original.svg",
  swift: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swift/swift-original.svg",
  kotlin: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kotlin/kotlin-original.svg",
  figma: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg",
  firebase: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg",
};

export function TechStackPlaceholder({ techStack, title, className = "" }: TechStackPlaceholderProps) {
  const [failedIcons, setFailedIcons] = useState<Record<string, boolean>>({});

  const handleIconError = (tech: string) => {
    setFailedIcons((prev) => ({ ...prev, [tech]: true }));
  };

  const displayTechs = techStack && techStack.length > 0 ? techStack : ["Source Code", "Software Project"];

  return (
    <div
      className={`w-full h-full min-h-[160px] relative overflow-hidden bg-neutral-950 flex flex-col items-center justify-center p-6 border border-neutral-800/60 select-none ${className}`}
    >
      {/* Background ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Decorative top icon */}
      <div className="relative mb-3 p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 shadow-inner">
        <Code2 className="w-6 h-6 text-indigo-400" />
      </div>

      {/* Tech Stack Icons / Badges Container */}
      <div className="relative flex flex-wrap items-center justify-center gap-2.5 max-w-xs z-10">
        {displayTechs.slice(0, 6).map((tech) => {
          const lower = tech.toLowerCase().trim();
          const iconUrl = TECH_ICON_MAP[lower] || `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${lower}/${lower}-original.svg`;
          const isFailed = failedIcons[tech];

          return (
            <div
              key={tech}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900/90 border border-neutral-800 hover:border-indigo-500/40 rounded-xl shadow-md backdrop-blur-sm transition-all group hover:scale-105"
            >
              {!isFailed && iconUrl ? (
                <img
                  src={iconUrl}
                  alt={tech}
                  onError={() => handleIconError(tech)}
                  className="w-4 h-4 object-contain filter group-hover:drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                />
              ) : (
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              )}
              <span className="text-xs font-extrabold text-neutral-200 tracking-tight">{tech}</span>
            </div>
          );
        })}

        {displayTechs.length > 6 && (
          <div className="px-2.5 py-1 bg-neutral-900/80 border border-neutral-800 rounded-xl text-[10px] font-bold text-neutral-400">
            +{displayTechs.length - 6} more
          </div>
        )}
      </div>

      {title && (
        <span className="mt-3 text-[11px] font-extrabold uppercase tracking-widest text-neutral-500/80">
          No Screenshots Uploaded Yet
        </span>
      )}
    </div>
  );
}
