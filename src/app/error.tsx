'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, BookOpen } from 'lucide-react';

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled app route error:', error);
  }, [error]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#0D121F] border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center animate-in fade-in duration-300">
        
        <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-100 dark:bg-rose-950/80 border-2 border-rose-300 dark:border-rose-500/40 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-md">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-rose-600 dark:text-rose-400 font-bold">
            Application Exception
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Something went wrong
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            We encountered an unexpected error while rendering this page. You can try refreshing the page or returning to the home workspace.
          </p>
        </div>

        {error.message && (
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left">
            <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">Error Detail:</span>
            <code className="text-xs font-mono text-rose-600 dark:text-rose-400 break-all leading-tight">
              {error.message}
            </code>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-1/2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-bold text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 min-h-[42px] shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-1/2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 min-h-[42px]"
          >
            <Home className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Go to Home</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
