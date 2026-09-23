import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { 
  Compass,
  ArrowRight, 
  Zap, 
  Code2, 
  Cpu, 
  ShieldCheck, 
  HeartHandshake,
  Mail
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
      {/* HERO: Team Photo with Bottom Headline                           */}
      {/* ================================================================ */}
      <section className="relative w-full overflow-hidden bg-slate-50 dark:bg-[#07090E] transition-colors">
        {/* Top Header: Badge & Explore CTA */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-3 sm:pb-4 flex items-center justify-between">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border text-xs font-mono font-bold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-sky-600 dark:text-cyan-400 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Waynautic Technologies Core Team</span>
          </div>

          <Link
            href="/curriculum"
            className="inline-flex items-center justify-center space-x-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-sky-600 hover:bg-sky-500 text-white shadow-md transition-all transform hover:-translate-y-0.5"
          >
            <span>Explore Curriculum</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Team Photo Container with Thin Transparent Layer and Bottom Headline */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 sm:pb-8">
          <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900">
            <Image
              src="/WaynauticTeam.webp"
              alt="Waynautic Technologies Team and Educators"
              width={1600}
              height={1200}
              priority
              quality={90}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 95vw, 1200px"
              className="w-full h-auto object-cover max-h-[520px] lg:max-h-[620px]"
            />
            {/* Thin black transparent layer over the image as in professional hero images */}
            <div className="absolute inset-0 bg-black/25 pointer-events-none" />

            {/* "We have the solution for AI upskilling." placed at bottom of team photo near legs */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent pt-16 pb-5 sm:pb-8 px-4 sm:px-8">
              <h2 
                className="team-photo-headline text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] leading-tight"
                style={{ color: '#FFFFFF' }}
              >
                <span style={{ color: '#FFFFFF' }}>We have the solution for </span>
                <span className="text-cyan-highlight" style={{ color: '#38BDF8' }}>
                  AI upskilling.
                </span>
              </h2>
            </div>
          </div>
        </div>
      </section>

      <div className="py-6 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10 sm:space-y-16 relative z-10">

        {/* ==================================================================== */}
        {/* RECOGNIZED FOR EXCELLENCE (Innovation Certificate & Award)           */}
        {/* ==================================================================== */}
        <section className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900/90 border-2 border-amber-300/60 dark:border-amber-500/30 shadow-xl dark:shadow-amber-500/5">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left: Certificate Image */}
            <div className="md:col-span-6 flex justify-center">
              <a
                href="https://lnkd.in/p/dPmtiGUF"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block rounded-2xl overflow-hidden border-2 border-amber-200 dark:border-amber-500/30 shadow-lg transition-transform hover:scale-[1.02]"
              >
                <Image
                  src="/Innovation-Certificate.jpg"
                  alt="Winner of the Best AI/ML Testing Strategy 2025 at the GenAI and ML Awards"
                  width={600}
                  height={420}
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/20 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity px-3.5 py-1.5 rounded-full bg-black/80 text-white text-xs font-mono font-bold shadow-lg">
                    View on LinkedIn ↗
                  </span>
                </div>
              </a>
            </div>

            {/* Right: Award Text & LinkedIn Link */}
            <div className="md:col-span-6 space-y-4 text-left">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-500/40 text-amber-800 dark:text-amber-300 text-xs font-mono font-bold">
                <span className="text-sm">🌟</span>
                <span>Recognized for Excellence</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                Winner of the Best AI/ML Testing Strategy 2025 at the GenAI and ML Awards.
              </h2>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                We are setting new industry benchmarks for AI reliability and strategy.
              </p>

              <div className="pt-2">
                <a
                  href="https://lnkd.in/p/dPmtiGUF"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex sm:inline-flex items-center justify-center space-x-2 w-full sm:w-auto px-4 xs:px-5 py-3 rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white !text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 min-h-[44px]"
                  style={{ color: '#FFFFFF', backgroundColor: '#0A66C2' }}
                >
                  <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24" style={{ fill: '#FFFFFF', color: '#FFFFFF' }}>
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  <span className="text-white !text-white font-extrabold text-center" style={{ color: '#FFFFFF' }}>View Announcement on LinkedIn</span>
                  <ArrowRight className="w-4 h-4 text-white !text-white shrink-0" style={{ color: '#FFFFFF' }} />
                </a>
              </div>
            </div>

          </div>
        </section>

        {/* ==================================================================== */}
        {/* WHY WE STARTED (Single concise paragraph)                            */}
        {/* ==================================================================== */}
        <section className="max-w-3xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 text-xs font-mono font-bold">
            <Compass className="w-3.5 h-3.5" />
            <span>Why We Started</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
            Bridging the Divide Between Theory and Real Production AI
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Software engineering is experiencing its most seismic transition in decades. While traditional tutorials stop at simple API calls, modern tech enterprises need engineers who truly master generative models, token economics, low-latency inferencing, vector databases, and production agentic pipelines. Waynautic was founded to bridge this divide—creating an ecosystem that mirrors the standards of leading tech giants and empowers developers to build, deploy, and scale production AI systems with confidence.
          </p>
        </section>

        {/* ==================================================================== */}
        {/* CORE PILLARS & VALUES (Aligned Icons & Compact Layout)               */}
        {/* ==================================================================== */}
        <section className="space-y-6 sm:space-y-8">
          <div className="text-center space-y-2.5 max-w-2xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-bold">
              <Zap className="w-3.5 h-3.5" />
              <span>Core Values</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              The Principles That Guide Us
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Every course, code sample, and design decision at Waynautic is anchored in four foundational pillars.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-400 dark:hover:border-cyan-500/50 transition-all space-y-3 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-cyan-950/70 text-sky-600 dark:text-cyan-400 flex items-center justify-center font-bold shrink-0">
                  <Code2 className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Hands-on Mastery
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                We believe true engineering skill is built by writing code, breaking systems, and diagnosing stack traces — not passive watching.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-all space-y-3 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Production Focus
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                We teach architectures that stand up to actual traffic: token caching, inference batching, fault tolerance, and vector index sharding.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-violet-400 dark:hover:border-violet-500/50 transition-all space-y-3 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950/70 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Safety & Guardrails
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                AI systems without defenses are vulnerabilities. We embed prompt injection prevention, PII redacting, and moderation from day one.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500/50 transition-all space-y-3 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Learner-First Culture
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Every curriculum update and platform refinement is built around student success, accessibility, and measurable career outcomes.
              </p>
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* CALL TO ACTION (Ready to Accelerate Your Career in AI?)               */}
        {/* ==================================================================== */}
        <section 
          className="p-6 xs:p-8 sm:p-12 rounded-3xl bg-gradient-to-tr from-sky-600 via-blue-600 to-violet-700 text-white shadow-2xl relative overflow-hidden text-center space-y-6"
          style={{ background: 'linear-gradient(135deg, #0284C7 0%, #2563EB 50%, #6D28D9 100%)' }}
        >
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 
              className="text-2xl sm:text-4xl font-black tracking-tight text-white !text-white drop-shadow-sm"
              style={{ color: '#FFFFFF' }}
            >
              Ready to Accelerate Your Career in AI?
            </h2>
            <p 
              className="text-xs sm:text-base text-sky-100 !text-sky-100 leading-relaxed font-medium"
              style={{ color: '#E0E7FF' }}
            >
              Join thousands of engineers upskilling in Python, Generative AI, LangChain, MCP, and Autonomous Agents. Your journey starts today.
            </p>
          </div>

          <div className="flex flex-col xs:flex-row items-stretch xs:items-center justify-center gap-3 sm:gap-4 pt-2">
            <Link
              href="/curriculum"
              className="w-full xs:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-white text-slate-950 !text-slate-950 font-extrabold text-sm sm:text-base hover:bg-slate-100 shadow-2xl transition-all flex items-center justify-center space-x-2 transform hover:-translate-y-0.5 min-h-[46px]"
              style={{ color: '#0F172A', backgroundColor: '#FFFFFF' }}
            >
              <Zap className="w-4 h-4 text-sky-600 fill-sky-600" />
              <span style={{ color: '#0F172A' }}>Start Learning</span>
              <ArrowRight className="w-4 h-4 text-slate-950" style={{ color: '#0F172A' }} />
            </Link>

            <Link
              href="#contact"
              className="w-full xs:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 text-white !text-white font-extrabold text-sm sm:text-base shadow-xl transition-all flex items-center justify-center space-x-2 transform hover:-translate-y-0.5 cursor-pointer min-h-[46px]"
              style={{ color: '#FFFFFF' }}
            >
              <Mail className="w-4 h-4 text-white" style={{ color: '#FFFFFF' }} />
              <span style={{ color: '#FFFFFF' }}>Contact Us</span>
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
