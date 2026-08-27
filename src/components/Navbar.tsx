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
  LogIn
} from 'lucide-react';
import { useWaynauticStore } from '@/lib/store';
import { TOPICS } from '@/data/seedTopics';

interface NavbarProps {
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, streak, bookmarks, updateProfile, signOut } = useWaynauticStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoggedIn = Boolean(profile.userId || profile.email);
  const lastTopic = profile.lastAccessedTopicId 
    ? TOPICS.find(t => t.id === profile.lastAccessedTopicId || t.slug === profile.lastAccessedTopicId)
    : null;

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

  const navLinks = [
    { href: '/curriculum', label: 'Curriculum', icon: BookOpen },
    { href: '/paths', label: 'Paths', icon: Compass },
    { href: '/dashboard', label: 'Dashboard', icon: Zap },
    { href: '/about', label: 'About', icon: Sparkles },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#0B0F19]/80 border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center group py-1">
          <Image
            src="/waynautic-logo.png"
            alt="Waynautic"
            width={160}
            height={36}
            className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105"
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
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action Tools */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Resume Learning Button */}
          {lastTopic && (
            <Link
              href={`/curriculum/${lastTopic.moduleSlug}/${lastTopic.slug}`}
              className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-semibold hover:border-cyan-400 transition-all shadow-sm"
              title={`Resume: ${lastTopic.title}`}
            >
              <PlayCircle className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Resume</span>
            </Link>
          )}

          {/* Search Launcher Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/60 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-all text-xs font-mono"
            title="Search topics (Cmd+K)"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-slate-800 text-slate-400 rounded border border-slate-700">⌘K</kbd>
          </button>

          {/* Streak Flame Counter */}
          <div 
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold shadow-sm"
            title={`${streak.currentStreak} Day Learning Streak`}
          >
            <Flame className="w-4 h-4 fill-amber-400 animate-pulse text-amber-400" />
            <span>{streak.currentStreak}d</span>
          </div>

          {/* Bookmarks Counter */}
          <Link
            href="/dashboard?tab=bookmarks"
            className="relative p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/60 rounded-lg transition-colors"
            title="Saved Topics"
          >
            <Bookmark className="w-4 h-4" />
            {bookmarks.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-cyan-500 text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                {bookmarks.length}
              </span>
            )}
          </Link>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-400 hover:text-amber-300 hover:bg-slate-800/60 rounded-lg transition-colors"
            title="Toggle theme"
          >
            {profile.theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* User Profile / Auth Link */}
          {isLoggedIn ? (
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
              <Link
                href="/profile"
                className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
                title={profile.email || profile.displayName}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 p-[1px]">
                  <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-xs font-bold text-cyan-300">
                    {profile.displayName ? profile.displayName.charAt(0).toUpperCase() : <User className="w-4 h-4 text-slate-300" />}
                  </div>
                </div>
              </Link>
              <button
                onClick={handleSignOut}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 text-black font-bold text-xs hover:bg-cyan-400 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In</span>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0D121F] border-b border-slate-800 px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-4 duration-200">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                  isActive
                    ? 'text-cyan-400 bg-cyan-950/50 border border-cyan-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-5 h-5 text-cyan-400" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          
          {lastTopic && (
            <Link
              href={`/curriculum/${lastTopic.moduleSlug}/${lastTopic.slug}`}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-base font-medium text-cyan-300 bg-cyan-950/30 border border-cyan-500/30"
            >
              <PlayCircle className="w-5 h-5 text-cyan-400" />
              <span>Resume ({lastTopic.title})</span>
            </Link>
          )}

          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenSearch) onOpenSearch();
              }}
              className="w-full flex items-center justify-center space-x-2 py-2.5 bg-slate-900 border border-slate-700/80 rounded-lg text-sm text-slate-300 font-medium"
            >
              <Search className="w-4 h-4 text-cyan-400" />
              <span>Search 56 Topics</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
