'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Flame, 
  Bookmark, 
  Search, 
  Sun, 
  Moon, 
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
  ChevronDown,
  Trophy
} from 'lucide-react';
import { useWaynauticStore } from '@/lib/store';
import { getAllTopics, getResumeLearningUrl } from '@/lib/curriculumService';
import dynamic from 'next/dynamic';
import { NotificationDrawer } from './NotificationDrawer';

const PaymentBarcodeModal = dynamic(
  () => import('./PaymentBarcodeModal').then((mod) => mod.PaymentBarcodeModal),
  { ssr: false }
);

interface NavbarProps {
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, streak, bookmarks, updateProfile, signOut, toggleBookmarkTopic } = useWaynauticStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isLoggedIn = Boolean(profile.userId || profile.email);
  const isProUser = profile.plan === 'pro' || profile.plan === 'enterprise';
  const resumeUrl = getResumeLearningUrl(profile);
  const allTopics = getAllTopics();
  const lastTopic = profile.lastAccessedTopicId 
    ? allTopics.find(t => t.id === profile.lastAccessedTopicId || t.slug === profile.lastAccessedTopicId)
    : null;

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  // Close menus on route navigation
  useEffect(() => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
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

  const toggleTheme = () => {
    const nextTheme = profile.theme === 'dark' ? 'light' : 'dark';
    updateProfile({ theme: nextTheme });
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const navLinks = isLoggedIn
    ? [
        { href: '/curriculum', label: 'Curriculum', icon: BookOpen },
        { href: '/paths', label: 'Paths', icon: Compass },
        { href: '/dashboard', label: 'Dashboard', icon: Trophy },
        { href: '/about', label: 'About', icon: Sparkles },
      ]
    : [
        { href: '/curriculum', label: 'Curriculum', icon: BookOpen },
        { href: '/paths', label: 'Paths', icon: Compass },
        { href: '/about', label: 'About', icon: Sparkles },
      ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/95 dark:bg-[#0B0F19]/90 border-b border-slate-200 dark:border-slate-800/80 transition-colors">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left Section: Extreme Left Logo + Clean Nav Links */}
        <div className="flex items-center space-x-6 lg:space-x-8">
          
          {/* Brand Logo - Extreme Left & Prominent */}
          <Link href="/" className="flex items-center group py-1 shrink-0" aria-label="Waynautic Academy Home">
            <Image
              src="/waynautic-logo.png"
              alt="Waynautic"
              width={180}
              height={44}
              className="h-8 sm:h-9 md:h-10 w-auto object-contain transition-transform group-hover:scale-[1.02]"
              priority
            />
          </Link>

          {/* Desktop Navigation Links - Clean & Minimalist */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800'
                      : 'font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

        </div>

        {/* Right Section: Focused & Consolidated Utilities */}
        <div className="flex items-center space-x-2 sm:space-x-2.5">

          {/* Compact Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="flex items-center space-x-2 px-2.5 py-1.5 bg-slate-100/90 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 rounded-lg text-xs text-slate-500 dark:text-slate-400 transition-colors"
            title="Search topics (Cmd+K)"
          >
            <Search className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden xl:inline text-xs font-medium">Search...</span>
            <kbd className="hidden sm:inline px-1 py-0.5 bg-white dark:bg-slate-900 rounded text-[10px] font-mono border border-slate-200 dark:border-slate-700">⌘K</kbd>
          </button>

          {/* Upgrade to Pro Pill (for Free users) */}
          {!isProUser && (
            <button
              onClick={() => setPaymentModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 font-semibold text-xs shadow-xs transition-colors shrink-0"
              title="Pay via UPI Barcode / QR to unlock all courses"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="hidden sm:inline">Upgrade to Pro</span>
              <span className="sm:hidden">Pro</span>
            </button>
          )}

          {/* Notification Bell (Logged-in only) */}
          {isLoggedIn && <NotificationDrawer />}

          {/* Theme Toggle (Quick 1-Click) */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-lg transition-colors"
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {profile.theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>

          {/* Consolidated User Profile Menu / Log In Button */}
          {isLoggedIn ? (
            <div className="relative" ref={userMenuRef}>
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
                      {isProUser ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                          PRO
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
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-bold text-xs shadow-sm transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In</span>
            </Link>
          )}

          {/* Mobile Drawer Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg focus:outline-none min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-[#0D121F] border-b-2 border-slate-200 dark:border-slate-800 px-4 pt-3 pb-6 space-y-2.5 animate-in slide-in-from-top-4 duration-200 shadow-2xl max-h-[calc(100dvh-4rem)] overflow-y-auto">
          
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
                    {isProUser ? (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        PRO
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
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 font-bold text-sm rounded-xl shadow-sm min-h-[44px] transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Log In to Account</span>
            </Link>
          )}

          {/* Navigation Links */}
          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-bold transition-colors min-h-[44px] ${
                    isActive
                      ? 'text-sky-600 dark:text-cyan-400 bg-sky-50 dark:bg-cyan-950/50 border border-sky-300 dark:border-cyan-500/30'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-5 h-5 text-sky-600 dark:text-cyan-400" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            
            {/* Student learning shortcuts only when logged in */}
            {isLoggedIn && lastTopic && (
              <Link
                href={`/curriculum/${lastTopic.moduleSlug}/${lastTopic.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-bold text-sky-700 dark:text-cyan-300 bg-sky-50 dark:bg-cyan-950/30 border border-sky-300 dark:border-cyan-500/30 min-h-[44px]"
              >
                <PlayCircle className="w-5 h-5 text-sky-600 dark:text-cyan-400 shrink-0" />
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
                href="/onboarding"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-bold text-sky-600 dark:text-cyan-400 bg-sky-500/10 dark:bg-cyan-950/40 border border-sky-500/20 dark:border-cyan-500/30 min-h-[44px]"
              >
                <Sparkles className="w-5 h-5 text-sky-600 dark:text-cyan-400" />
                <span>Interactive Guided Tour</span>
              </Link>
            )}
          </div>

          {/* Mobile Upgrade Trigger */}
          {!isProUser && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setPaymentModalOpen(true);
              }}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/30 transition-colors min-h-[44px]"
            >
              <div className="flex items-center space-x-2.5">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Upgrade to Pro Pass</span>
              </div>
              <span className="text-[11px] bg-amber-500/20 px-2 py-0.5 rounded-md font-mono font-bold">₹999</span>
            </button>
          )}

          {/* Mobile Search & Theme Toggle */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenSearch) onOpenSearch();
              }}
              className="flex-1 flex items-center justify-center space-x-2 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 font-bold min-h-[42px]"
            >
              <Search className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
              <span>Search Topics</span>
            </button>

            {isLoggedIn && (
              <button
                onClick={toggleTheme}
                className="flex items-center space-x-1.5 px-3 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 min-h-[42px]"
                title="Toggle theme"
              >
                {profile.theme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-indigo-500" />
                    <span>Dark</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Candidate Barcode / UPI Payment Modal */}
      <PaymentBarcodeModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
      />
    </header>
  );
};

