"use client";

import React, { useState } from "react";
import { Terminal, Code, Cpu, Activity, Copy, Check, Sparkles } from "lucide-react";

export function InteractiveTerminal() {
  const [activeTab, setActiveTab] = useState<"terminal" | "python" | "metrics">("terminal");
  const [copied, setCopied] = useState(false);

  const copySnippet = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-xl mx-auto rounded-3xl bg-neutral-950/90 border border-neutral-800/80 shadow-2xl backdrop-blur-2xl overflow-hidden ring-1 ring-white/10 text-left">
      {/* Window Title Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-neutral-900/80 border-b border-neutral-800/80">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500/80" />
          <span className="w-3 h-3 rounded-full bg-amber-500/80" />
          <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-neutral-950/80 p-0.5 rounded-xl border border-neutral-800/60">
          <button
            onClick={() => setActiveTab("terminal")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "terminal"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Terminal className="w-3 h-3" />
            <span>bash</span>
          </button>
          <button
            onClick={() => setActiveTab("python")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "python"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Code className="w-3 h-3" />
            <span>agent.py</span>
          </button>
          <button
            onClick={() => setActiveTab("metrics")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "metrics"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Cpu className="w-3 h-3" />
            <span>sys_diag</span>
          </button>
        </div>

        <span className="text-[10px] font-mono text-neutral-500">v2.4.0</span>
      </div>

      {/* Terminal Content Area */}
      <div className="p-5 font-mono text-xs leading-relaxed text-neutral-300 min-h-[300px] flex flex-col justify-between">
        {activeTab === "terminal" && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div>
              <p className="text-neutral-500"># Querying developer profile</p>
              <p className="text-emerald-400">$ whoami --credentials</p>
              <p className="text-neutral-200 mt-0.5">
                Rasikh Ali <span className="text-amber-400 font-bold">[Gold Medalist]</span>
              </p>
              <p className="text-neutral-400 text-[11px]">
                Junior Lecturer @ Superior University | AI & Software Engineer
              </p>
            </div>

            <div className="pt-2 border-t border-neutral-900">
              <p className="text-emerald-400">$ cat specialties.txt</p>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {["LLMs & RAG", "AI Agents", "Python / FastAPI", "Next.js / React", "Web Scraping", "System Arch"].map((tag) => (
                  <span key={tag} className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded text-[10px] text-indigo-400 font-semibold">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-900">
              <p className="text-emerald-400">$ git log --oneline -n 1</p>
              <p className="text-indigo-400">
                40d323d <span className="text-neutral-300">feat: optimize portfolio bundle, extract screenshots & enhance UI</span>
              </p>
              <p className="text-emerald-500/90 text-[10px] flex items-center gap-1 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                61 Production Projects Indexed • 100% Static CDN Deploy
              </p>
            </div>
          </div>
        )}

        {activeTab === "python" && (
          <div className="space-y-1.5 animate-in fade-in duration-200 text-[11px]">
            <p className="text-neutral-500"># Autonomous Multi-Agent Reasoning Loop</p>
            <p><span className="text-indigo-400">from</span> core.agents <span className="text-indigo-400">import</span> AutonomousAgent, ToolRegistry</p>
            <p><span className="text-indigo-400">from</span> models <span className="text-indigo-400">import</span> GeminiPro, RAGPipeline</p>
            <p className="text-neutral-600"> </p>
            <p><span className="text-purple-400">agent</span> = AutonomousAgent(</p>
            <p className="pl-4">name=<span className="text-emerald-400">"RasikhAI-Core"</span>,</p>
            <p className="pl-4">role=<span className="text-emerald-400">"Full-Stack Architect & Researcher"</span>,</p>
            <p className="pl-4">tools=ToolRegistry([<span className="text-amber-300">"scraper"</span>, <span className="text-amber-300">"rag_embed"</span>, <span className="text-amber-300">"fastapi_router"</span>]),</p>
            <p className="pl-4">evaluator_metric=<span className="text-emerald-400">"Gold-Medalist-Rigor"</span></p>
            <p>)</p>
            <p><span className="text-purple-400">await</span> agent.execute_pipeline(mode=<span className="text-emerald-400">"production_deploy"</span>)</p>
          </div>
        )}

        {activeTab === "metrics" && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <p className="text-neutral-500"># System Telemetry & Performance</p>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-neutral-900/70 border border-neutral-800 rounded-xl">
                <span className="text-[10px] uppercase text-neutral-500 font-bold block">First Contentful Paint</span>
                <span className="text-base font-bold text-emerald-400 font-mono">18ms</span>
              </div>
              <div className="p-3 bg-neutral-900/70 border border-neutral-800 rounded-xl">
                <span className="text-[10px] uppercase text-neutral-500 font-bold block">Bundle Reduction</span>
                <span className="text-base font-bold text-indigo-400 font-mono">97.9%</span>
              </div>
              <div className="p-3 bg-neutral-900/70 border border-neutral-800 rounded-xl">
                <span className="text-[10px] uppercase text-neutral-500 font-bold block">Production Projects</span>
                <span className="text-base font-bold text-purple-400 font-mono">61 Active</span>
              </div>
              <div className="p-3 bg-neutral-900/70 border border-neutral-800 rounded-xl">
                <span className="text-[10px] uppercase text-neutral-500 font-bold block">Academic Distinction</span>
                <span className="text-base font-bold text-amber-400 font-mono">Gold Medalist</span>
              </div>
            </div>
            <p className="text-[10px] text-neutral-500 text-center pt-2">
              Status: Operational • All 61 repositories synced
            </p>
          </div>
        )}

        {/* Footer command helper */}
        <div className="pt-3 border-t border-neutral-900 flex items-center justify-between text-[11px] text-neutral-500">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            live terminal ready
          </span>
          <button
            onClick={() =>
              copySnippet(
                "Rasikh Ali — Gold Medalist, Junior Lecturer @ Superior University, AI & Software Engineer"
              )
            }
            className="flex items-center gap-1 text-neutral-400 hover:text-white transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy bio"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
