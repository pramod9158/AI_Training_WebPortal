'use client';

import React, { useState } from 'react';
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
  Shield
} from 'lucide-react';
import { useWaynauticStore } from '@/lib/store';
import { TOPICS } from '@/data/seedTopics';
import { getResumeLearningUrl } from '@/lib/curriculumService';
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

  const isLoggedIn = Boolean(profile.userId || profile.email);
  const isProUser = profile.plan === 'pro' || profile.plan === 'enterprise';
  const resumeUrl = getResumeLearningUrl(profile);
  const lastTopic = profile.lastAccessedTopicId 
    ? TOPICS.find(t => t.id === profile.lastAccessedTopicId || t.slug === profile.lastAccessedTopicId)
    : null;


  const handleBookmarksClick = async () => {
    // If currently viewing a topic, ensure it is bookmarked before navigating to bookmarks tab
    const pathParts = pathname?.split('/').filter(Boolean) || [];
    if (pathParts[0] === 'curriculum' && pathParts.length >= 3) {
      const topicSlug = pathParts[2];
      const activeTopic = TOPICS.find(t => t.slug === topicSlug || t.id === topicSlug);
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
        { href: '/dashboard', label: 'Dashboard', icon: Zap },
        { href: '/about', label: 'About', icon: Sparkles },
      ]
    : [
        { href: '/curriculum', label: 'Curriculum', icon: BookOpen },
        { href: '/paths', label: 'Paths', icon: Compass },
        { href: '/about', label: 'About', icon: Sparkles },
      ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-[#0B0F19]/80 border-b border-slate-200 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center group py-1 shrink-0">
          <Image
            src="/waynautic-logo.png"
            alt="Waynautic"
            width={160}
            height={36}
            className="h-7 sm:h-8 md:h-9 w-auto object-contain transition-transform group-hover:scale-105"
            priority
          />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? 'text-sky-600 dark:text-cyan-400 bg-sky-50 dark:bg-cyan-950/40 border border-sky-300 dark:border-cyan-500/30 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600 dark:text-cyan-400' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action Icons & Auth */}
        <div className="flex items-center space-x-1 sm:space-x-2">

          {/* Omni Search Button Trigger */}
          <button
            onClick={onOpenSearch}
            className="flex items-center space-x-2 px-2.5 sm:px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-lg text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
            title="Search topics (Cmd+K)"
          >
            <Search className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span className="hidden lg:inline font-medium">Search...</span>
            <kbd className="hidden lg:inline px-1.5 py-0.2 bg-slate-200 dark:bg-slate-800 rounded text-[10px] font-mono border border-slate-300 dark:border-slate-700">⌘K</kbd>
          </button>

          {/* Upgrade / Pro Pass Trigger */}
          {!isProUser && (
            <button
              onClick={() => setPaymentModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold text-xs shadow-sm transition-colors"
              title="Pay via UPI Barcode / QR to unlock all courses"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Upgrade to Pro</span>
            </button>
          )}

          {/* Utilities visible ONLY when user is logged in */}
          {isLoggedIn && (
            <>
              {isProUser && (
                <span className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-black uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>PRO</span>
                </span>
              )}

              {/* Streak Counter Chip */}
              <Link
                href="/dashboard"
                className="flex items-center space-x-1.5 px-2 sm:px-2.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-mono font-bold hover:bg-amber-500/20 transition-colors"
                title={`Active Streak: ${streak.currentStreak} Days`}
              >
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{streak.currentStreak}d</span>
              </Link>

              {/* Bookmarks Icon */}
              <Link
                href="/dashboard?tab=bookmarks"
                onClick={handleBookmarksClick}
                className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-lg transition-colors"
                title="Saved Topics"
              >
                <Bookmark className="w-4 h-4" />
                {bookmarks.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-sky-500 dark:bg-cyan-500 text-white dark:text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                    {bookmarks.length}
                  </span>
                )}
              </Link>

              {/* Notification & Nudge Bell Drawer */}
              <NotificationDrawer />

              {/* Dark / Light Mode Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-lg transition-colors"
                title="Toggle theme"
              >
                {profile.theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
              </button>
            </>
          )}

          {/* User Profile / Auth Link */}
          {isLoggedIn ? (
            <div className="flex items-center space-x-1 sm:space-x-2 pl-1 sm:pl-2 border-l border-slate-200 dark:border-slate-800">
              <Link
                href="/profile"
                className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-white transition-colors group"
                title={profile.email || profile.displayName}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-sky-500 to-violet-600 p-[1.5px] shrink-0">
                  {profile.avatarUrl ? (
                    <img 
                      src={profile.avatarUrl} 
                      alt={profile.displayName || 'User profile'} 
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover rounded-full bg-slate-900" 
                    />
                  ) : (
                    <div className="w-full h-full bg-white dark:bg-slate-900 rounded-full flex items-center justify-center text-xs font-extrabold text-sky-600 dark:text-cyan-300">
                      {profile.displayName ? profile.displayName.charAt(0).toUpperCase() : <User className="w-4 h-4 text-slate-600 dark:text-slate-300" />}
                    </div>
                  )}
                </div>
                <span className="hidden lg:inline text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-sky-600 dark:group-hover:text-cyan-400 max-w-[100px] truncate">
                  {profile.displayName || 'Profile'}
                </span>
              </Link>
              <button
                onClick={handleSignOut}
                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-bold text-xs shadow-sm transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In</span>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
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

