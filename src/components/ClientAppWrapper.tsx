'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { SearchModal } from './SearchModal';
import { useWaynauticStore, getStoredTheme } from '@/lib/store';
import { fetchCurriculumUpdates } from '@/lib/curriculumService';

export const ClientAppWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
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

        {/* ── Blurred hero page preview (background layer) ─────────────────── */}
        <div
          aria-hidden="true"
          className="fixed inset-0 z-0 pointer-events-none select-none overflow-hidden"
        >
          {/* Blurred snapshot of the hero landing page */}
          <div className="absolute inset-0 scale-[1.05] origin-center" style={{ filter: 'blur(14px)' }}>
            {/* Ambient glows matching hero */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-[#0B0F19] dark:via-slate-900 dark:to-[#0B0F19]" />
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-to-br from-cyan-400/30 via-blue-500/20 to-violet-500/25 rounded-full" />
            <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-gradient-to-bl from-violet-400/20 to-transparent rounded-full" />
            <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-gradient-to-tr from-cyan-400/15 to-transparent rounded-full" />

            {/* Hero text silhouette */}
            <div className="absolute top-[12%] left-1/2 -translate-x-1/2 w-full max-w-4xl px-8">
              {/* Badge pill */}
              <div className="flex justify-center lg:justify-start mb-5">
                <div className="h-7 w-72 rounded-full bg-cyan-500/20 border border-cyan-400/30" />
              </div>
              {/* Headline blocks */}
              <div className="space-y-4 mb-8">
                <div className="h-12 sm:h-16 w-[85%] rounded-2xl bg-slate-800/15 dark:bg-white/10" />
                <div className="h-12 sm:h-16 w-[65%] rounded-2xl bg-slate-800/10 dark:bg-white/8" />
              </div>
              {/* Sub text */}
              <div className="space-y-2.5 mb-8">
                <div className="h-4 w-[75%] rounded-lg bg-slate-500/15 dark:bg-white/8" />
                <div className="h-4 w-[60%] rounded-lg bg-slate-500/10 dark:bg-white/6" />
              </div>
              {/* CTA buttons */}
              <div className="flex gap-4">
                <div className="h-12 w-48 rounded-2xl bg-gradient-to-r from-cyan-400/50 to-blue-500/50" />
                <div className="h-12 w-44 rounded-2xl border-2 border-slate-300/40 dark:border-slate-600/40 bg-white/20" />
              </div>
            </div>

            {/* Right floating card silhouette — hidden on mobile, only decorative on desktop */}
            <div className="hidden md:block absolute top-[10%] right-[6%] w-72 lg:w-80 h-96 rounded-3xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 shadow-2xl">
              {/* Card header */}
              <div className="p-5 border-b border-slate-200/40 dark:border-slate-700/40 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400/60 to-violet-500/60" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-2 w-24 rounded bg-slate-400/30 dark:bg-white/20" />
                  <div className="h-3 w-36 rounded bg-slate-500/25 dark:bg-white/15" />
                </div>
                <div className="h-6 w-14 rounded-lg bg-emerald-400/40" />
              </div>
              {/* Tag chips */}
              <div className="p-5 flex flex-wrap gap-2">
                {['LLMs', 'Prompts', 'Vector DB', 'RAG', 'AI IDEs', 'APIs', 'Local AI'].map((t) => (
                  <div key={t} className="h-7 px-3 rounded-xl bg-slate-400/20 dark:bg-white/10 flex items-center">
                    <div className="h-2 w-12 rounded bg-slate-400/40 dark:bg-white/20" />
                  </div>
                ))}
              </div>
              {/* Progress bars */}
              <div className="px-5 space-y-3">
                {[85, 60, 40].map((w) => (
                  <div key={w}>
                    <div className="h-1.5 bg-slate-200/40 dark:bg-slate-700/40 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-cyan-400/60 to-blue-500/60 rounded-full" style={{ width: `${w}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats strip silhouette */}
            <div className="absolute top-[72%] left-0 right-0 h-20 bg-slate-100/50 dark:bg-slate-800/30 flex items-center justify-center gap-6 sm:gap-16 px-4 sm:px-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="text-center space-y-1.5">
                  <div className="h-8 w-16 rounded-lg bg-slate-400/20 dark:bg-white/10 mx-auto" />
                  <div className="h-2 w-20 rounded bg-slate-300/30 dark:bg-white/8 mx-auto" />
                </div>
              ))}
            </div>

            {/* Module grid silhouette — only show on wider screens */}
            <div className="hidden sm:grid absolute top-[85%] left-8 right-8 grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 rounded-2xl bg-white/40 dark:bg-slate-800/30 border border-slate-200/40 dark:border-slate-700/30" />
              ))}
            </div>
          </div>

          {/* Overlay: softens contrast so login card pops */}
          <div className="absolute inset-0 bg-white/60 dark:bg-[#0B0F19]/70 backdrop-blur-[2px]" />
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
      <Navbar onOpenSearch={() => setSearchOpen(true)} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};
