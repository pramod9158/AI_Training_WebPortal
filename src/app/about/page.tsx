import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { 
  Sparkles, 
  Target, 
  Zap, 
  Users, 
  Award, 
  BookOpen, 
  ShieldCheck, 
  Cpu, 
  ArrowRight, 
  CheckCircle2, 
  Code2, 
  GraduationCap, 
  Compass,
  Lightbulb,
  HeartHandshake,
  TrendingUp
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us | Waynautic Academy',
  description: 'Learn about Waynautic Academy — a transformative learning platform devoted to upskilling software engineers and tech professionals into world-class AI engineers through hands-on, industry-vetted education.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 dark:bg-[#07090E] transition-colors">
      {/* Background Decorative Ambient Glows */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-sky-500/15 via-indigo-500/10 to-violet-500/15 blur-[120px] rounded-full dark:from-cyan-500/10 dark:via-blue-600/10 dark:to-violet-600/10" 
      />

      {/* ================================================================ */}
      {/* HERO: Full-width team photo at top (iStudio-inspired)            */}
      {/* ================================================================ */}
      <section className="relative w-full overflow-hidden" style={{ maxHeight: '92vh', minHeight: '420px' }}>
        <Image
          src="/WaynauticTeam.webp"
          alt="Waynautic Technologies Team and Educators"
          width={1600}
          height={900}
          priority
          sizes="100vw"
          className="w-full object-cover object-center"
          style={{ maxHeight: '92vh', minHeight: '420px' }}
        />
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none" />

        {/* Bottom text overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-12 pb-8 sm:pb-12">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-bold font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Waynautic Technologies Core Team</span>
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight drop-shadow-xl">
                We have the solution for<br />
                <span className="text-sky-400">AI upskilling.</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-200 font-medium max-w-xl drop-shadow-md">
                Building the future of developer education, one module at a time.
              </p>
            </div>
            <div className="shrink-0 flex flex-col sm:flex-row gap-3">
              <Link
                href="/curriculum"
                className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm shadow-lg transition-all flex items-center space-x-2"
              >
                <span>Explore Curriculum</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/signup"
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-bold text-sm transition-all"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-16 sm:space-y-24 relative z-10">

        {/* ==================================================================== */}
        {/* 3. THE PROBLEM & WHY WAYNAUTIC (Origin Story)                        */}
        {/* ==================================================================== */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 text-xs font-mono font-bold">
              <Compass className="w-3.5 h-3.5" />
              <span>Why We Started</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
              Bridging the Divide Between Theory and Real Production AI
            </h2>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Software engineering is experiencing its most seismic transition in decades. Generative models, autonomous agent frameworks, vector search systems, and Model Context Protocols (MCP) have made traditional computer science curricula dangerously incomplete.
            </p>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Too many tutorials stop at API calls or toy notebooks. In contrast, tech enterprises need engineers who understand <strong className="text-slate-900 dark:text-white font-semibold">token economics, low-latency inferencing, vector indexing, evaluation benchmarks, and defensive prompt security</strong>.
            </p>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Waynautic was born with a singular conviction: to create an ecosystem that mirrors the standards of leading tech giants and empowers developers to build, deploy, and scale systems with complete mastery.
            </p>
          </div>

          <div className="p-7 sm:p-9 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center space-x-3 text-sky-600 dark:text-cyan-400 font-bold text-lg">
              <Award className="w-6 h-6" />
              <span>The Waynautic Difference</span>
            </div>

            <ul className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-start space-x-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900 dark:text-white">Curriculum that Compounds:</strong> Designed from foundational fundamentals (Python & Git) all the way to autonomous swarms and cloud clusters.</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900 dark:text-white">Production-Ready Architecture:</strong> Focus on real systems, Docker containers, Kubernetes deployments, and enterprise guardrails.</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900 dark:text-white">Interactive Tri-Mode Learning:</strong> Every lesson incorporates high-definition video walkthroughs, deep-dive technical notes, and rigorous quiz evaluations.</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900 dark:text-white">Community & Peer Collaboration:</strong> Ask questions, post insights, and collaborate with like-minded builders inside every lesson.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* 4. MISSION & VISION (Inspired by Scaler's North Star)                */}
        {/* ==================================================================== */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 rounded-3xl bg-gradient-to-br from-sky-500/10 via-slate-50 to-white dark:from-cyan-950/40 dark:via-slate-900 dark:to-slate-900/80 border-2 border-sky-200/80 dark:border-cyan-800/60 shadow-lg space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-500 dark:bg-cyan-500 text-white dark:text-slate-950 flex items-center justify-center shadow-md">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Our Mission
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              To transform and upskill ambitious software developers into world-class AI engineers by providing rigorous, hands-on curriculum, architectural blueprints, and actionable mentorship that creates profound, measurable career impact.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-br from-violet-500/10 via-slate-50 to-white dark:from-violet-950/40 dark:via-slate-900 dark:to-slate-900/80 border-2 border-violet-200/80 dark:border-violet-800/60 shadow-lg space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-600 dark:bg-violet-500 text-white dark:text-slate-950 flex items-center justify-center shadow-md">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Our Vision
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              To be the world’s foremost learning ecosystem for practical Artificial Intelligence — fostering a global community of innovators who build safe, ethical, and scalable intelligence systems that solve humanity’s toughest challenges.
            </p>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* 5. CORE PILLARS & VALUES                                             */}
        {/* ==================================================================== */}
        <section className="space-y-8">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-bold">
              <Zap className="w-3.5 h-3.5" />
              <span>Core Values</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              The Principles That Guide Us
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Every course, code sample, and design decision at Waynautic is anchored in four foundational pillars.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-400 dark:hover:border-cyan-500/50 transition-all space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-cyan-950/70 text-sky-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Hands-on Mastery
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                We believe true engineering skill is built by writing code, breaking systems, and diagnosing stack traces — not passive watching.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-all space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Production Focus
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                We teach architectures that stand up to actual traffic: token caching, inference batching, fault tolerance, and vector index sharding.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-violet-400 dark:hover:border-violet-500/50 transition-all space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950/70 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Safety & Guardrails
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                AI systems without defenses are vulnerabilities. We embed prompt injection prevention, PII redacting, and moderation from day one.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500/50 transition-all space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Learner-First Culture
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Every curriculum update and platform refinement is built around student success, accessibility, and measurable career outcomes.
              </p>
            </div>
          </div>
        </section>



        {/* ==================================================================== */}
        {/* 7. CALL TO ACTION (Inspired by Scaler's Conversion Funnel)          */}
        {/* ==================================================================== */}
        <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-tr from-sky-600 via-blue-600 to-violet-700 text-white shadow-2xl relative overflow-hidden text-center space-y-6">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              Ready to Accelerate Your Career in AI?
            </h2>
            <p className="text-sm sm:text-base text-sky-100 leading-relaxed font-medium">
              Join thousands of engineers upskilling in Python, Generative AI, LangChain, MCP, and Autonomous Agents. Your journey starts today.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/signup"
              className="px-8 py-3.5 rounded-xl bg-white text-slate-950 font-extrabold text-sm hover:bg-slate-100 shadow-xl transition-all flex items-center space-x-2 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/curriculum"
              className="px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-extrabold text-sm transition-all focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
            >
              <span>Browse 56 Lessons</span>
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
