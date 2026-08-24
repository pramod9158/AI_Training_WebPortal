'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWaynauticStore } from '@/lib/store';
import { isSupabaseConfigured } from '@/lib/supabaseClient';
import { Award, Save, Sparkles, Check, Clock, LogOut, Database } from 'lucide-react';
import { CertificateModal } from '@/components/CertificateModal';

export default function ProfilePage() {
  const router = useRouter();
  const { profile, badges, updateProfile, signOut } = useWaynauticStore();
  const [name, setName] = useState(profile.displayName || 'Developer');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [certModalOpen, setCertModalOpen] = useState(false);

  const isLoggedIn = Boolean(profile.userId || profile.email);

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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      
      <CertificateModal
        isOpen={certModalOpen}
        onClose={() => setCertModalOpen(false)}
        userName={name}
        pathTitle="AI & Software Engineering Path"
      />

      {/* Header */}
      <div className="border-b border-slate-800 pb-6 flex items-center justify-between">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">Account & Credentials</span>
          <h1 className="text-3xl font-extrabold text-white">Student Profile & Settings</h1>
        </div>

        {isLoggedIn && (
          <button
            onClick={handleSignOut}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-bold hover:bg-rose-900/50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        )}
      </div>

      {/* Account Info Card */}
      <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl space-y-6">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-500 to-violet-600 p-[2px]">
              <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center text-xl font-bold text-cyan-300">
                {name ? name.charAt(0).toUpperCase() : 'D'}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">{name}</h3>
              <p className="text-xs text-slate-400 font-mono">{profile.email || 'Email & Password Student Account'}</p>
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end space-y-1">
            <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-full">
              <Database className="w-3.5 h-3.5" />
              <span>{isSupabaseConfigured ? 'Supabase DB Synced' : 'Local Persistence Mode'}</span>
            </div>
            <div className="flex items-center space-x-1.5 text-[11px] font-mono text-slate-400">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>8-Hour Session Timeout Active</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase text-slate-300">Display Name / Certificate Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-medium text-sm"
              placeholder="Your full name"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold text-sm hover:brightness-110 shadow-lg shadow-cyan-500/20 transition-all flex items-center space-x-2"
            >
              {savedSuccess ? <Check className="w-4 h-4 text-black" /> : <Save className="w-4 h-4 text-black" />}
              <span>{savedSuccess ? 'Profile Saved!' : 'Save Profile'}</span>
            </button>

            <button
              type="button"
              onClick={() => setCertModalOpen(true)}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold text-sm transition-all flex items-center space-x-2"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>Preview Certificate</span>
            </button>
          </div>

        </form>
      </div>

      {/* Badges Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Award className="w-5 h-5 text-violet-400" />
          <span>Earned Badges ({badges.length})</span>
        </h2>

        {badges.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm bg-slate-900/40 rounded-2xl border border-slate-800">
            No badges earned yet. Complete topics and pass quizzes to unlock achievement badges!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {badges.map((b) => (
              <div key={b.id} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start space-x-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{b.title}</h4>
                  <p className="text-xs text-slate-400">{b.description}</p>
                  <span className="text-[10px] text-slate-500 font-mono block mt-1">
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
