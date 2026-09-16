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

      <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-16 sm:space-y-24 relative z-10">
        
        {/* ==================================================================== */}
        {/* 1. HERO SECTION: Transformative Upskilling & Mission Statement       */}
        {/* ==================================================================== */}
        <section className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-sky-50 dark:bg-cyan-950/80 border border-sky-200 dark:border-cyan-800 text-sky-700 dark:text-cyan-300 text-xs font-mono font-bold tracking-wide shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-sky-500 dark:text-cyan-400 animate-pulse" />
            <span>Transformative AI & Tech Upskilling</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 dark:text-white tracking-tight leading-[1.15]">
            Empowering the Next Generation of <span className="bg-gradient-to-r from-sky-600 via-blue-600 to-violet-600 dark:from-cyan-400 dark:via-blue-400 dark:to-violet-400 bg-clip-text text-transparent">AI & Tech Leaders</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Waynautic Academy was created to bridge the critical divide between legacy software engineering and the rapidly evolving frontier of production-grade Artificial Intelligence. We provide developers with an industry-vetted ecosystem designed to build real-world capability, confidence, and career momentum.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/curriculum"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-600 via-blue-600 to-violet-600 hover:from-sky-500 hover:via-blue-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-sky-600/20 hover:shadow-sky-600/30 transition-all flex items-center space-x-2 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
            >
              <span>Explore Curriculum</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="#our-team"
              className="px-6 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:text-sky-600 dark:hover:text-cyan-400 font-bold text-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
            >
              <span>Meet The Team</span>
            </Link>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* 2. PROVEN IMPACT & METRICS BAR (Inspired by Scaler's Impact Focus)   */}
        {/* ==================================================================== */}
        <section aria-label="Platform Impact Metrics">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/90 border-2 border-slate-200 dark:border-slate-800/90 shadow-xl grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono">
                56+
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                Production Topics
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:block">
                From Python & Git to Agentic Swarms
              </p>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-sky-600 dark:text-cyan-400 font-mono">
                100%
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                Practical Execution
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:block">
                Zero fluff: real code, notes & architectures
              </p>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-violet-600 dark:text-violet-400 font-mono">
                10+
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                Curated Paths
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:block">
                Specialized tracks for modern roles
              </p>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                94%
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                Mastery Completion
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:block">
                Evaluated through interactive quizzes
              </p>
            </div>
          </div>
        </section>

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
        {/* 6. OUR TEAM SECTION (Featuring WaynauticTeam image)                   */}
        {/* ==================================================================== */}
        <section id="our-team" className="space-y-8 scroll-mt-20">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-sky-50 dark:bg-cyan-950/80 text-sky-700 dark:text-cyan-300 text-xs font-mono font-bold">
              <Users className="w-3.5 h-3.5" />
              <span>Leadership & Team</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              The Minds Driving Waynautic
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              We are a close-knit crew of engineers, AI researchers, instructors, and builders dedicated to reshaping technical education.
            </p>
          </div>

          {/* Optimized, high-performance team hero card */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden group">
            
            {/* Image Container with Next.js Image Optimization */}
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-[16/9] bg-slate-950 overflow-hidden">
              <Image
                src="/WaynauticTeam.webp"
                alt="Waynautic Technologies Team and Educators"
                width={1600}
                height={1200}
                loading="lazy"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 95vw, 1152px"
                className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-700 ease-out"
              />
              
              {/* Subtle Gradient Vignette Overlay for readable badges */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent pointer-events-none" />

              {/* Badges on bottom of photo */}
              <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 flex flex-wrap items-center justify-between gap-3 text-white">
                <div className="space-y-0.5">
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-bold font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Waynautic Technologies Core Team</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 font-medium drop-shadow-md">
                    Building the future of developer education, one module at a time.
                  </p>
                </div>

                <div className="hidden sm:flex items-center space-x-2 text-xs font-mono text-slate-300 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  <span>Engineering • Curriculum • Research</span>
                </div>
              </div>
            </div>

            {/* Team Narrative Under Photo */}
            <div className="p-6 sm:p-8 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                    Built by Practitioners
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Our team brings hands-on experience designing cloud services, production LLM pipelines, distributed backends, and responsive developer tools.
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                    Curriculum Innovation
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    We continuously audit and update our course material with live community feedback, ensuring students learn the models and frameworks that matter today.
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                    Student-First Mentorship
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Behind every quiz question, video chapter, and downloadable note is a dedicated team passionate about your professional progression.
                  </p>
                </div>
              </div>
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
