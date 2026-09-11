'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Users, 
  CreditCard, 
  QrCode, 
  TrendingUp, 
  Award, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Search, 
  Filter, 
  Download, 
  PlusCircle, 
  ExternalLink, 
  LogOut, 
  Settings, 
  ShieldCheck, 
  Flame, 
  ChevronRight, 
  Copy, 
  Check, 
  Eye, 
  BookOpen, 
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  Sun,
  Moon,
  Edit,
  HelpCircle,
  Plus,
  FileCode,
  RotateCcw,
  Lock
} from 'lucide-react';
import { 
  CandidateRecord, 
  PaymentRecord, 
  BarcodePaymentConfig, 
  AdminMetrics
} from '@/lib/adminTypes';
import { MODULES, Topic } from '@/data/seedModules';
import { getAllTopics, resetCurriculumToDefault, fetchCurriculumUpdates } from '@/lib/curriculumService';
import { 
  isAdminAuthenticated, 
  clearAdminSession, 
  getAdminMetrics, 
  getCandidates, 
  getPayments, 
  getBarcodeConfig, 
  saveBarcodeConfig, 
  approvePayment, 
  exportCandidatesToCSV, 
  exportPaymentsToCSV,
  updateCandidatePlan
} from '@/lib/adminService';
import { CandidateDetailModal } from '@/components/admin/CandidateDetailModal';
import { PaymentActionModal } from '@/components/admin/PaymentActionModal';
import { ManualPaymentModal } from '@/components/admin/ManualPaymentModal';
import { TopicEditorModal } from '@/components/admin/TopicEditorModal';
import { QuizEditorModal } from '@/components/admin/QuizEditorModal';
import { useWaynauticStore } from '@/lib/store';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { profile } = useWaynauticStore();

  // Auth verification
  const [authChecked, setAuthChecked] = useState(false);

  // Tab State: 'overview' | 'candidates' | 'payments' | 'curriculum' | 'settings'
  const [activeTab, setActiveTab] = useState<'overview' | 'candidates' | 'payments' | 'curriculum' | 'settings'>('overview');

  // Data States
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [candidates, setCandidates] = useState<CandidateRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [barcodeConfig, setBarcodeConfig] = useState<BarcodePaymentConfig>(getBarcodeConfig());
  const [loading, setLoading] = useState(true);

  // Curriculum Management States
  const [allTopics, setAllTopics] = useState<Topic[]>([]);
  const [topicModuleFilter, setTopicModuleFilter] = useState('all');
  const [topicSearch, setTopicSearch] = useState('');
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [topicModalOpen, setTopicModalOpen] = useState(false);
  const [quizModalTopic, setQuizModalTopic] = useState<{ id: string; title: string } | null>(null);

  // Candidate Filters
  const [candSearch, setCandSearch] = useState('');
  const [candPlanFilter, setCandPlanFilter] = useState('all');
  const [candStatusFilter, setCandStatusFilter] = useState('all');

  // Payment Filters
  const [paySearch, setPaySearch] = useState('');
  const [payStatusFilter, setPayStatusFilter] = useState('all');

  // Modal States
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [manualPaymentOpen, setManualPaymentOpen] = useState(false);

  // Notification / Toast
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Strict Auth Guard: completely block candidate students from admin portal
  useEffect(() => {
    const verifyAdmin = async () => {
      // 1. If currently logged in as a candidate in student profile, deny immediately
      if (profile.userId && profile.role === 'candidate') {
        clearAdminSession();
        router.replace('/admin/login');
        return;
      }

      // 2. Must hold active admin passkey session
      if (!isAdminAuthenticated()) {
        router.replace('/admin/login');
        return;
      }

      // 3. If Supabase session is active, verify user role in user_profiles
      if (isSupabaseConfigured) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data: prof } = await supabase
              .from('user_profiles')
              .select('role')
              .eq('id', session.user.id)
              .single();

            if (prof && prof.role === 'candidate') {
              clearAdminSession();
              router.replace('/admin/login');
              return;
            }
          }
        } catch {
          // Fall back to passkey verification
        }
      }

      setAuthChecked(true);
    };

    verifyAdmin();
  }, [router, profile.userId, profile.role]);

  // Load all platform data
  const loadPlatformData = async () => {
    setLoading(true);
    try {
      const [m, c, p, b] = await Promise.all([
        getAdminMetrics(),
        getCandidates(),
        getPayments(),
        getBarcodeConfig()
      ]);
      setMetrics(m);
      setCandidates(c);
      setPayments(p);
      setBarcodeConfig(b);
      setAllTopics(getAllTopics());
      fetchCurriculumUpdates().then((fresh) => setAllTopics(fresh));
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authChecked) {
      loadPlatformData();
    }
  }, [authChecked]);

  useEffect(() => {
    const handleCurriculumChange = () => {
      setAllTopics(getAllTopics());
    };
    window.addEventListener('waynautic_curriculum_changed', handleCurriculumChange);
    return () => window.removeEventListener('waynautic_curriculum_changed', handleCurriculumChange);
  }, []);

  const handleLogout = () => {
    clearAdminSession();
    router.push('/admin/login');
  };

  // Filtered Candidates
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const matchesSearch = candSearch === '' || 
        c.displayName.toLowerCase().includes(candSearch.toLowerCase()) ||
        c.email.toLowerCase().includes(candSearch.toLowerCase());
      const matchesPlan = candPlanFilter === 'all' || c.plan === candPlanFilter;
      const matchesStatus = candStatusFilter === 'all' || c.accountStatus === candStatusFilter;
      return matchesSearch && matchesPlan && matchesStatus;
    });
  }, [candidates, candSearch, candPlanFilter, candStatusFilter]);

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchesSearch = paySearch === '' ||
        p.transactionReference.toLowerCase().includes(paySearch.toLowerCase()) ||
        p.userEmail.toLowerCase().includes(paySearch.toLowerCase()) ||
        (p.userName && p.userName.toLowerCase().includes(paySearch.toLowerCase()));
      const matchesStatus = payStatusFilter === 'all' || p.status === payStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [payments, paySearch, payStatusFilter]);

  // Filtered Topics for Curriculum Tab
  const filteredTopics = useMemo(() => {
    let list = allTopics;
    if (topicModuleFilter !== 'all') {
      list = list.filter((t) => t.moduleSlug === topicModuleFilter);
    }
    if (topicSearch.trim()) {
      const q = topicSearch.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.slug.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allTopics, topicModuleFilter, topicSearch]);

  // Pending Payments Queue
  const pendingPayments = useMemo(() => {
    return payments.filter((p) => p.status === 'pending');
  }, [payments]);

  // Handle Quick Approve from row
  const handleQuickApprove = async (paymentId: string) => {
    const res = await approvePayment(paymentId, 'Quick 1-Click Verification');
    if (res.success) {
      showNotice('Payment approved & candidate upgraded to Pro!');
      loadPlatformData();
    }
  };

  if (!authChecked) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#080C14] text-slate-900 dark:text-slate-100 font-sans">
      
      {/* Toast Notice */}
      {actionNotice && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-2xl bg-emerald-600 text-white text-xs font-bold shadow-2xl shadow-emerald-600/30 flex items-center space-x-2 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Top Administrative Header */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#0D121F]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand & Console Title */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link href="/admin" className="flex items-center space-x-2 group">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white shadow-md shadow-indigo-600/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center space-x-1.5">
                  <span className="font-black text-sm tracking-tight text-slate-900 dark:text-white">
                    Waynautic
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    Admin
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-none">
                  Candidate & Payment Operations
                </p>
              </div>
            </Link>

            {/* Pending Verifications Badge Chip */}
            {pendingPayments.length > 0 && (
              <button
                onClick={() => {
                  setActiveTab('payments');
                  setPayStatusFilter('pending');
                }}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/20 transition-colors animate-pulse"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{pendingPayments.length} Pending Review</span>
              </button>
            )}
          </div>

          {/* Right Header Navigation & Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={loadPlatformData}
              disabled={loading}
              className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-500' : ''}`} />
            </button>

            <Link
              href="/curriculum"
              className="hidden md:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
              target="_blank"
            >
              <span>Academy Portal</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 text-xs font-bold transition-colors"
              title="End Admin Session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 sm:space-x-4 overflow-x-auto border-t border-slate-200/80 dark:border-slate-800/80 scrollbar-none text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-2 sm:px-3 border-b-2 flex items-center space-x-2 transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Overview & KPIs</span>
          </button>

          <button
            onClick={() => setActiveTab('candidates')}
            className={`py-3 px-2 sm:px-3 border-b-2 flex items-center space-x-2 transition-all whitespace-nowrap ${
              activeTab === 'candidates'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Candidates Directory ({candidates.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`py-3 px-2 sm:px-3 border-b-2 flex items-center space-x-2 transition-all whitespace-nowrap ${
              activeTab === 'payments'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Barcode Payments ({payments.length})</span>
            {pendingPayments.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('curriculum')}
            className={`py-3 px-2 sm:px-3 border-b-2 flex items-center space-x-2 transition-all whitespace-nowrap ${
              activeTab === 'curriculum'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Curriculum & Quizzes ({allTopics.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-2 sm:px-3 border-b-2 flex items-center space-x-2 transition-all whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Lock className="w-4 h-4 text-amber-500" />
            <span>Barcode & UPI Status</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* -------------------------------------------------------------------
         * TAB 1: OVERVIEW & KPIS
         * -----------------------------------------------------------------*/}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Top KPI Cards Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              
              {/* Total Candidates */}
              <div className="p-4 rounded-3xl bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Total Candidates
                  </span>
                  <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-500">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {metrics?.totalCandidates ?? candidates.length}
                </div>
                <p className="text-[11px] text-slate-500">
                  Registered learners
                </p>
              </div>

              {/* Active Today */}
              <div className="p-4 rounded-3xl bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Active Learners
                  </span>
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                    <Flame className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-500">
                  {metrics?.activeToday ?? 0}
                </div>
                <p className="text-[11px] text-slate-500">
                  Active within 24h
                </p>
              </div>

              {/* Pro Students */}
              <div className="p-4 rounded-3xl bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Pro Learners
                  </span>
                  <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-purple-500">
                  {metrics?.proCandidates ?? 0}
                </div>
                <p className="text-[11px] text-slate-500">
                  Verified Pro Passes
                </p>
              </div>

              {/* Total Revenue */}
              <div className="p-4 rounded-3xl bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Revenue (INR)
                  </span>
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <CreditCard className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-500">
                  ₹{metrics?.totalRevenue ?? 0}
                </div>
                <p className="text-[11px] text-slate-500">
                  Verified Barcode/UPI
                </p>
              </div>

              {/* Pending Verifications */}
              <div className="p-4 rounded-3xl bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Pending Review
                  </span>
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-500">
                  {metrics?.pendingVerifications ?? pendingPayments.length}
                </div>
                <p className="text-[11px] text-slate-500">
                  Awaiting Approval
                </p>
              </div>

              {/* Avg Quiz Score */}
              <div className="p-4 rounded-3xl bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Avg Quiz Score
                  </span>
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-indigo-500">
                  {metrics?.overallQuizPassRate ?? 89}%
                </div>
                <p className="text-[11px] text-slate-500">
                  Passing mastery
                </p>
              </div>

            </div>

            {/* Middle Grid: Pending Verifications Queue & Live Barcode Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Pending Verifications Action Card (Left 8 Cols) */}
              <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-amber-500" />
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      Pending Barcode / UPI Verifications
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-black bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      {pendingPayments.length}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('payments');
                      setPayStatusFilter('pending');
                    }}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
                  >
                    <span>View All Payments</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {pendingPayments.length === 0 ? (
                  <div className="py-10 text-center space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      All payment submissions are verified!
                    </p>
                    <p className="text-xs text-slate-500">
                      No candidate submissions are currently waiting in the verification queue.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {pendingPayments.slice(0, 3).map((p) => (
                      <div
                        key={p.id}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-black text-indigo-600 dark:text-cyan-400">
                              {p.transactionReference}
                            </span>
                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              • ₹{p.amount} {p.currency}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            Candidate: <strong>{p.userName || p.userEmail.split('@')[0]}</strong> ({p.userEmail})
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Submitted {new Date(p.createdAt).toLocaleDateString()} at {new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2 w-full sm:w-auto">
                          <button
                            onClick={() => setSelectedPayment(p)}
                            className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                          >
                            Review / Decline
                          </button>
                          <button
                            onClick={() => handleQuickApprove(p.id)}
                            className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-colors"
                          >
                            Approve
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Live Active Barcode Card (Right 4 Cols) */}
              <div className="lg:col-span-4 p-6 rounded-3xl bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-950/30 dark:to-[#0D121F] border border-indigo-200 dark:border-indigo-900/50 shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center space-x-1.5">
                      <QrCode className="w-4 h-4" />
                      <span>Live Barcode / UPI</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      Active
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {barcodeConfig.title}
                  </h4>
                  {barcodeConfig.qrImageUrl && (
                    <div className="my-3 mx-auto w-32 h-32 bg-white p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center">
                      <img 
                        src={barcodeConfig.qrImageUrl} 
                        alt="Active Barcode QR" 
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-contain rounded-lg"
                      />
                    </div>
                  )}
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    UPI ID: <strong className="font-mono text-slate-700 dark:text-slate-300">{barcodeConfig.upiId}</strong>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Amount: <strong>₹{barcodeConfig.amount} {barcodeConfig.currency}</strong>
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs shadow-sm transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-500" />
                    <span>View Gateway Status</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Bottom Grid: Recent Signups & Progress Overview */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-sky-500" />
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Recent Candidate Signups & Performance
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('candidates')}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
                >
                  <span>Open Full Directory</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {candidates.length === 0 ? (
                <div className="py-8 text-center space-y-1">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    No registered candidate accounts found in Supabase yet.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Real-time cloud synchronization active. New registrations will automatically appear here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {candidates.slice(0, 6).map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCandidateId(c.id)}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 hover:border-indigo-500 transition-all cursor-pointer group space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-xs font-black text-white">
                            {c.displayName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors truncate max-w-[140px]">
                              {c.displayName}
                            </h4>
                            <span className="text-[10px] text-slate-400 truncate block max-w-[140px]">
                              {c.email}
                            </span>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          c.plan === 'pro'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'bg-slate-500/10 text-slate-500'
                        }`}>
                          {c.plan}
                        </span>
                      </div>

                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-400">Progress:</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            {c.progressPercent}% ({c.completedTopicsCount} Topics)
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                          <div
                            className="bg-sky-500 h-full rounded-full"
                            style={{ width: `${c.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* -------------------------------------------------------------------
         * TAB 2: CANDIDATES DIRECTORY
         * -----------------------------------------------------------------*/}
        {activeTab === 'candidates' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            
            {/* Action & Filter Toolbar */}
            <div className="p-4 rounded-3xl bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
              
              {/* Search Bar */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={candSearch}
                  onChange={(e) => setCandSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Filters & Export */}
              <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto">
                <select
                  value={candPlanFilter}
                  onChange={(e) => setCandPlanFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  <option value="all">All Plans</option>
                  <option value="free">Free Tier</option>
                  <option value="pro">Pro AI Pass</option>
                  <option value="enterprise">Enterprise</option>
                </select>

                <select
                  value={candStatusFilter}
                  onChange={(e) => setCandStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="suspended">Suspended Only</option>
                </select>

                <button
                  onClick={() => exportCandidatesToCSV(filteredCandidates)}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition-colors shrink-0"
                  title="Export Candidates to CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Candidates Table */}
            <div className="rounded-3xl bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Candidate</th>
                      <th className="py-3.5 px-4">Plan & Status</th>
                      <th className="py-3.5 px-4">Curriculum Progress</th>
                      <th className="py-3.5 px-4">Quiz Score</th>
                      <th className="py-3.5 px-4">Streak</th>
                      <th className="py-3.5 px-4">Joined Date</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                    {filteredCandidates.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          No candidate records found matching your filters.
                        </td>
                      </tr>
                    ) : (
                      filteredCandidates.map((c) => (
                        <tr 
                          key={c.id} 
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors"
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-2.5">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-black text-xs shrink-0">
                                {c.displayName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 dark:text-white block">
                                  {c.displayName}
                                </span>
                                <span className="font-mono text-[11px] text-slate-400">
                                  {c.email}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex flex-col space-y-1">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider w-fit ${
                                c.plan === 'pro'
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                  : c.plan === 'enterprise'
                                  ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                                  : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20'
                              }`}>
                                {c.plan}
                              </span>
                              {c.accountStatus === 'suspended' && (
                                <span className="text-[10px] text-rose-500 font-bold">
                                  Suspended
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 min-w-[140px]">
                            <div className="space-y-1">
                              <div className="flex justify-between text-[11px]">
                                <span className="font-bold text-slate-900 dark:text-white">{c.progressPercent}%</span>
                                <span className="text-slate-400">{c.completedTopicsCount}/{c.totalTopicsCount}</span>
                              </div>
                              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    c.progressPercent === 100 ? 'bg-emerald-500' : 'bg-sky-500'
                                  }`}
                                  style={{ width: `${c.progressPercent}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-mono font-bold">
                            {c.quizzesAttempted > 0 ? (
                              <span className="text-slate-900 dark:text-white">
                                {c.averageQuizScore}% <span className="text-[10px] text-slate-400 font-sans">({c.quizzesAttempted}Q)</span>
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">No attempts</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 font-mono font-bold">
                            <span className="inline-flex items-center space-x-1 text-amber-500">
                              <Flame className="w-3.5 h-3.5 fill-amber-500" />
                              <span>{c.streakDays}d</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setSelectedCandidateId(c.id)}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition-colors"
                            >
                              Dossier
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* -------------------------------------------------------------------
         * TAB 3: BARCODE PAYMENTS HUB
         * -----------------------------------------------------------------*/}
        {activeTab === 'payments' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            
            {/* Toolbar */}
            <div className="p-4 rounded-3xl bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
              
              {/* Search */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={paySearch}
                  onChange={(e) => setPaySearch(e.target.value)}
                  placeholder="Search by UTR or email..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Status Filter & Actions */}
              <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto">
                <select
                  value={payStatusFilter}
                  onChange={(e) => setPayStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending Only</option>
                  <option value="verified">Verified Only</option>
                  <option value="rejected">Rejected Only</option>
                </select>

                <button
                  onClick={() => setManualPaymentOpen(true)}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-colors shrink-0"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Manual Payment</span>
                </button>

                <button
                  onClick={() => exportPaymentsToCSV(filteredPayments)}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition-colors shrink-0"
                  title="Export Payments Ledger CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Payments Ledger Table */}
            <div className="rounded-3xl bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Transaction Ref (UTR)</th>
                      <th className="py-3.5 px-4">Candidate</th>
                      <th className="py-3.5 px-4">Amount</th>
                      <th className="py-3.5 px-4">Channel</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                    {filteredPayments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          No transaction records found matching your filters.
                        </td>
                      </tr>
                    ) : (
                      filteredPayments.map((p) => (
                        <tr 
                          key={p.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors"
                        >
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                            {p.transactionReference}
                          </td>

                          <td className="py-3.5 px-4">
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white block">
                                {p.userName || 'Learner'}
                              </span>
                              <span className="font-mono text-[11px] text-slate-400">
                                {p.userEmail}
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">
                            ₹{p.amount} <span className="text-[10px] text-slate-400 uppercase">{p.currency}</span>
                          </td>

                          <td className="py-3.5 px-4 font-bold uppercase text-[11px] text-slate-500">
                            {p.paymentMethod}
                          </td>

                          <td className="py-3.5 px-4">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              p.status === 'verified'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                : p.status === 'pending'
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            }`}>
                              {p.status}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                            {new Date(p.createdAt).toLocaleDateString()}
                          </td>

                          <td className="py-3.5 px-4 text-right space-x-2">
                            {p.status === 'pending' && (
                              <button
                                onClick={() => handleQuickApprove(p.id)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-colors"
                              >
                                Approve
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedPayment(p)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition-colors cursor-pointer"
                            >
                              {p.status === 'pending' ? 'Review / Decline' : 'Details'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* -------------------------------------------------------------------
         * TAB 4: CURRICULUM & QUIZZES MANAGEMENT
         * -----------------------------------------------------------------*/}
        {activeTab === 'curriculum' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Header Controls */}
            <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <span>Curriculum & Topics Content Management</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Add new lessons, modify video URLs and markdown notes, or update quiz questions in real time.
                  </p>
                </div>

                <div className="flex items-center space-x-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTopic(null);
                      setTopicModalOpen(true);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Topic</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const confirm = window.confirm('Reset all curriculum topics and quizzes back to original platform seed data?');
                      if (confirm) {
                        resetCurriculumToDefault();
                        setAllTopics(getAllTopics());
                        showNotice('Curriculum reset to default seed data.');
                      }
                    }}
                    className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Reset to Platform Seed Data"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={topicSearch}
                    onChange={(e) => setTopicSearch(e.target.value)}
                    placeholder="Search by topic title, slug, or summary..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <span className="text-xs text-slate-400 font-medium hidden sm:inline whitespace-nowrap">Module:</span>
                  <select
                    value={topicModuleFilter}
                    onChange={(e) => setTopicModuleFilter(e.target.value)}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-white font-bold focus:outline-none focus:border-indigo-500 w-full sm:w-auto"
                  >
                    <option value="all">All 10 Modules</option>
                    {MODULES.map((m) => (
                      <option key={m.slug} value={m.slug}>
                        Module {m.orderIndex}: {m.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Topics Directory Table / Grid */}
            <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-500">
                <span>Showing {filteredTopics.length} of {allTopics.length} Total Topics</span>
              </div>

              {filteredTopics.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No topics match your current filters. Try adjusting search or select &quot;All 10 Modules&quot;.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-mono tracking-wider text-[10px]">
                        <th className="pb-3 pl-2">#</th>
                        <th className="pb-3">Module</th>
                        <th className="pb-3">Topic Title & Slug</th>
                        <th className="pb-3">Duration</th>
                        <th className="pb-3 text-right pr-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {filteredTopics.map((t, idx) => {
                        const mod = MODULES.find((m) => m.slug === t.moduleSlug);
                        return (
                          <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors group">
                            <td className="py-3.5 pl-2 font-mono text-slate-400 font-bold">{idx + 1}</td>
                            <td className="py-3.5">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 whitespace-nowrap">
                                {mod?.title || t.moduleSlug}
                              </span>
                            </td>
                            <td className="py-3.5">
                              <div className="font-extrabold text-slate-900 dark:text-white max-w-xs truncate">
                                {t.title}
                              </div>
                              <div className="font-mono text-[11px] text-slate-400 truncate max-w-xs">
                                /{t.moduleSlug}/{t.slug}
                              </div>
                            </td>
                            <td className="py-3.5 whitespace-nowrap">
                              <span className="flex items-center space-x-1 text-slate-600 dark:text-slate-300">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span>{t.estimatedMinutes} mins</span>
                              </span>
                            </td>
                            <td className="py-3.5 pr-2 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end space-x-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingTopic(t);
                                    setTopicModalOpen(true);
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[11px] flex items-center space-x-1 transition-colors"
                                >
                                  <Edit className="w-3 h-3" />
                                  <span>Edit</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setQuizModalTopic({ id: t.id, title: t.title })}
                                  className="px-2.5 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 text-purple-700 dark:text-purple-300 font-bold text-[11px] flex items-center space-x-1 transition-colors border border-purple-200 dark:border-purple-800"
                                >
                                  <HelpCircle className="w-3 h-3" />
                                  <span>Quiz</span>
                                </button>

                                <Link
                                  href={`/curriculum/${t.moduleSlug}/${t.slug}`}
                                  target="_blank"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                  title="Open Lesson in Academy"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* -------------------------------------------------------------------
         * TAB 5: BARCODE & UPI STATUS (CODE-CONTROLLED POLICY)
         * -----------------------------------------------------------------*/}
        {activeTab === 'settings' && (
          <div className="max-w-4xl space-y-6 animate-in fade-in duration-200">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                      <span>Payment Gateway (Code-Controlled)</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Strict policy: UPI and Barcode parameters are managed exclusively via project files.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center space-x-1">
                    <Lock className="w-3 h-3" />
                    <span>UI Editing Disabled</span>
                  </span>
                </div>
              </div>

              {/* Security Policy Alert Banner */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 flex items-start space-x-3">
                <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1 text-indigo-950 dark:text-indigo-200 leading-relaxed">
                  <p className="font-extrabold">Permanent Code-Only Security Enforcement</p>
                  <p>
                    By platform security design, payment credentials cannot be altered through this admin interface. To update the UPI ID, payee name, course fee, or QR code image in the future, edit the files directly in your repository:
                  </p>
                  <div className="pt-1 font-mono text-[11px] text-indigo-700 dark:text-indigo-300 space-y-0.5">
                    <div>• Config file: <strong>src/config/payment/upiConfig.ts</strong></div>
                    <div>• Barcode image: <strong>src/config/payment/qr-code.jpg</strong></div>
                  </div>
                </div>
              </div>

              {/* Read-Only Parameters Display */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start pt-2">
                
                {/* Left 7 Cols: Details */}
                <div className="md:col-span-7 space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Active UPI ID (Virtual Payment Address)
                      </span>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        <span>{barcodeConfig.upiId}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(barcodeConfig.upiId);
                            alert('UPI ID copied to clipboard!');
                          }}
                          className="px-2.5 py-1 text-[11px] font-sans font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Payee Merchant Name
                        </span>
                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {barcodeConfig.payeeName}
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Course Fee / Tier
                        </span>
                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{barcodeConfig.amount} {barcodeConfig.currency}
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Pass Title
                      </span>
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200">
                        {barcodeConfig.title}
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Payment Instructions
                      </span>
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {barcodeConfig.description}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right 5 Cols: Barcode Image */}
                <div className="md:col-span-5 flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center space-y-3">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Active QR Code Barcode
                  </span>
                  <div className="w-44 h-44 bg-white p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center overflow-hidden">
                    {barcodeConfig.qrImageUrl ? (
                      <img 
                        src={barcodeConfig.qrImageUrl} 
                        alt="Active Barcode QR" 
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-contain rounded-xl"
                      />
                    ) : (
                      <QrCode className="w-20 h-20 text-slate-400" />
                    )}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    Asset: <strong>src/config/payment/qr-code.jpg</strong>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

      </main>

      {/* Candidate Detail Modal */}
      <CandidateDetailModal
        candidateId={selectedCandidateId}
        onClose={() => setSelectedCandidateId(null)}
        onUpdated={loadPlatformData}
      />

      {/* Payment Action Modal */}
      <PaymentActionModal
        payment={selectedPayment}
        onClose={() => setSelectedPayment(null)}
        onSuccess={loadPlatformData}
      />

      {/* Manual Payment Entry Modal */}
      <ManualPaymentModal
        isOpen={manualPaymentOpen}
        onClose={() => setManualPaymentOpen(false)}
        onSuccess={loadPlatformData}
      />

      {/* Curriculum Topic Editor Modal */}
      <TopicEditorModal
        isOpen={topicModalOpen}
        onClose={() => {
          setTopicModalOpen(false);
          setEditingTopic(null);
        }}
        topic={editingTopic}
        defaultModuleSlug={topicModuleFilter !== 'all' ? topicModuleFilter : 'llms'}
        onSaved={() => {
          showNotice('Curriculum topic saved successfully!');
          setAllTopics(getAllTopics());
        }}
        onDeleted={() => {
          showNotice('Topic removed from active curriculum.');
          setAllTopics(getAllTopics());
        }}
      />

      {/* Topic Quiz Editor Modal */}
      <QuizEditorModal
        isOpen={Boolean(quizModalTopic)}
        onClose={() => setQuizModalTopic(null)}
        topicId={quizModalTopic?.id || ''}
        topicTitle={quizModalTopic?.title || ''}
        onSaved={() => {
          showNotice('Quiz questions updated successfully!');
          setAllTopics(getAllTopics());
        }}
      />

    </div>
  );
}
