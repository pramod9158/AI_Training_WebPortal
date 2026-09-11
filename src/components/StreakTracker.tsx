'use client';

import React from 'react';
import Link from 'next/link';
import { Flame, Calendar, AlertTriangle, Zap, Check, Sparkles } from 'lucide-react';
import { useWaynauticStore, getTodayDateString, getYesterdayDateString } from '@/lib/store';
import { getResumeLearningUrl } from '@/lib/curriculumService';

interface StreakTrackerProps {
  variant?: 'compact' | 'full' | 'banner';
}

export function StreakTracker({ variant = 'full' }: StreakTrackerProps) {
  const { streak, profile } = useWaynauticStore();
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  // Streak at risk condition: active yesterday, but not yet active today
  const isStreakAtRisk = streak.lastActiveDate === yesterday && streak.lastActiveDate !== today && streak.currentStreak > 0;
  const isActiveToday = streak.lastActiveDate === today;

  const daysOfWeek = [
    { key: 'mon', label: 'M' },
    { key: 'tue', label: 'T' },
    { key: 'wed', label: 'W' },
    { key: 'thu', label: 'T' },
    { key: 'fri', label: 'F' },
    { key: 'sat', label: 'S' },
    { key: 'sun', label: 'S' }
  ];

  const weeklyMap = streak.weeklyActivity || {};
  const resumeUrl = getResumeLearningUrl(profile);

  if (variant === 'banner') {
    if (!isStreakAtRisk) return null;
    return (
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 fill-white text-white animate-bounce" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5 text-xs font-mono font-bold uppercase tracking-wider text-amber-100">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Streak at Risk!</span>
            </div>
            <p className="text-xs sm:text-sm font-extrabold">
              Complete any lesson unit today to keep your {streak.currentStreak}-day learning streak alive!
            </p>
          </div>
        </div>

        <Link
          href={resumeUrl}
          className="px-4 py-2 rounded-xl bg-white text-orange-600 hover:bg-amber-50 font-black text-xs transition-all shadow-md text-center shrink-0 flex items-center justify-center space-x-1"
        >
          <Zap className="w-3.5 h-3.5 fill-orange-600" />
          <span>Save My Streak Now</span>
        </Link>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`w-full h-full min-h-[40px] inline-flex items-center justify-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all ${
        isStreakAtRisk
          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 animate-pulse'
          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
      }`}>
        <Flame className={`w-4 h-4 ${streak.currentStreak > 0 ? 'fill-amber-500 text-amber-600' : 'text-slate-400'}`} />
        <span>{streak.currentStreak} Day{streak.currentStreak === 1 ? '' : 's'}</span>
      </div>
    );
  }

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
      
      {/* Streak Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            isStreakAtRisk
              ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/80 border-2 border-amber-400 animate-pulse'
              : isActiveToday
              ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 border-2 border-emerald-400'
              : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 border border-amber-200'
          }`}>
            <Flame className={`w-7 h-7 ${streak.currentStreak > 0 ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {streak.currentStreak} Day{streak.currentStreak === 1 ? '' : 's'}
              </span>
              {isActiveToday && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Active Today ✓
                </span>
              )}
              {isStreakAtRisk && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-white animate-pulse">
                  At Risk ⚠️
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Consecutive days of practical learning • Personal Best: <strong className="text-slate-800 dark:text-slate-200">{streak.longestStreak} days</strong>
            </p>
          </div>
        </div>

        <Calendar className="w-5 h-5 text-slate-400 hidden sm:block" />
      </div>

      {/* 7-Day Activity Calendar Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
          <span>Weekly Learning Activity</span>
          <span>{Object.keys(weeklyMap).length} days active this week</span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {daysOfWeek.map(({ key, label }) => {
            const isDone = Boolean(weeklyMap[key]);
            return (
              <div
                key={key}
                className={`p-2.5 sm:p-3 rounded-2xl border text-center transition-all ${
                  isDone
                    ? 'bg-amber-500 text-white border-amber-600 shadow-md font-black'
                    : 'bg-slate-50 dark:bg-slate-950/60 text-slate-400 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="text-[10px] font-mono uppercase font-bold">{label}</div>
                <div className="mt-1 flex items-center justify-center">
                  {isDone ? (
                    <Flame className="w-4 h-4 fill-white text-white" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Streak Warning Callout if streak is at risk */}
      {isStreakAtRisk && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700 text-xs text-amber-900 dark:text-amber-200 font-bold flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>You haven&apos;t completed a lesson unit today yet! Keep your momentum going.</span>
          </div>
          <Link
            href={resumeUrl}
            className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold shrink-0 shadow-sm"
          >
            Study Now
          </Link>
        </div>
      )}

    </div>
  );
}
