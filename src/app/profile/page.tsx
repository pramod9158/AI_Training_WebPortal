'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useWaynauticStore } from '@/lib/store';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { 
  Award, 
  Save, 
  Sparkles, 
  Check, 
  Clock, 
  LogOut, 
  Database, 
  Lock, 
  User, 
  Camera, 
  ShieldCheck, 
  Crown, 
  QrCode, 
  Compass, 
  Sun, 
  Moon, 
  Cpu, 
  Bot, 
  Code2, 
  Terminal, 
  Flame, 
  KeyRound 
} from 'lucide-react';
import { CertificateModal } from '@/components/CertificateModal';
import { PaymentBarcodeModal } from '@/components/PaymentBarcodeModal';
import { TOPICS } from '@/data/seedTopics';
import { LEARNING_PATHS } from '@/data/seedModules';

// 6 Curated Tech Avatar Presets
const AVATAR_PRESETS = [
  { id: 'ai-architect', label: 'AI Architect', icon: Bot, gradient: 'from-cyan-500 to-blue-600' },
  { id: 'neural-coder', label: 'Neural Coder', icon: Cpu, gradient: 'from-purple-500 to-indigo-600' },
  { id: 'prompt-engineer', label: 'Prompt Craftsman', icon: Sparkles, gradient: 'from-amber-500 to-orange-600' },
  { id: 'cyber-dev', label: 'Cyber Systems', icon: Terminal, gradient: 'from-emerald-500 to-teal-600' },
  { id: 'fullstack-ai', label: 'Full-Stack Dev', icon: Code2, gradient: 'from-rose-500 to-pink-600' },
  { id: 'master-researcher', label: 'Lead Researcher', icon: Flame, gradient: 'from-violet-500 to-fuchsia-600' },
];

