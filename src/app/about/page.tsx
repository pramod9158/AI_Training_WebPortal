import React from 'react';
import Link from 'next/link';
import { Sparkles, Target, Zap, Layers, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12">
      
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Platform Overview</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white">About Waynautic Academy</h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Waynautic Academy is built for software developers, engineers, and tech creators ready to master practical AI engineering skills.
        </p>
      </div>

      <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl space-y-6">
        <h2 className="text-2xl font-bold text-white">Who It Is For</h2>
        <p className="text-slate-300 text-sm leading-relaxed">
          Our audience ranges from developers new to AI tooling (starting with Python & Git fundamentals) to experienced engineers deploying local quantized models, building Model Context Protocol (MCP) servers, and scaling multi-tenant Vector Database RAG pipelines.
        </p>

        <h2 className="text-2xl font-bold text-white pt-4">Core Principles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <h3 className="font-bold text-cyan-400 text-base">Interactive & Rewarding</h3>
            <p className="text-xs text-slate-400">Gamified progress maps, streak tracking, badges, and instant quiz feedback keep learning engaging.</p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <h3 className="font-bold text-violet-400 text-base">Production Focus</h3>
            <p className="text-xs text-slate-400">Every lesson includes real code examples, architecture patterns, and security guardrail practices.</p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex justify-center">
          <Link
            href="/curriculum"
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 text-white font-bold text-sm hover:brightness-110 shadow-lg shadow-cyan-500/20 transition-all flex items-center space-x-2"
          >
            <span>Explore 56 Lessons</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

    </div>
  );
}
