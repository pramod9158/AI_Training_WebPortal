'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { useWaynauticStore, getStoredTheme } from '@/lib/store';
import { fetchCurriculumUpdates } from '@/lib/curriculumService';
import { Sparkles, BookOpen, CheckCircle2 } from 'lucide-react';

export const ClientAppWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const { profile } = useWaynauticStore();

  const isAuthPage = 
    pathname === '/login' || 
    pathname === '/signup' || 
    pathname === '/reset-password' || 
    pathname?.startsWith('/login') || 
    pathname?.startsWith('/signup') || 
    pathname?.startsWith('/reset-password') ||
    pathname?.startsWith('/auth');

  const isAdminPage = pathname?.startsWith('/admin');

  // 1. Sync theme across app
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const activeTheme = profile.theme || getStoredTheme();
      if (activeTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [profile.theme]);

  // 2. Global curriculum and quiz synchronization on mount and window focus
  useEffect(() => {
    // Initial fetch from cloud/Supabase
    fetchCurriculumUpdates();

    const handleFocus = () => {
      fetchCurriculumUpdates();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  if (isAdminPage) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100">
        {children}
      </div>
    );
  }


  if (isAuthPage) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden text-slate-900 dark:text-slate-100">

        {/* ── Realistic translucent hero page preview (background layer) ─────────────────── */}
        <div
          aria-hidden="true"
          className="fixed inset-0 z-0 pointer-events-none select-none overflow-hidden"
        >
          {/* Real hero landing page content with softened blur (6px) so it is differentiated yet visible */}
          <div
            className="absolute inset-0 scale-[1.01] origin-top overflow-hidden"
            style={{ filter: 'blur(6px)' }}
          >
            {/* Ambient glows matching hero */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-[#0B0F19] dark:via-slate-900 dark:to-[#0B0F19]" />
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-to-br from-cyan-400/25 via-blue-500/20 to-violet-500/20 rounded-full blur-[90px]" />
            <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-gradient-to-bl from-violet-400/15 to-transparent rounded-full blur-[80px]" />
            <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-gradient-to-tr from-cyan-400/15 to-transparent rounded-full blur-[70px]" />

            {/* Content container */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20">
              <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-14">

                {/* Left: Real Hero Copy */}
                <div className="flex-1 text-center lg:text-left">
                  {/* Badge */}
                  <div className="flex justify-center lg:justify-start mb-5">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 text-xs font-mono font-semibold">
                      <Sparkles className="w-3.5 h-3.5" />
                      AI-First Curriculum — 56 Curated Topics
                    </span>
                  </div>

                  {/* Headline */}
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight text-slate-900 dark:text-white mb-5">
                    The{' '}
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500">
                      Fastest Way
                    </span>
                    {' '}to Master{' '}
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-pink-500">
                      AI Engineering
                    </span>
                  </h1>

                  {/* Subheadline */}
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed mb-6">
                    Waynautic Academy is a structured, hands-on learning platform for developers.
                    Go from <strong className="text-slate-800 dark:text-white">Python basics</strong> to building{' '}
                    <strong className="text-slate-800 dark:text-white">production-grade RAG pipelines</strong> and{' '}
                    <strong className="text-slate-800 dark:text-white">agentic AI systems</strong> — at your own pace.
                  </p>

                  {/* CTA button */}
                  <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 mb-6">
                    <div className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 text-white font-bold text-sm shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2">
                      <BookOpen className="w-4 h-4 text-cyan-200" />
                      <span>Browse Curriculum</span>
                    </div>
                  </div>

                  {/* Trust badges */}
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {['Self-Paced', 'Expert-Curated', 'Project-Based', 'Quizzes & Badges'].map((label) => (
                      <span key={label} className="flex items-center gap-1.5 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        {label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right: Real Interactive Card Preview */}
                <div className="hidden md:block w-72 lg:w-80 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="text-[10px] font-mono uppercase text-cyan-600 dark:text-cyan-400 font-bold">Comprehensive Curriculum</div>
                      <div className="text-sm font-extrabold text-slate-900 dark:text-white">10 Modules • 56 Lessons</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">Live</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {['LLMs', 'Prompt Engineering', 'Vector DB', 'RAG Systems', 'AI IDEs', 'Local AI', 'MCP Foundations'].map((tag) => (
                      <span key={tag} className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/40">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                      <span>RAG & Vector Search</span>
                      <span>85%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full" style={{ width: '85%' }} />
                    </div>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-500 pt-1">
                      <span>Agentic Workflows</span>
                      <span>70%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full" style={{ width: '70%' }} />
                    </div>
                  </div>
                </div>

              </div>

              {/* Stats Bar Preview */}
              <div className="mt-10 max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-white/75 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 text-center shadow-lg">
                <div>
                  <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400">56</div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">In-Depth Topics</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-blue-600 dark:text-blue-400">10</div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Core Modules</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-violet-600 dark:text-violet-400">4 Weeks</div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Structured Path</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">4–5 Projects</div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Agentic AI Portfolios</div>
                </div>
              </div>
            </div>
          </div>

          {/* Subtle contrast overlay: dims and softens background so login window pops */}
          <div className="absolute inset-0 bg-slate-900/8 dark:bg-black/40 backdrop-blur-[2px] pointer-events-none" />
        </div>

        {/* ── Auth UI layer (sits above the blurred background) ────────────── */}
        <div className="relative z-10 flex flex-col min-h-screen">
          {/* Minimal header */}
          <header className="w-full py-5 px-4 flex items-center justify-center border-b border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-[#0D121F]/80 backdrop-blur-xl shadow-sm">
            <Link href="/" className="inline-flex items-center group transition-transform hover:scale-[1.02]">
              <Image
                src="/waynautic-logo.png"
                alt="Waynautic Academy"
                width={160}
                height={36}
                className="h-8 sm:h-9 w-auto object-contain"
                priority
              />
            </Link>
          </header>

          {/* Centered auth card */}
          <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
            <div className="w-full max-w-md">
              {children}
            </div>
          </main>

          {/* Minimal footer */}
          <footer className="py-5 px-4 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-[#0D121F]/70 backdrop-blur-xl font-medium">
            © {new Date().getFullYear()} Waynautic Academy.{' '}
            <span className="text-cyan-600 dark:text-cyan-400 font-semibold">All rights reserved.</span>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
};
