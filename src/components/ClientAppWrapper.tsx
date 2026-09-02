'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { SearchModal } from './SearchModal';
import { useWaynauticStore } from '@/lib/store';

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
    pathname?.startsWith('/reset-password');

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (profile.theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
      }
    }
  }, [profile.theme]);

  if (isAuthPage) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F7F7F7] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100">
        {/* Minimal Auth Header: Brand Logo Only */}
        <header className="w-full py-5 px-4 flex items-center justify-center border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0D121F] shadow-sm">
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

        {/* Centered Auth Card */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
          {children}
        </main>

        {/* Standard Minimal Auth Footer */}
        <footer className="py-5 px-4 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-[#0D121F]/60 font-medium">
          © {new Date().getFullYear()} Waynautic Academy. All rights reserved.
        </footer>
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
