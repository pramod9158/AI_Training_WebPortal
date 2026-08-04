'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { SearchModal } from './SearchModal';
import { useWaynauticStore } from '@/lib/store';

export const ClientAppWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const { profile } = useWaynauticStore();

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (profile.theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
      }
    }
  }, [profile.theme]);

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
