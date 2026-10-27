'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Flame, 
  Bookmark, 
  Search, 
  Menu, 
  X, 
  Compass, 
  BookOpen, 
  User, 
  Sparkles,
  Zap,
  PlayCircle,
  LogOut,
  LogIn,
  QrCode,
  Shield,
  ShieldCheck,
  ChevronDown,
  Trophy,
  Sun,
  Moon,
  Receipt,
  Brain,
  Code2
} from 'lucide-react';
import { useWaynauticStore, setStoredTheme } from '@/lib/store';
import { getAllTopics, getResumeLearningUrl } from '@/lib/curriculumService';
import { getAvatarPreset } from '@/data/avatarPresets';
import { getLocalPayments } from '@/lib/adminService';
import dynamic from 'next/dynamic';
import { NotificationDrawer } from './NotificationDrawer';
import { SearchModal } from './SearchModal';



interface NavbarProps {
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch }) => {
  const pathname = usePathname();
  const isLandingPage = pathname === '/' || !pathname;
  const router = useRouter();
  const { profile, progress, streak, bookmarks, updateProfile, signOut, toggleBookmarkTopic } = useWaynauticStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [curriculumDropdownOpen, setCurriculumDropdownOpen] = useState(false);
  const [mobileCurriculumOpen, setMobileCurriculumOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const curriculumRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  const isLoggedIn = Boolean(profile.userId || profile.email);
  const isProUser = profile.plan === 'pro' || profile.plan === 'enterprise';
  const isAdmin = profile.role === 'admin';
  const [hasWebinarPass, setHasWebinarPass] = useState(false);

  useEffect(() => {
    const checkPasses = () => {
      try {
        const cleanEmail = (profile.email || '').trim().toLowerCase();
        const local = getLocalPayments();
        const userPayments = local.filter((p: any) => {
          const pEmail = (p.userEmail || '').trim().toLowerCase();
          return (cleanEmail && pEmail === cleanEmail) || (profile.userId && p.userId === profile.userId);
        });
        const isWebinar = userPayments.some(
          (p: any) =>
            p.status === 'verified' &&
            (Number(p.amount) === 19 ||
              Number(p.amount) === 5 ||
              (p.notes || '').toLowerCase().includes('webinar') ||
              (p.notes || '').toLowerCase().includes('expert'))
        );
        setHasWebinarPass(isWebinar);
      } catch (e) {}
    };
    checkPasses();
    window.addEventListener('waynautic_payments_changed', checkPasses);
    return () => window.removeEventListener('waynautic_payments_changed', checkPasses);
  }, [profile.email, profile.userId]);

  const resumeUrl = getResumeLearningUrl(profile, progress);
  const allTopics = getAllTopics();
  let resumeTopic = profile.lastAccessedTopicId 
    ? allTopics.find(t => t.id === profile.lastAccessedTopicId || t.slug === profile.lastAccessedTopicId)
    : null;
  if (resumeTopic && progress && (progress[resumeTopic.id]?.status === 'completed' || progress[resumeTopic.slug]?.status === 'completed')) {
    resumeTopic = allTopics.find(t => progress[t.id]?.status !== 'completed' && progress[t.slug]?.status !== 'completed') || null;
  }
  const lastTopic = resumeTopic;

  // Track scroll for header background/border transition
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (curriculumRef.current && !curriculumRef.current.contains(event.target as Node)) {
        setCurriculumDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen, curriculumDropdownOpen]);

  // Close the desktop Curriculum panel on Escape
  useEffect(() => {
    if (!curriculumDropdownOpen) return undefined;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setCurriculumDropdownOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [curriculumDropdownOpen]);

  // Global Cmd+K shortcut to open/close search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close menus on route navigation
  useEffect(() => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setCurriculumDropdownOpen(false);
    setMobileCurriculumOpen(false);
  }, [pathname]);

  const handleBookmarksClick = async () => {
    const pathParts = pathname?.split('/').filter(Boolean) || [];
    if (pathParts[0] === 'curriculum' && pathParts.length >= 3) {
      const topicSlug = pathParts[2];
      const activeTopic = allTopics.find(t => t.slug === topicSlug || t.id === topicSlug);
      if (activeTopic && !bookmarks.includes(activeTopic.id)) {
        await toggleBookmarkTopic(activeTopic.id);
      }
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  // Curriculum sub-programs for dropdown
  const curriculumPrograms = [
    { href: '/curriculum/automation-testing', label: 'Automation Testing Program', icon: Code2, color: 'text-violet-600 dark:text-violet-400', desc: 'Selenium, Playwright, Azure, Jira, CI/CD' },
    { href: '/curriculum/performance-testing', label: 'Performance Testing Program', icon: Zap, color: 'text-amber-600 dark:text-amber-400', desc: 'JMeter, LoadRunner, K6, Grafana, Datadog' },
    { href: '/curriculum/ai-training', label: 'AI Training Program', icon: Brain, color: 'text-cyan-600 dark:text-cyan-400', desc: 'LLMs, Prompt Eng, Vector DBs, RAG, Agents' },
  ];


  const mobileNavLinks = isLoggedIn
    ? [
        { href: '/dashboard', label: 'Dashboard', icon: Trophy },
      ]
    : [];

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* Header Backdrop: transparent at top matching page background, frosted glass when scrolled */}
      <div
        className={`absolute inset-x-0 top-0 h-20 transition-all duration-300 ${
          scrolled || mobileMenuOpen
            ? 'border-b border-navy-900/10 dark:border-white/10 bg-white/85 dark:bg-[#0a1128]/85 shadow-soft backdrop-blur-lg'
            : 'border-b border-transparent bg-transparent shadow-none backdrop-blur-none'
        }`}
        aria-hidden="true"
      />
      <nav ref={navRef} className="intro-nav container-xl relative flex h-20 items-center justify-between" aria-label="Primary">
        
        {/* Left Section: Waynautic Academy Logo — matching waynautic.com size and ratio exactly */}
        <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="Waynautic Academy Home">
          <Image
            src="/Waynautic_Academy_Logo_Transparent.png"
            alt="Waynautic Academy"
            width={640}
            height={99}
            className="h-8 xs:h-9 w-auto sm:h-10 object-contain transition-all"
            unoptimized
            priority
          />
        </Link>

        {/* Center Section: Navigation Links — matching waynautic.com exactly */}
        <div className="hidden items-center gap-0.5 xl:gap-1 lg:flex">
          {/* 1. Training Programs */}
          <Link
            href="/#pricing"
            className={`rounded-md px-2.5 xl:px-4 py-2 text-sm xl:text-base font-semibold transition-colors hover:bg-navy-900/5 dark:hover:bg-slate-800/70 ${
              pathname === '/#pricing'
                ? 'text-[#1a3fb0] dark:text-[#29abe2]'
                : 'text-navy-800/80 dark:text-slate-200 hover:text-navy-900 dark:hover:text-white'
            }`}
          >
            Training Programs
          </Link>

          {/* 2. Curriculum Dropdown */}
          <div className="relative" ref={curriculumRef}>
            <button
              type="button"
              onClick={() => setCurriculumDropdownOpen((v) => !v)}
              aria-expanded={curriculumDropdownOpen}
              aria-controls="curriculum-panel"
              className={`flex items-center gap-1 rounded-md px-2.5 xl:px-4 py-2 text-sm xl:text-base font-semibold transition-colors hover:bg-navy-900/5 dark:hover:bg-slate-800/70 ${
                pathname?.startsWith('/curriculum')
                  ? 'text-[#1a3fb0] dark:text-[#29abe2]'
                  : 'text-navy-800/80 dark:text-slate-200 hover:text-navy-900 dark:hover:text-white'
              }`}
            >
              Curriculum
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.6"
                className={`transition-transform duration-300 ${curriculumDropdownOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              >
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Curriculum Dropdown Panel */}
            <div
              id="curriculum-panel"
              className={`absolute left-0 top-full mt-2 w-56 rounded-lg border border-navy-900/10 dark:border-slate-800 bg-white dark:bg-[#0D121F] p-1.5 shadow-card transition-all duration-200 ${
                curriculumDropdownOpen ? 'visible translate-y-0 opacity-100' : 'pointer-events-none invisible -translate-y-1 opacity-0'
              }`}
            >
              {curriculumPrograms.map((prog) => (
                <Link
                  key={prog.href}
                  href={prog.href}
                  onClick={() => setCurriculumDropdownOpen(false)}
                  className="block rounded-md px-3.5 py-2.5 text-base font-semibold text-navy-900 dark:text-white transition-colors hover:bg-navy-900/5 dark:hover:bg-slate-800/60 hover:text-brand-blue dark:hover:text-cyan-300"
                >
                  {prog.label}
                </Link>
              ))}
            </div>
          </div>

          {/* 3. About Us */}
          <Link
            href="/about"
            className={`rounded-md px-2.5 xl:px-4 py-2 text-sm xl:text-base font-semibold transition-colors hover:bg-navy-900/5 dark:hover:bg-slate-800/70 ${
              pathname === '/about'
                ? 'text-[#1a3fb0] dark:text-[#29abe2]'
                : 'text-navy-800/80 dark:text-slate-200 hover:text-navy-900 dark:hover:text-white'
            }`}
          >
            About Us
          </Link>

        </div>

        {/* Right Section: Focused & Consolidated Utilities */}
        <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
          {/* Notification Bell (Logged-in only) */}
          {isLoggedIn && <NotificationDrawer />}


          {/* Consolidated User Profile Menu (Desktop; on mobile user accesses profile in drawer) */}
          {isLoggedIn ? (
            <div className="relative hidden md:block" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 p-1 pl-1.5 pr-2 rounded-full border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/80 dark:bg-slate-900/80 transition-all focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
                aria-expanded={userMenuOpen}
                aria-label="Open account menu"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 p-[1.5px] shrink-0">
                  {profile.avatarUrl ? (
                    <img 
                      src={profile.avatarUrl} 
                      alt={profile.displayName || 'User'} 
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover rounded-full bg-slate-900" 
                    />
                  ) : profile.avatarPreset ? (
                    (() => {
                      const preset = getAvatarPreset(profile.avatarPreset);
                      const PresetIcon = preset.icon;
                      return (
                        <div className={`w-full h-full rounded-full bg-gradient-to-tr ${preset.gradient} flex items-center justify-center`}>
                          <PresetIcon className="w-3.5 h-3.5 text-white" />
                        </div>
                      );
                    })()
                  ) : (
                    <div className="w-full h-full bg-white dark:bg-slate-900 rounded-full flex items-center justify-center text-xs font-bold text-sky-600 dark:text-cyan-300">
                      {profile.displayName ? profile.displayName.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                    </div>
                  )}
                </div>
                <span className="hidden lg:inline text-xs font-bold text-slate-700 dark:text-slate-200 max-w-[100px] truncate">
                  {profile.displayName || 'Account'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Sleek User Profile Popover Card */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  
                  {/* User Identity Header */}
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {profile.displayName || 'Developer'}
                      </span>
                      {isAdmin ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-indigo-500" />
                          ADMIN
                        </span>
                      ) : isProUser ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                          PRO
                        </span>
                      ) : hasWebinarPass ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                          WEBINAR
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                          FREE
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block mt-0.5">
                      {profile.email || 'Student Account'}
                    </span>
                  </div>

                  {/* Learning Quick Stats: Streak & Saved Topics */}
                  <div className="px-2 py-2 border-b border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-1.5 text-center">
                    <Link
                      href="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors flex flex-col items-center"
                    >
                      <div className="flex items-center space-x-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                        <Flame className="w-3.5 h-3.5 fill-current" />
                        <span>{streak.currentStreak}d</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">Streak</span>
                    </Link>

                    <Link
                      href="/dashboard?tab=bookmarks"
                      onClick={() => setUserMenuOpen(false)}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors flex flex-col items-center"
                    >
                      <div className="flex items-center space-x-1 text-xs font-bold text-sky-600 dark:text-cyan-400">
                        <Bookmark className="w-3.5 h-3.5 fill-current" />
                        <span>{bookmarks.length}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">Saved</span>
                    </Link>
                  </div>

                  {/* Profile Menu Links */}
                  <div className="px-1.5 py-1.5 space-y-0.5">
                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>Profile & Settings</span>
                    </Link>

                    <Link
                      href="/profile?tab=orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Receipt className="w-4 h-4 text-emerald-500" />
                      <span>My Orders & Transactions</span>
                    </Link>

                    <Link
                      href="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Zap className="w-4 h-4 text-indigo-500" />
                      <span>Learning Dashboard</span>
                    </Link>

                    <Link
                      href="/dashboard?tab=bookmarks"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Bookmark className="w-4 h-4 text-amber-500" />
                      <span>Saved Topics ({bookmarks.length})</span>
                    </Link>
                  </div>

                  {/* Sign Out Action */}
                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800/80 px-1.5">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        handleSignOut();
                      }}
                      className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>

                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden lg:inline-flex rounded-md px-2.5 xl:px-4 py-2 text-sm xl:text-base font-semibold text-navy-800/80 dark:text-slate-200 hover:text-navy-900 dark:hover:text-white hover:bg-navy-900/5 dark:hover:bg-slate-800/70 transition-colors"
            >
              Log in
            </Link>
          )}

          {/* Talk to Us Button (Desktop; matching landing page exactly on all pages) */}
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('waynautic_open_contact_modal'));
              }
            }}
            className="hidden lg:inline-flex items-center justify-center btn-gradient text-sm xl:text-base px-4 xl:px-5 py-2 xl:py-2.5 shrink-0 cursor-pointer"
          >
            Talk to Us
          </button>

          {/* Mobile Drawer Hamburger Button — matching waynautic.com */}
          <button
            className="relative z-50 flex h-10 w-10 items-center justify-center rounded-md border border-navy-900/10 dark:border-slate-700 lg:hidden"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((v) => !v)}
          >
            <span className="sr-only">Toggle navigation</span>
            <div className="relative h-4 w-5">
              <span
                className={`absolute left-0 h-0.5 w-5 bg-navy-900 dark:bg-white transition-all duration-300 ${
                  mobileMenuOpen ? 'top-2 rotate-45' : 'top-0'
                }`}
              />
              <span
                className={`absolute left-0 top-2 h-0.5 w-5 bg-navy-900 dark:bg-white transition-all duration-300 ${
                  mobileMenuOpen ? 'opacity-0' : 'opacity-100'
                }`}
              />
              <span
                className={`absolute left-0 h-0.5 w-5 bg-navy-900 dark:bg-white transition-all duration-300 ${
                  mobileMenuOpen ? 'top-2 -rotate-45' : 'top-4'
                }`}
              />
            </div>
          </button>

        </div>
      </nav>

      {/* Mobile menu — fullscreen overlay, matching waynautic.com */}
      <div
        className={`fixed inset-0 top-20 z-40 origin-top overflow-y-auto bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-lg transition-all duration-300 lg:hidden ${
          mobileMenuOpen ? 'pointer-events-auto visible opacity-100' : 'pointer-events-none invisible opacity-0'
        }`}
      >
        <div className="container-xl flex flex-col gap-1 py-6">
          
          {/* User Profile Header in Mobile Drawer (or Login Button when logged out) */}
          {isLoggedIn ? (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 flex-1 min-w-0"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-sky-500 to-violet-600 p-[1.5px] shrink-0">
                  {profile.avatarUrl ? (
                    <img 
                      src={profile.avatarUrl} 
                      alt={profile.displayName || 'User profile'} 
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover rounded-full bg-slate-900" 
                    />
                  ) : profile.avatarPreset ? (
                    (() => {
                      const preset = getAvatarPreset(profile.avatarPreset);
                      const PresetIcon = preset.icon;
                      return (
                        <div className={`w-full h-full rounded-full bg-gradient-to-tr ${preset.gradient} flex items-center justify-center`}>
                          <PresetIcon className="w-5 h-5 text-white" />
                        </div>
                      );
                    })()
                  ) : (
                    <div className="w-full h-full bg-white dark:bg-slate-900 rounded-full flex items-center justify-center text-sm font-extrabold text-sky-600 dark:text-cyan-300">
                      {profile.displayName ? profile.displayName.charAt(0).toUpperCase() : 'D'}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                      {profile.displayName || 'Developer'}
                    </span>
                    {isAdmin ? (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                        ADMIN
                      </span>
                    ) : isProUser ? (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        PRO
                      </span>
                    ) : hasWebinarPass ? (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        WEBINAR
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        FREE
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 truncate block">
                    {profile.email || 'Student Account'}
                  </span>
                </div>
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSignOut();
                }}
                className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors shrink-0"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 mb-3">
              <Link
                href="/#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-base rounded-md shadow-sm min-h-[44px] transition-colors"
              >
                Contact Us
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center space-x-2 py-3 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white font-medium text-base rounded-md shadow-sm min-h-[44px] transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In to Account</span>
              </Link>
            </div>
          )}

          {/* Navigation Links: 1. Training Programs, 2. Curriculum, 3. About Us */}
          <div className="space-y-1">
            {/* 1. Training Programs */}
            <Link
              href="/#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-bold transition-colors min-h-[44px] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
            >
              <Zap className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              <span>Training Programs</span>
            </Link>

            {/* 2. Curriculum Expandable */}
            <div>
              <button
                type="button"
                onClick={() => setMobileCurriculumOpen((v) => !v)}
                className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-bold transition-colors min-h-[44px] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
              >
                <div className="flex items-center space-x-3">
                  <BookOpen className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                  <span>Curriculum</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${mobileCurriculumOpen ? 'rotate-180' : ''}`} />
              </button>
              {mobileCurriculumOpen && (
                <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-slate-200 dark:border-slate-700 pl-3">
                  {curriculumPrograms.map((prog) => {
                    const Icon = prog.icon;
                    return (
                      <Link
                        key={prog.href}
                        href={prog.href}
                        onClick={() => { setMobileMenuOpen(false); setMobileCurriculumOpen(false); }}
                        className="flex items-center space-x-2.5 px-2.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 min-h-[40px] transition-colors"
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${prog.color}`} />
                        <span>{prog.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. About Us */}
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-bold transition-colors min-h-[44px] ${
                pathname === '/about'
                  ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className={`w-5 h-5 ${pathname === '/about' ? 'text-sky-600 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-400'}`} />
              <span>About Us</span>
            </Link>


            {/* Other nav links */}
            {mobileNavLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-bold transition-colors min-h-[44px] ${
                    isActive
                      ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-sky-600 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            
            {/* Student learning shortcuts only when logged in */}
            {isLoggedIn && lastTopic && (
              <Link
                href={`/curriculum/${lastTopic.moduleSlug}/${lastTopic.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 min-h-[44px] transition-colors"
              >
                <PlayCircle className="w-5 h-5 text-slate-500 dark:text-slate-400 shrink-0" />
                <span className="truncate">Resume ({lastTopic.title})</span>
              </Link>
            )}

            {isLoggedIn && (
              <Link
                href="/dashboard?tab=bookmarks"
                onClick={async () => {
                  setMobileMenuOpen(false);
                  await handleBookmarksClick();
                }}
                className="flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 min-h-[44px]"
              >
                <div className="flex items-center space-x-3">
                  <Bookmark className="w-5 h-5 text-sky-600 dark:text-cyan-400" />
                  <span>Saved Topics</span>
                </div>
                {bookmarks.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-sky-100 dark:bg-cyan-950 text-sky-700 dark:text-cyan-400 border border-sky-300 dark:border-cyan-800">
                    {bookmarks.length}
                  </span>
                )}
              </Link>
            )}

            {isLoggedIn && (
              <Link
                href="/profile?tab=orders"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 min-h-[44px] transition-colors"
              >
                <Receipt className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>My Orders & Transactions</span>
              </Link>
            )}

            {isLoggedIn && (
              <Link
                href="/onboarding"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 min-h-[44px] transition-colors"
              >
                <Sparkles className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                <span>Interactive Guided Tour</span>
              </Link>
            )}
          </div>

          {/* Mobile Search & Upgrade to Pro - Matching Pills */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
            {/* Mobile Search Trigger - Clean rounded-lg styling */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenSearch) onOpenSearch();
              }}
              className="w-full flex items-center justify-between h-11 px-4 bg-white dark:bg-slate-900 border border-slate-700/80 dark:border-slate-300/80 rounded-lg text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium transition-colors"
            >
              <div className="flex items-center space-x-2.5">
                <Search className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>What do you want to learn?</span>
              </div>
              <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-mono border border-slate-300 dark:border-slate-600 text-slate-500">⌘K</kbd>
            </button>

          </div>

          {/* Mobile Talk to Us CTA */}
          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('waynautic_open_contact_modal'));
                }
              }}
              className="w-full py-3 rounded-lg text-sm font-semibold text-white shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
              style={{
                background: 'linear-gradient(100deg, #1a3fb0, #29abe2)',
                boxShadow: '0 0 0 1px rgba(41,171,226,.15), 0 8px 32px -8px rgba(124,58,237,.25)',
              }}
            >
              <span>Talk to Us</span>
            </button>
          </div>
        </div>
      </div>

      {/* Global Search Modal (Cmd+K / mobile search trigger) */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

    </header>
  );
};

