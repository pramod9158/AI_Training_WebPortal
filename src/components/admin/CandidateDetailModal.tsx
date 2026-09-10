'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Calendar, 
  Flame, 
  BookOpen, 
  Award, 
  CreditCard, 
  ShieldCheck, 
  AlertTriangle,
  Download,
  CheckCircle2,
  Clock,
  Ban,
  Check,
  Zap
} from 'lucide-react';
import { CandidateDetailRecord } from '@/lib/adminTypes';
import { 
  getCandidateDetails, 
  updateCandidatePlan, 
  updateCandidateStatus,
  sendReEngagementNudge 
} from '@/lib/adminService';

interface CandidateDetailModalProps {
  candidateId: string | null;
  onClose: () => void;
  onUpdated?: () => void;
}

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
  candidateId,
  onClose,
  onUpdated
}) => {
  const [candidate, setCandidate] = useState<CandidateDetailRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'modules' | 'quizzes' | 'payments'>('modules');
  const [isUpdating, setIsUpdating] = useState(false);
  const [nudgeToast, setNudgeToast] = useState<string | null>(null);

  const handleSendNudge = async (type: 're_engagement' | 'streak_warning') => {
    if (!candidate) return;
    setIsUpdating(true);
    try {
      const res = await sendReEngagementNudge(candidate.email, type);
      setNudgeToast(res.message);
      setTimeout(() => setNudgeToast(null), 4000);
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    if (!candidateId) {
      setCandidate(null);
      return;
    }

    setLoading(true);
    getCandidateDetails(candidateId)
      .then((data) => {
        setCandidate(data);
      })
      .finally(() => setLoading(false));
  }, [candidateId]);

  if (!candidateId) return null;

  const handlePlanChange = async (newPlan: 'free' | 'pro' | 'enterprise') => {
    if (!candidate) return;
    setIsUpdating(true);
    try {
      await updateCandidatePlan(candidate.id, newPlan);
      setCandidate({ ...candidate, plan: newPlan });
      if (onUpdated) onUpdated();
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusToggle = async () => {
    if (!candidate) return;
    const nextStatus = candidate.accountStatus === 'active' ? 'suspended' : 'active';
    setIsUpdating(true);
    try {
      await updateCandidateStatus(candidate.id, nextStatus);
      setCandidate({ ...candidate, accountStatus: nextStatus });
      if (onUpdated) onUpdated();
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExportTranscript = () => {
    if (!candidate) return;
    const transcript = {
      candidateId: candidate.id,
      displayName: candidate.displayName,
      email: candidate.email,
      plan: candidate.plan,
      accountStatus: candidate.accountStatus,
      progressPercent: `${candidate.progressPercent}%`,
      completedTopicsCount: candidate.completedTopicsCount,
      totalTopicsCount: candidate.totalTopicsCount,
      streakDays: candidate.streakDays,
      averageQuizScore: `${candidate.averageQuizScore}%`,
      moduleBreakdown: candidate.moduleProgress,
      quizAudit: candidate.quizAttempts,
      payments: candidate.payments,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(transcript, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript_${candidate.displayName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm p-2.5 sm:p-4 flex items-center justify-center min-h-screen">
      <div 
        className="relative my-auto w-full max-w-4xl bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[calc(100dvh-2rem)] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 p-[2px]">
              <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-sm font-black text-sky-600 dark:text-cyan-400">
                {candidate?.displayName?.charAt(0).toUpperCase() || <User className="w-5 h-5" />}
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
                  {loading ? 'Loading Dossier...' : candidate?.displayName}
                </h3>
                {candidate && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    candidate.plan === 'pro'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      : candidate.plan === 'enterprise'
                      ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                      : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20'
                  }`}>
                    {candidate.plan}
                  </span>
                )}
                {candidate?.accountStatus === 'suspended' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20">
                    Suspended
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {candidate?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportTranscript}
              disabled={loading || !candidate}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors disabled:opacity-50"
              title="Download Full Transcript JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Dossier</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {loading || !candidate ? (
          <div className="p-12 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-400">Fetching candidate metrics & audit logs...</p>
          </div>
        ) : (
          <div className="overflow-y-auto p-6 space-y-6 flex-1">
            {/* Top Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Overall Progress
                </span>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {candidate.progressPercent}%
                  </span>
                  <span className="text-xs text-slate-500">
                    ({candidate.completedTopicsCount}/{candidate.totalTopicsCount})
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-sky-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${candidate.progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Avg Quiz Score
                </span>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {candidate.averageQuizScore}%
                  </span>
                  <span className="text-xs text-slate-500">
                    ({candidate.quizzesAttempted} Quizzes)
                  </span>
                </div>
                <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 mt-2">
                  <CheckCircle2 className="w-3 h-3" /> Passing Standard
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Active Learning Streak
                </span>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-xl sm:text-2xl font-black text-amber-500 flex items-center gap-1">
                    <Flame className="w-5 h-5 fill-amber-500" />
                    {candidate.streakDays}
                  </span>
                  <span className="text-xs text-slate-500">Days</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-2 truncate">
                  Active: {new Date(candidate.lastActiveAt).toLocaleDateString()}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Total Investment
                </span>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    ₹{candidate.totalSpent}
                  </span>
                  <span className="text-xs text-slate-500">INR</span>
                </div>
                <span className="text-[10px] text-indigo-400 font-bold block mt-2">
                  {candidate.paymentCount} Verified Transactions
                </span>
              </div>
            </div>

            {/* Admin Controls Toolbar */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Administrative Override Controls:
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="inline-flex rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-1 text-xs">
                    <button
                      disabled={isUpdating}
                      onClick={() => handlePlanChange('free')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                        candidate.plan === 'free' ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Free Tier
                    </button>
                    <button
                      disabled={isUpdating}
                      onClick={() => handlePlanChange('pro')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                        candidate.plan === 'pro' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Grant Pro
                    </button>
                    <button
                      disabled={isUpdating}
                      onClick={() => handlePlanChange('enterprise')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                        candidate.plan === 'enterprise' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Enterprise
                    </button>
                  </div>

                  <button
                    disabled={isUpdating}
                    onClick={handleStatusToggle}
                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      candidate.accountStatus === 'active'
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 border border-rose-200 dark:border-rose-900/40'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-900/40'
                    }`}
                  >
                    {candidate.accountStatus === 'active' ? (
                      <>
                        <Ban className="w-3.5 h-3.5" />
                        <span>Suspend</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Reactivate</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Re-engagement Nudge Dispatcher */}
              <div className="pt-2 border-t border-indigo-200/50 dark:border-indigo-900/40 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-mono font-bold text-indigo-700 dark:text-indigo-300">
                  Re-engagement & Streak Nudges:
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    disabled={isUpdating}
                    onClick={() => handleSendNudge('streak_warning')}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold shadow-sm transition-all flex items-center space-x-1.5"
                  >
                    <Flame className="w-3.5 h-3.5 fill-white" />
                    <span>Send Streak Nudge</span>
                  </button>

                  <button
                    disabled={isUpdating}
                    onClick={() => handleSendNudge('re_engagement')}
                    className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-extrabold shadow-sm transition-all flex items-center space-x-1.5"
                  >
                    <Mail className="w-3.5 h-3.5 text-white" />
                    <span>Send Re-engagement Email</span>
                  </button>
                </div>
              </div>

              {nudgeToast && (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 text-xs font-bold text-emerald-800 dark:text-emerald-200 animate-in fade-in">
                  ✓ {nudgeToast}
                </div>
              )}
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-6 text-xs font-bold">
              <button
                onClick={() => setActiveTab('modules')}
                className={`pb-3 border-b-2 transition-all flex items-center space-x-1.5 ${
                  activeTab === 'modules'
                    ? 'border-sky-500 text-sky-600 dark:text-cyan-400'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Curriculum Modules ({candidate.moduleProgress.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('quizzes')}
                className={`pb-3 border-b-2 transition-all flex items-center space-x-1.5 ${
                  activeTab === 'quizzes'
                    ? 'border-sky-500 text-sky-600 dark:text-cyan-400'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Quiz Scores ({candidate.quizAttempts.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`pb-3 border-b-2 transition-all flex items-center space-x-1.5 ${
                  activeTab === 'payments'
                    ? 'border-sky-500 text-sky-600 dark:text-cyan-400'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Payment Records ({candidate.payments.length})</span>
              </button>
            </div>

            {/* Tab 1: Modules Breakdown */}
            {activeTab === 'modules' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {candidate.moduleProgress.map((mod, index) => (
                    <div 
                      key={mod.moduleSlug}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between"
                    >
                      <div className="space-y-1 pr-3 flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono text-slate-400 font-bold">M{index + 1}</span>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {mod.title}
                          </h4>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              mod.progressPercent === 100
                                ? 'bg-emerald-500'
                                : mod.progressPercent > 0
                                ? 'bg-sky-500'
                                : 'bg-transparent'
                            }`}
                            style={{ width: `${mod.progressPercent}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {mod.progressPercent}%
                        </span>
                        <p className="text-[10px] text-slate-400">
                          {mod.completedTopics}/{mod.totalTopics}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 2: Quizzes */}
            {activeTab === 'quizzes' && (
              <div className="space-y-2 animate-in fade-in duration-150">
                {candidate.quizAttempts.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No quizzes recorded for this candidate yet.
                  </div>
                ) : (
                  candidate.quizAttempts.map((q) => (
                    <div 
                      key={q.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {q.topicTitle}
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Attempted: {new Date(q.attemptedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                          q.percentage >= 80 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        }`}>
                          {q.percentage}% ({q.score}/{q.totalQuestions})
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 3: Payments */}
            {activeTab === 'payments' && (
              <div className="space-y-2 animate-in fade-in duration-150">
                {candidate.payments.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No payment records found for this candidate.
                  </div>
                ) : (
                  candidate.payments.map((p) => (
                    <div 
                      key={p.id}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-black text-slate-900 dark:text-white">
                            {p.transactionReference}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            p.status === 'verified'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : p.status === 'pending'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          }`}>
                            {p.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Method: <strong>{p.paymentMethod}</strong> • Date: {new Date(p.createdAt).toLocaleDateString()}
                        </p>
                        {p.notes && (
                          <p className="text-[10px] text-slate-500 italic">
                            {p.notes}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          ₹{p.amount} {p.currency}
                        </span>
                        <p className="text-[10px] text-slate-400">
                          {p.planGranted.toUpperCase()} Plan
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
