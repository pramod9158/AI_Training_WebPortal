'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, BookOpen } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class QueryErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Query/Component Error Boundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0D121F] border-2 border-rose-200 dark:border-rose-950/60 shadow-xl space-y-4 text-center my-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-500/40 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-md">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              {this.props.fallbackTitle || 'Unable to Load Data'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              {this.props.fallbackMessage || 'A data fetch or network query encountered an error. Please check your internet connection or try again.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center space-x-2 min-h-[40px]"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Query</span>
            </button>

            <Link
              href="/curriculum"
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs sm:text-sm transition-all flex items-center space-x-2 min-h-[40px]"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Back to Curriculum</span>
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
