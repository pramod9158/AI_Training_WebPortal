'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useWaynauticStore, fetchAndSyncCloudUser } from '@/lib/store';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { 
  Award, 
  Check, 
  LogOut, 
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
  Clock,
  Receipt,
  Download,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Calendar,
  RefreshCw,
  Video,
  ArrowRight,
  PackageCheck,
  MessageCircle,
  AlertCircle
} from 'lucide-react';
import { CertificateModal } from '@/components/CertificateModal';
import { RazorpayModal } from '@/components/RazorpayModal';
import { getAllTopics, fetchCurriculumUpdates } from '@/lib/curriculumService';
import { LEARNING_PATHS } from '@/data/seedModules';
import { AVATAR_PRESETS, getAvatarPreset } from '@/data/avatarPresets';
import { getLocalPayments } from '@/lib/adminService';

function resolveProgramInfo(payment: any) {
  const amount = Number(payment.amount || 0);
  const notes = (payment.notes || '').toLowerCase();
  const planGranted = (payment.plan_granted || payment.planGranted || '').toLowerCase();
  
  if (amount >= 9000 || notes.includes('cohort') || planGranted === 'pro') {
    return {
      type: 'cohort',
      title: '4-Week AI Intensive Cohort',
      badge: 'Flagship Masterclass',
      badgeColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
      description: 'Full portal access: all 56 topics, 4 weeks live mentoring & 3-Month Industry Internship',
      actionUrl: '/curriculum',
      actionLabel: 'Go to Curriculum',
      isWebinar: false,
      isCohort: true,
    };
  }
  
  if (amount === 19 || amount === 5 || notes.includes('expert') || notes.includes('webinar') || planGranted === 'webinar') {
    return {
      type: 'webinar',
      title: 'Live AI Webinar Session',
      badge: 'Webinar Pass Active',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
      description: 'Interactive Live AI Webinar with mentor, resume audit & agentic AI project guidance',
      actionUrl: 'https://wa.me/919158998226?text=' + encodeURIComponent('Hi Waynautic Academy, I have enrolled for the Live AI Webinar. Please share the session schedule and link.'),
      actionLabel: 'Join WhatsApp / Support',
      isWebinar: true,
      isCohort: false,
    };
  }

  if (amount === 1 || notes.includes('consultation')) {
    return {
      type: 'consultation',
      title: '1-on-1 AI Consultation & Roadmap',
      badge: 'Consultation Booked',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      description: 'Personalized AI learning roadmap & 1-on-1 career transition advisory session',
      actionUrl: 'https://wa.me/919158998226?text=' + encodeURIComponent('Hi Waynautic Academy, I booked my 1-on-1 AI Consultation. Please schedule my slot.'),
      actionLabel: 'Schedule Session',
      isWebinar: false,
      isCohort: false,
    };
  }

  return {
    type: 'course',
    title: notes.includes('pro') ? 'Waynautic Pro AI Pass' : 'Waynautic Program Pass',
    badge: 'Verified Access',
    badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
    description: 'Course enrollment & verification pass',
    actionUrl: '/curriculum',
    actionLabel: 'Access Portal',
    isWebinar: false,
    isCohort: false,
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const { profile, progress, updateProfile, signOut, setTheme } = useWaynauticStore();
  
  const [name, setName] = useState(profile.displayName || 'Developer');
  const [avatarPreset, setAvatarPreset] = useState<string>(profile.avatarPreset || 'ai-architect');
  const [selectedPath, setSelectedPath] = useState<string>(profile.selectedPath || 'path-a');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  // Tab State: 'profile' | 'orders'
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');

  // Check URL query param for default tab
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab') === 'orders') {
        setActiveTab('orders');
      }
    }
  }, []);

  const isTypingRef = useRef(false);
  const statusTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerSavedFeedback = () => {
    setSaveStatus('saved');
    if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    statusTimerRef.current = setTimeout(() => {
      setSaveStatus('idle');
    }, 2500);
  };

  useEffect(() => {
    return () => {
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    };
  }, []);

  // Dynamic topics synchronized with admin additions and Supabase
  const [topics, setTopics] = useState(() => getAllTopics());

  useEffect(() => {
    fetchCurriculumUpdates().then((updated) => setTopics(updated));
    const handleCurriculumChange = () => setTopics(getAllTopics());
    window.addEventListener('waynautic_curriculum_changed', handleCurriculumChange);
    return () => window.removeEventListener('waynautic_curriculum_changed', handleCurriculumChange);
  }, []);

  useEffect(() => {
    if (!isTypingRef.current) {
      setName(profile.displayName || 'Developer');
    }
    setAvatarPreset(profile.avatarPreset || 'ai-architect');
    setSelectedPath(profile.selectedPath || 'path-a');
  }, [profile]);

  const [payments, setPayments] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  const loadUserPayments = async () => {
    setLoadingPayments(true);
    let allPayments: any[] = [];
    const cleanEmail = (profile.email || '').trim().toLowerCase();

    // 1. Fetch from Supabase ledger
    if (isSupabaseConfigured && (profile.userId || cleanEmail)) {
      try {
        let query = supabase.from('payments').select('*');
        if (profile.userId && cleanEmail) {
          query = query.or(`user_id.eq.${profile.userId},user_email.ilike.${cleanEmail}`);
        } else if (profile.userId) {
          query = query.eq('user_id', profile.userId);
        } else if (cleanEmail) {
          query = query.ilike('user_email', cleanEmail);
        }
        const { data, error } = await query.order('created_at', { ascending: false });
        if (!error && data) {
          allPayments = data;
        }
      } catch (err) {
        console.warn('Could not query cloud payments:', err);
      }
    }

    // 2. Fetch from local payments cache (fallback & immediate reflection)
    try {
      const localList = getLocalPayments();
      const localMatches = localList.filter((p: any) => {
        const pEmail = (p.userEmail || '').trim().toLowerCase();
        return (cleanEmail && pEmail === cleanEmail) || (profile.userId && p.userId === profile.userId);
      });

      const seenRefs = new Set(allPayments.map((p: any) => (p.transaction_reference || '').toLowerCase()));
      for (const lp of localMatches) {
        const ref = (lp.transactionReference || '').toLowerCase();
        if (ref && !seenRefs.has(ref)) {
          seenRefs.add(ref);
          allPayments.push({
            id: lp.id,
            user_id: lp.userId,
            user_email: lp.userEmail,
            user_name: lp.userName,
            amount: lp.amount,
            currency: lp.currency,
            payment_method: lp.paymentMethod,
            transaction_reference: lp.transactionReference,
            barcode_id: lp.barcodeId,
            status: lp.status,
            proof_url: lp.proofUrl,
            notes: lp.notes,
            rejection_reason: lp.rejectionReason,
            plan_granted: lp.planGranted,
            verified_at: lp.verifiedAt,
            created_at: lp.createdAt,
          });
        }
      }
    } catch (e) {
      console.warn('Error reading local payments:', e);
    }

    // Sort newest first
    allPayments.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    setPayments(allPayments);
    setLoadingPayments(false);
  };

  useEffect(() => {
    loadUserPayments();
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          fetchAndSyncCloudUser(session.user);
        }
      });
    }
    window.addEventListener('waynautic_payments_changed', loadUserPayments);
    window.addEventListener('waynautic_storage_change', loadUserPayments);
    return () => {
      window.removeEventListener('waynautic_payments_changed', loadUserPayments);
      window.removeEventListener('waynautic_storage_change', loadUserPayments);
    };
  }, [profile.userId, profile.email]);

  const isLoggedIn = Boolean(profile.userId || profile.email);
  const isPro = profile.plan === 'pro' || profile.plan === 'enterprise';

  // Determine active passes based on verified transactions
  const verifiedPayments = payments.filter((p) => p.status === 'verified');
  const hasWebinarPass = verifiedPayments.some((p) => {
    const info = resolveProgramInfo(p);
    return info.type === 'webinar';
  });
  const hasCohortPass = isPro || verifiedPayments.some((p) => {
    const info = resolveProgramInfo(p);
    return info.type === 'cohort';
  });
  const hasConsultationPass = verifiedPayments.some((p) => {
    const info = resolveProgramInfo(p);
    return info.type === 'consultation';
  });

  const selectedPathObj = LEARNING_PATHS.find(p => p.id === (profile.selectedPath || 'path-a')) || LEARNING_PATHS[0];
  const pathTopics = topics.filter(t => selectedPathObj.moduleSlugs.includes(t.moduleSlug));
  const completedPathTopics = pathTopics.filter(t => progress[t.id]?.status === 'completed');
  const isUnlocked = completedPathTopics.length === pathTopics.length && pathTopics.length > 0;
  const pathPercent = Math.round((completedPathTopics.length / Math.max(pathTopics.length, 1)) * 100);

  // Auto-save name with debounce when user types
  useEffect(() => {
    if (!isTypingRef.current) return;
    const timer = setTimeout(() => {
      const trimmed = name.trim() || 'Developer';
      updateProfile({ displayName: trimmed });
      triggerSavedFeedback();
      isTypingRef.current = false;
    }, 600);
    return () => clearTimeout(timer);
  }, [name, updateProfile]);

  const handleNameBlur = () => {
    const trimmed = name.trim() || 'Developer';
    if (trimmed !== profile.displayName) {
      updateProfile({ displayName: trimmed });
      triggerSavedFeedback();
    }
    isTypingRef.current = false;
  };

  const handleAvatarSelect = (presetId: string) => {
    setAvatarPreset(presetId);
    updateProfile({ avatarPreset: presetId, avatarUrl: '' });
    triggerSavedFeedback();
  };

  const handlePathSelect = (pathId: string) => {
    setSelectedPath(pathId);
    updateProfile({ selectedPath: pathId });
    triggerSavedFeedback();
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    triggerSavedFeedback();
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

      {/* Upgrade to Pro Modal via Razorpay */}
      <RazorpayModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        plan="cohort"
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

        <div className="flex items-center gap-3">
          {saveStatus === 'saved' && (
            <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-600 text-emerald-600 dark:text-emerald-400 text-xs font-bold animate-in fade-in zoom-in duration-200 shadow-sm">
              <Check className="w-3.5 h-3.5" />
              <span>Auto-saved</span>
            </span>
          )}
          {isLoggedIn && (
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold hover:bg-rose-100 transition-colors shrink-0 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs: Profile & Settings vs My Orders & Transactions */}
      <div className="flex items-center gap-2 border-b-2 border-slate-200 dark:border-slate-800 pb-px">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'border-sky-500 text-sky-600 dark:text-cyan-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile & Settings</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'border-sky-500 text-sky-600 dark:text-cyan-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>My Orders & Transactions</span>
          {payments.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-sky-500/10 text-sky-600 dark:text-cyan-400 border border-sky-500/20">
              {payments.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: PROFILE & SETTINGS */}
      {activeTab === 'profile' && (
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6 animate-in fade-in duration-200">
          
          {/* Section 1: Identity & Avatar Card */}
          <div className="p-5 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/80 border-2 border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
              
              {/* Live Profile Header Preview */}
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr ${activePreset.gradient} p-1 shadow-lg shrink-0 flex items-center justify-center`}>
                  <div className="w-full h-full rounded-xl bg-white dark:bg-slate-950 flex items-center justify-center">
                    <ActiveIcon className="w-8 h-8 sm:w-10 sm:h-10 text-slate-800 dark:text-white" />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-lg sm:text-xl">
                      {name || 'Developer'}
                    </h3>
                    {hasCohortPass ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                        <Crown className="w-3 h-3 text-amber-500" />
                        <span>PRO PASS</span>
                      </span>
                    ) : hasWebinarPass ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>WEBINAR PASS ACTIVE</span>
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

              {/* Quick Link to My Orders */}
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
              >
                <Receipt className="w-4 h-4 text-emerald-500" />
                <span>View Orders ({payments.length})</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            {/* Display Name Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                  <User className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
                  <span>Full Name (Appears on Verified Certificates)</span>
                </label>
                {saveStatus === 'saved' && (
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                    <Check className="w-3 h-3" />
                    <span>Saved</span>
                  </span>
                )}
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  isTypingRef.current = true;
                  setName(e.target.value);
                }}
                onBlur={handleNameBlur}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                  }
                }}
                className="w-full p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 font-semibold text-base sm:text-sm transition-colors min-h-[44px]"
                placeholder="e.g., Alex Mercer"
              />
            </div>

            {/* Avatar Selector Grid */}
            <div className="space-y-3">
              <label className="text-xs font-mono uppercase font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                <Camera className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
                <span>Choose Your Engineer Avatar (Instant Switch)</span>
              </label>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
                {AVATAR_PRESETS.map((preset) => {
                  const Icon = preset.icon;
                  const isSelected = avatarPreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleAvatarSelect(preset.id)}
                      className={`p-2 sm:p-3 rounded-2xl border-2 flex flex-col items-center text-center space-y-1.5 sm:space-y-2 transition-all min-h-[72px] cursor-pointer ${
                        isSelected
                          ? 'border-sky-500 dark:border-cyan-400 bg-sky-50 dark:bg-cyan-950/40 shadow-md scale-105'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr ${preset.gradient} p-0.5 flex items-center justify-center text-white shadow-sm`}>
                        <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[10px] flex items-center justify-center">
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-800 dark:text-white" />
                        </div>
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-800 dark:text-slate-200 leading-tight">
                        {preset.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Section 2: Membership & Active Programs Card */}
          <div className="p-5 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/80 border-2 border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg">
                    {hasCohortPass 
                      ? 'Waynautic Pro AI Pass (1 Year Access)' 
                      : hasWebinarPass
                      ? 'Live AI Webinar Pass Holder'
                      : 'Waynautic Candidate Account'}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {hasCohortPass 
                      ? 'All 10 curriculum modules, video lectures, code labs, quizzes, and 3-month internship unlocked.' 
                      : hasWebinarPass
                      ? 'Your Live AI Webinar access is confirmed. Check session details in My Orders.'
                      : 'Free starter candidate membership account.'}
                  </p>
                </div>
              </div>

              {hasCohortPass ? (
                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-black shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verified Pro Active</span>
                </div>
              ) : hasWebinarPass ? (
                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-black shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-amber-500" />
                  <span>Webinar Pass Active</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-md hover:brightness-110 transition-all shrink-0 cursor-pointer"
                >
                  Upgrade to Flagship Cohort
                </button>
              )}
            </div>

            {/* Quick Enrolled Program Highlight Banner */}
            {hasWebinarPass && !hasCohortPass && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                      Enrolled: Live AI Webinar Session (₹19)
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                      Session access pass is active. You can download your invoice and view details.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>View in My Orders</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Section 3: Platform Preferences Card */}
          <div className="p-5 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/80 border-2 border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg flex items-center space-x-2">
              <Compass className="w-5 h-5 text-sky-600 dark:text-cyan-400" />
              <span>Platform Settings</span>
            </h3>

            {/* Theme Mode Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">Theme Appearance</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Select your preferred platform lighting mode.</p>
              </div>
              
              <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => handleThemeChange('light')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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

          {/* Action Bar: Auto-save status and Certificate access */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
            <div className="flex items-center space-x-2 text-xs font-semibold">
              {saveStatus === 'saved' ? (
                <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-600/50 shadow-sm transition-all animate-in fade-in duration-150">
                  <Check className="w-4 h-4" />
                  <span>All changes auto-saved instantly</span>
                </span>
              ) : (
                <span className="flex items-center space-x-1.5 text-slate-400 dark:text-slate-500 px-1 py-1">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Changes save automatically</span>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setCertModalOpen(true)}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl border-2 font-bold text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 min-h-[42px] cursor-pointer ${
                isUnlocked
                  ? 'bg-amber-50 hover:bg-amber-100 dark:bg-slate-800 text-amber-700 dark:text-amber-300 border-amber-400 dark:border-amber-500/30 shadow-sm'
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
      )}

      {/* TAB 2: MY ORDERS & TRANSACTIONS */}
      {activeTab === 'orders' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-6 h-6 text-sky-600 dark:text-cyan-400" />
                <span>My Orders & Enrolled Programs</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                View your enrolled passes, official verified payment receipts, and download invoices.
              </p>
            </div>

            <button
              type="button"
              onClick={loadUserPayments}
              disabled={loadingPayments}
              className="self-start sm:self-auto px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingPayments ? 'animate-spin text-sky-500' : ''}`} />
              <span>Refresh Records</span>
            </button>
          </div>

          {/* Active Enrolled Programs Section */}
          <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-slate-900/80 border-2 border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <PackageCheck className="w-4 h-4 text-emerald-500" />
                <span>Active Passes & Programs</span>
              </span>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                {verifiedPayments.length} Active {verifiedPayments.length === 1 ? 'Program' : 'Programs'}
              </span>
            </div>

            {verifiedPayments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {verifiedPayments.map((p) => {
                  const program = resolveProgramInfo(p);
                  const invoiceUrl = `/api/payment/preview-invoice?name=${encodeURIComponent(p.user_name || name || 'Student')}&email=${encodeURIComponent(p.user_email || profile.email || '')}&amount=${p.amount}&plan=${encodeURIComponent(program.title)}&paymentId=${encodeURIComponent(p.transaction_reference)}&orderId=${encodeURIComponent(p.transaction_reference)}`;

                  return (
                    <div 
                      key={p.id || p.transaction_reference}
                      className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-950/70 border-2 border-slate-200/90 dark:border-slate-800 flex flex-col justify-between space-y-4 shadow-sm"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold uppercase tracking-wide border ${program.badgeColor}`}>
                            {program.badge}
                          </span>
                          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            Verified Paid
                          </span>
                        </div>

                        <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                          {program.title}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                          {program.description}
                        </p>
                      </div>

                      <div className="space-y-3 pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
                        <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                          <span>Amount Paid: <strong className="text-slate-900 dark:text-white font-bold">₹{p.amount} {p.currency}</strong></span>
                          <span>{p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Active'}</span>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <a
                            href={invoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2 px-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs text-center flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                          >
                            <Download className="w-3.5 h-3.5 text-sky-500" />
                            <span>View Invoice</span>
                          </a>

                          {program.type === 'cohort' ? (
                            <Link
                              href="/curriculum"
                              className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs text-center flex items-center justify-center gap-1.5 shadow-md hover:brightness-110 transition-all"
                            >
                              <span>Curriculum</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          ) : (
                            <a
                              href={program.actionUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs text-center flex items-center justify-center gap-1.5 shadow-md transition-colors"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center space-y-3 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
                <Video className="w-10 h-10 text-slate-400 mx-auto" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">No Active Program Passes Yet</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                    When you enroll in the Live AI Webinar (₹19) or 4-Week Cohort (₹9,999), your active passes and access links will appear right here.
                  </p>
                </div>
                <Link
                  href="/#pricing"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-md transition-colors"
                >
                  <span>Explore Programs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Complete Transaction & Order History Table */}
          <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-slate-900/80 border-2 border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-sky-500" />
                <span>Complete Order & Transaction Ledger</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {payments.length} {payments.length === 1 ? 'Record' : 'Records'}
              </span>
            </div>

            {loadingPayments ? (
              <div className="py-8 text-center space-y-2">
                <RefreshCw className="w-6 h-6 text-sky-500 animate-spin mx-auto" />
                <p className="text-xs font-mono text-slate-500 dark:text-slate-400">Loading order records...</p>
              </div>
            ) : payments.length > 0 ? (
              <div className="space-y-3">
                {payments.map((p) => {
                  const program = resolveProgramInfo(p);
                  const isVerified = p.status === 'verified';
                  const isPending = p.status === 'pending';
                  const isRejected = p.status === 'rejected';
                  const invoiceUrl = `/api/payment/preview-invoice?name=${encodeURIComponent(p.user_name || name || 'Student')}&email=${encodeURIComponent(p.user_email || profile.email || '')}&amount=${p.amount}&plan=${encodeURIComponent(program.title)}&paymentId=${encodeURIComponent(p.transaction_reference)}&orderId=${encodeURIComponent(p.transaction_reference)}`;

                  return (
                    <div 
                      key={p.id || p.transaction_reference}
                      className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                    >
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                            {program.title}
                          </span>
                          
                          {isVerified ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-600 flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Verified Paid</span>
                            </span>
                          ) : isPending ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-600 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Pending Review</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-600">
                              Payment Declined
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 font-mono">
                          <span>Txn / Ref: <strong className="text-slate-800 dark:text-slate-200 font-bold">{p.transaction_reference}</strong></span>
                          <span>•</span>
                          <span>Method: <strong className="capitalize text-slate-700 dark:text-slate-300">{p.payment_method || 'Online'}</strong></span>
                          <span>•</span>
                          <span>Date: {p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200 dark:border-slate-800">
                        <div className="text-left md:text-right">
                          <span className="text-[10px] font-mono text-slate-400 block uppercase">Amount</span>
                          <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                            ₹{p.amount} <span className="text-xs text-slate-500">{p.currency}</span>
                          </span>
                        </div>

                        <a
                          href={invoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-sky-500" />
                          <span>Invoice</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center space-y-2">
                <Receipt className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No payment or order records registered under {profile.email || 'your account'}.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