export default function ProfilePage() {
  const router = useRouter();
  const { profile, progress, badges, updateProfile, signOut } = useWaynauticStore();
  
  const [name, setName] = useState(profile.displayName || 'Developer');
  const [avatarPreset, setAvatarPreset] = useState<string>(profile.avatarPreset || 'ai-architect');
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string>(profile.avatarUrl || '');
  const [selectedPath, setSelectedPath] = useState<string>(profile.selectedPath || 'path-a');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  useEffect(() => {
    setName(profile.displayName || 'Developer');
    setAvatarPreset(profile.avatarPreset || 'ai-architect');
    setCustomAvatarUrl(profile.avatarUrl || '');
    setSelectedPath(profile.selectedPath || 'path-a');
  }, [profile]);

  const [payments, setPayments] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  const loadUserPayments = () => {
    if (isSupabaseConfigured && (profile.userId || profile.email)) {
      setLoadingPayments(true);
      let query = supabase.from('payments').select('*');
      if (profile.userId) {
        query = query.eq('user_id', profile.userId);
      } else if (profile.email) {
        query = query.ilike('user_email', profile.email);
      }
      query.order('created_at', { ascending: false }).then(({ data, error }) => {
        if (!error && data) {
          setPayments(data);
        }
        setLoadingPayments(false);
      });
    }
  };

  useEffect(() => {
    loadUserPayments();
    window.addEventListener('waynautic_payments_changed', loadUserPayments);
    window.addEventListener('waynautic_storage_change', loadUserPayments);
    return () => {
      window.removeEventListener('waynautic_payments_changed', loadUserPayments);
      window.removeEventListener('waynautic_storage_change', loadUserPayments);
    };
  }, [profile.userId, profile.email]);

  const isLoggedIn = Boolean(profile.userId || profile.email);
  const isPro = profile.plan === 'pro' || profile.plan === 'enterprise';

  const selectedPathObj = LEARNING_PATHS.find(p => p.id === (profile.selectedPath || 'path-a')) || LEARNING_PATHS[0];
  const pathTopics = TOPICS.filter(t => selectedPathObj.moduleSlugs.includes(t.moduleSlug));
  const completedPathTopics = pathTopics.filter(t => progress[t.id]?.status === 'completed');
  const isUnlocked = completedPathTopics.length === pathTopics.length && pathTopics.length > 0;
  const pathPercent = Math.round((completedPathTopics.length / Math.max(pathTopics.length, 1)) * 100);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({ 
      displayName: name.trim() || 'Developer',
      avatarPreset,
      avatarUrl: customAvatarUrl.trim(),
      selectedPath
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleThemeChange = async (newTheme: 'light' | 'dark') => {
    await updateProfile({ theme: newTheme });
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  // Find active preset
  const activePreset = AVATAR_PRESETS.find(p => p.id === avatarPreset) || AVATAR_PRESETS[0];
  const ActiveIcon = activePreset.icon;

  return (
    <div className="min-h-screen py-6 sm:py-10 px-3 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6 sm:space-y-8">
      
      {/* Certificate Modal */}
      <CertificateModal
        isOpen={certModalOpen}
        onClose={() => setCertModalOpen(false)}
        userName={name}
        pathTitle={selectedPathObj.title}
        isUnlocked={isUnlocked}
        completedCount={completedPathTopics.length}
        totalCount={pathTopics.length}
      />

      {/* Upgrade to Pro Modal */}
      <PaymentBarcodeModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
      />

      {/* Top Breadcrumb & Page Header */}
      <div className="border-b-2 border-slate-200 dark:border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-sky-600 dark:text-cyan-400 font-bold">
            Account & Credentials
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white pt-1">
            Student Profile & Settings
          </h1>
        </div>

        {isLoggedIn && (
          <button
            onClick={handleSignOut}
            className="self-start sm:self-auto flex items-center space-x-2 px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold hover:bg-rose-100 transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        )}
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Section 1: Identity & Avatar Card */}
        <div className="p-5 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/80 border-2 border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
            
            {/* Live Profile Header Preview */}
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr ${activePreset.gradient} p-1 shadow-lg shrink-0 flex items-center justify-center`}>
                {customAvatarUrl ? (
                  <div className="w-full h-full rounded-xl overflow-hidden bg-slate-950">
                    <img 
                      src={customAvatarUrl} 
                      alt={name} 
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                      onError={() => setCustomAvatarUrl('')}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full rounded-xl bg-white dark:bg-slate-950 flex items-center justify-center">
                    <ActiveIcon className="w-8 h-8 sm:w-10 sm:h-10 text-slate-800 dark:text-white" />
                  </div>
                )}
              </div>
              
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-lg sm:text-xl">
                    {name || 'Developer'}
                  </h3>
                  {isPro ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                      PRO PASS
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                      FREE TIER
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  {profile.email || 'Local Student Session'}
                </p>
                <p className="text-[11px] text-sky-600 dark:text-cyan-400 font-semibold mt-1">
                  Preset: {activePreset.label}
                </p>
              </div>
            </div>

            {/* Cloud Sync Status */}
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

          {/* Display Name Input */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
              <User className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
              <span>Full Name (Appears on Verified Certificates)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 font-semibold text-sm transition-colors"
              placeholder="e.g., Alex Mercer"
            />
          </div>

          {/* Avatar Selector Grid */}
          <div className="space-y-3">
            <label className="text-xs font-mono uppercase font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
              <Camera className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
              <span>Choose Your Engineer Avatar</span>
            </label>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {AVATAR_PRESETS.map((preset) => {
                const Icon = preset.icon;
                const isSelected = avatarPreset === preset.id && !customAvatarUrl;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setAvatarPreset(preset.id);
                      setCustomAvatarUrl('');
                    }}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center text-center space-y-2 transition-all ${
                      isSelected
                        ? 'border-sky-500 dark:border-cyan-400 bg-sky-50 dark:bg-cyan-950/40 shadow-md scale-105'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${preset.gradient} p-0.5 flex items-center justify-center text-white shadow-sm`}>
                      <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[10px] flex items-center justify-center">
                        <Icon className="w-5 h-5 text-slate-800 dark:text-white" />
                      </div>
                    </div>
                    <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 leading-tight">
                      {preset.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Avatar URL Field */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-mono uppercase font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
              <KeyRound className="w-3.5 h-3.5 text-slate-500" />
              <span>Or Paste Custom Image URL (Optional)</span>
            </label>
            <input
              type="url"
              value={customAvatarUrl}
              onChange={(e) => setCustomAvatarUrl(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 font-mono text-xs transition-colors"
              placeholder="https://example.com/my-photo.jpg"
            />
          </div>

        </div>

        {/* Section 2: Membership & Pro Pass Upgrade Card */}
        <div className="p-5 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/80 border-2 border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg">
                  {isPro ? 'Waynautic Pro AI Pass (Lifetime Access)' : 'Waynautic Free Candidate Account'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {isPro 
                    ? 'All 10 curriculum modules, quizzes, and verified certification unlocked.' 
                    : 'Upgrade for ₹999 to unlock all 10 specialized modules & verified certificate.'}
                </p>
              </div>
            </div>

            {!isPro ? (
              <button
                type="button"
                onClick={() => setPaymentModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 font-bold text-xs sm:text-sm flex items-center space-x-2 shrink-0 transition-all min-h-[40px]"
              >
                <QrCode className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Upgrade to Pro (₹999)</span>
              </button>
            ) : (
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-black">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Pro Active</span>
              </div>
            )}
          </div>

          {/* Payment & Billing History from Supabase */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase font-bold text-slate-500 dark:text-slate-400">
                Payment & Billing History
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Live Supabase Records
              </span>
            </div>

            {loadingPayments ? (
              <div className="p-3 text-center text-xs font-mono text-slate-400 animate-pulse">
                Checking billing records in Supabase...
              </div>
            ) : payments.length > 0 ? (
              <div className="space-y-3">
                {payments.map((p) => (
                  <div key={p.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="font-mono font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                          <span>UTR: {p.transaction_reference}</span>
                          <span>•</span>
                          <span className="text-emerald-600 dark:text-emerald-400">₹{p.amount} {p.currency}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Submitted on {new Date(p.created_at).toLocaleDateString()} at {new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      <div>
                        {p.status === 'verified' ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-600 flex items-center space-x-1">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Payment Approved (Pro Active)</span>
                          </span>
                        ) : p.status === 'rejected' ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-600">
                            Payment Declined
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-600 flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>Pending Admin Review</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Declined Details & Support Contact 9158998226 */}
                    {p.status === 'rejected' && (
                      <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 space-y-2">
                        <div className="text-rose-700 dark:text-rose-300 font-semibold text-xs">
                          Decline Reason: <strong className="font-bold">&ldquo;{p.rejection_reason || 'UTR could not be matched with bank ledger deposits'}&rdquo;</strong>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-rose-200/60 dark:border-rose-900/40 text-[11px]">
                          <div className="flex flex-wrap items-center gap-2 text-slate-600 dark:text-slate-300">
                            <span>Admissions Helpline:</span>
                            <a 
                              href="tel:9158998226" 
                              className="font-extrabold text-slate-900 dark:text-white underline hover:text-sky-500"
                            >
                              📞 9158998226
                            </a>
                            <span>•</span>
                            <a 
                              href={`https://wa.me/919158998226?text=${encodeURIComponent(`Hello Waynautic, my payment (${p.transaction_reference}) was declined for ${profile.email || ''}. Please assist.`)}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="font-extrabold text-emerald-600 dark:text-emerald-400 underline"
                            >
                              💬 WhatsApp
                            </a>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPaymentModalOpen(true)}
                            className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[11px] shadow-sm transition-colors cursor-pointer"
                          >
                            Re-submit Corrected UTR
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Pending Notice */}
                    {p.status === 'pending' && (
                      <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300 flex items-center justify-between">
                        <span>Awaiting verification (~15 mins). Need immediate help?</span>
                        <a href="tel:9158998226" className="font-bold underline ml-2">Call 9158998226</a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No payment transactions recorded yet. When you scan the official QR and submit your UTR, your verification receipts will appear here.
              </p>
            )}
          </div>
        </div>

        {/* Section 3: Learning Path & Platform Preferences Card */}
        <div className="p-5 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/80 border-2 border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg flex items-center space-x-2">
            <Compass className="w-5 h-5 text-sky-600 dark:text-cyan-400" />
            <span>Learning Pathway & Platform Settings</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Learning Path Selection */}
            {LEARNING_PATHS.map((path) => {
              const isCurrent = selectedPath === path.id;
              return (
                <div
                  key={path.id}
                  onClick={() => setSelectedPath(path.id)}
                  className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    isCurrent
                      ? 'border-sky-500 dark:border-cyan-400 bg-sky-50 dark:bg-cyan-950/30 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-600 dark:text-cyan-400">
                      {path.id === 'path-a' ? 'Sequence A' : 'Sequence B'}
                    </span>
                    {isCurrent && (
                      <span className="flex items-center space-x-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-sky-500 text-white">
                        <Check className="w-3 h-3" />
                        <span>Active</span>
                      </span>
                    )}
                  </div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
                    {path.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    {path.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Theme Mode Toggle */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">Theme Appearance</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Select your preferred platform lighting mode.</p>
            </div>
            
            <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => handleThemeChange('light')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  profile.theme === 'light'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Light</span>
              </button>

              <button
                type="button"
                onClick={() => handleThemeChange('dark')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  profile.theme === 'dark'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Moon className="w-4 h-4 text-cyan-400" />
                <span>Dark</span>
              </button>
            </div>
          </div>

        </div>

        {/* Action Buttons Bar */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-bold text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 min-h-[42px] shadow-sm"
          >
            {savedSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4 text-current" />}
            <span>{savedSuccess ? 'Profile & Settings Saved!' : 'Save Account Settings'}</span>
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
                <span>View Official Certificate 🎓</span>
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

      {/* Badges & Achievements Section */}
      <div className="space-y-4 pt-4">
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
