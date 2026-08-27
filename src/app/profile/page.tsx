'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWaynauticStore } from '@/lib/store';
import { isSupabaseConfigured } from '@/lib/supabaseClient';
import { Award, Save, Sparkles, Check, Clock, LogOut, Database, Lock } from 'lucide-react';
import { CertificateModal } from '@/components/CertificateModal';
import { TOPICS } from '@/data/seedTopics';
import { LEARNING_PATHS } from '@/data/seedModules';

export default function ProfilePage() {
  const router = useRouter();
  const { profile, progress, badges, updateProfile, signOut } = useWaynauticStore();
  const [name, setName] = useState(profile.displayName || 'Developer');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [certModalOpen, setCertModalOpen] = useState(false);

  const isLoggedIn = Boolean(profile.userId || profile.email);

  const selectedPathObj = LEARNING_PATHS.find(p => p.id === (profile.selectedPath || 'path-a')) || LEARNING_PATHS[0];
  const pathTopics = TOPICS.filter(t => selectedPathObj.moduleSlugs.includes(t.moduleSlug));
  const completedPathTopics = pathTopics.filter(t => progress[t.id]?.status === 'completed');
  const isUnlocked = completedPathTopics.length === pathTopics.length && pathTopics.length > 0;
  const pathPercent = Math.round((completedPathTopics.length / Math.max(pathTopics.length, 1)) * 100);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({ displayName: name });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen py-8 sm:py-12 px-3 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6 sm:space-y-8">
      
      <CertificateModal
        isOpen={certModalOpen}
        onClose={() => setCertModalOpen(false)}
        userName={name}
        pathTitle={selectedPathObj.title}
        isUnlocked={isUnlocked}
        completedCount={completedPathTopics.length}
        totalCount={pathTopics.length}
      />

      {/* Header */}
      <div className="border-b-2 border-slate-200 dark:border-slate-800 pb-6 flex items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-sky-600 dark:text-cyan-400 font-bold">Account & Credentials</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white pt-1">Student Profile & Settings</h1>
        </div>

        {isLoggedIn && (
          <button
            onClick={handleSignOut}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold hover:bg-rose-100 transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        )}
      </div>

      {/* Account Info Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/80 border-2 border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-slate-200 dark:border-slate-800/80 pb-6">
          <div className="flex items-center space-x-4">
            <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-full bg-gradient-to-tr from-sky-500 to-violet-600 p-[2px] shrink-0">
              <div className="w-full h-full bg-white dark:bg-slate-950 rounded-full flex items-center justify-center text-xl font-extrabold text-sky-600 dark:text-cyan-300">
                {name ? name.charAt(0).toUpperCase() : 'D'}
              </div>
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">{name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono font-medium">{profile.email || 'Email & Password Student Account'}</p>
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end space-y-1">
            <div className="flex items-center space-x-2 text-xs font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/30 px-3 py-1 rounded-full font-bold">
              <Database className="w-3.5 h-3.5" />
              <span>{isSupabaseConfigured ? 'Supabase DB Synced' : 'Local Persistence Mode'}</span>
            </div>
            <div className="flex items-center space-x-1.5 text-[11px] font-mono text-slate-500 dark:text-slate-400 font-medium">
              <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
              <span>8-Hour Session Protection Active</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase font-bold text-slate-700 dark:text-slate-300">Display Name / Certificate Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 font-semibold text-sm"
              placeholder="Your full name"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-[#58CC02] hover:bg-[#61E002] border-2 border-[#58A700] shadow-[0_3px_0_0_#58A700] text-white font-extrabold text-xs sm:text-sm transition-all flex items-center space-x-2 min-h-[44px]"
            >
              {savedSuccess ? <Check className="w-4 h-4 text-white" /> : <Save className="w-4 h-4 text-white" />}
              <span>{savedSuccess ? 'Profile Saved!' : 'Save Profile'}</span>
            </button>

            <button
              type="button"
              onClick={() => setCertModalOpen(true)}
              className={`px-6 py-3 rounded-xl border-2 font-extrabold text-xs sm:text-sm transition-all flex items-center space-x-2 min-h-[44px] ${
                isUnlocked
                  ? 'bg-amber-50 hover:bg-amber-100 dark:bg-slate-800 text-amber-700 dark:text-amber-300 border-amber-400 dark:border-amber-500/30'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {isUnlocked ? (
                <>
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>View Certificate 🎓</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-amber-500" />
                  <span>Certificate Locked ({pathPercent}%)</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>

      {/* Badges Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
          <Award className="w-5 h-5 text-purple-600 dark:text-violet-400" />
          <span>Earned Badges ({badges.length})</span>
        </h2>

        {badges.length === 0 ? (
          <div className="p-8 sm:p-12 text-center text-slate-500 dark:text-slate-400 text-sm bg-white dark:bg-slate-900/40 rounded-3xl border-2 border-slate-200 dark:border-slate-800 font-medium">
            No badges earned yet. Complete topics and pass quizzes to unlock achievement badges!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {badges.map((b) => (
              <div key={b.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border-2 border-slate-200 dark:border-slate-800 flex items-start space-x-3 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-cyan-950 border border-purple-300 dark:border-cyan-800 flex items-center justify-center text-purple-600 dark:text-cyan-400 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">{b.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{b.description}</p>
                  <span className="text-[10px] text-slate-500 font-mono block mt-1 font-bold">
                    Unlocked: {new Date(b.earnedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
