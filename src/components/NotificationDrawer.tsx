'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Flame, Award, Sparkles, Check, ArrowRight, X } from 'lucide-react';
import { useWaynauticStore, fetchUserNotificationsFromDb } from '@/lib/store';
import { UserNotification } from '@/lib/types';

export function NotificationDrawer() {
  const { notifications, markNotificationRead } = useWaynauticStore();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchUserNotificationsFromDb();
  }, []);

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      fetchUserNotificationsFromDb();
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getIcon = (type: UserNotification['type']) => {
    switch (type) {
      case 'streak_warning':
        return <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />;
      case 'badge_earned':
        return <Award className="w-4 h-4 text-purple-500" />;
      case 're_engagement':
        return <Sparkles className="w-4 h-4 text-sky-500" />;
      default:
        return <Bell className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <div className="relative">
      
      {/* Bell Trigger Button */}
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="View Notifications & Learning Nudges"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-mono font-bold flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Drawer */}
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/20 dark:bg-black/50 backdrop-blur-xs"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 mt-3 w-80 sm:w-96 z-50 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-sky-500" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                  Notifications & Nudges
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-sky-100 dark:bg-cyan-950 text-sky-700 dark:text-cyan-400 text-[10px] font-mono font-bold">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-2 space-y-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 font-medium">
                  No notifications yet! Keep up your learning activity.
                </div>
              ) : (
                notifications.map((nudge) => (
                  <div
                    key={nudge.id}
                    className={`p-3 rounded-2xl transition-colors space-y-2 ${
                      !nudge.isRead
                        ? 'bg-sky-50/60 dark:bg-cyan-950/30 border border-sky-200 dark:border-cyan-800/50'
                        : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                          {getIcon(nudge.type)}
                        </div>
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-xs">
                          {nudge.title}
                        </h4>
                      </div>
                      {!nudge.isRead && (
                        <button
                          onClick={() => markNotificationRead(nudge.id)}
                          className="text-[10px] text-sky-600 dark:text-cyan-400 hover:underline font-mono shrink-0"
                          title="Mark as read"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                      {nudge.message}
                    </p>

                    {nudge.linkUrl && (
                      <Link
                        href={nudge.linkUrl}
                        onClick={() => {
                          markNotificationRead(nudge.id);
                          setIsOpen(false);
                        }}
                        className="inline-flex items-center space-x-1 text-xs font-mono font-bold text-sky-600 dark:text-cyan-400 hover:underline pt-1"
                      >
                        <span>Resume Learning</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                ))
              )}
            </div>

          </div>
        </>
      )}

    </div>
  );
}
