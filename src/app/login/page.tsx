'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, ShieldCheck, Eye, EyeOff, CheckCircle2, ArrowLeft, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { signInWithEmail, sendPasswordResetEmail, resendVerificationEmail, checkUserAccountExists } from '@/lib/supabaseAuth';
import { fetchAndSyncCloudUser, useWaynauticStore } from '@/lib/store';
import { clearAdminSession } from '@/lib/adminService';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');
  const isVerified = searchParams.get('verified') === 'true';
  const emailParam = searchParams.get('email') || '';

  const { updateProfile } = useWaynauticStore();
  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Unconfirmed email resend state
  const [isUnconfirmedEmail, setIsUnconfirmedEmail] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sent' | 'error'>('idle');
  const [resendMsg, setResendMsg] = useState('');
  const [countdown, setCountdown] = useState(0);

  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendFromLogin = async () => {
    if (!email || countdown > 0 || resendLoading) return;
    setResendLoading(true);
    setResendStatus('idle');
    setResendMsg('');

    const { error } = await resendVerificationEmail(email);
    setResendLoading(false);

    if (error) {
      setResendStatus('error');
      if (error.message.toLowerCase().includes('rate limit')) {
        setResendMsg('Rate limit reached: Please wait 1-2 minutes before retrying.');
      } else {
        setResendMsg(error.message);
      }
    } else {
      setResendStatus('sent');
      setResendMsg(`Verification link resent to ${email}! Please check your Inbox and Spam/Junk folder.`);
      setCountdown(60);
    }
  };

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');
  const [showUserNotFoundModal, setShowUserNotFoundModal] = useState(false);

  // If user lands on login with recovery parameters (from previous link or default Supabase redirect),
  // automatically forward them to /reset-password with all tokens preserved.
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const params = new URLSearchParams(window.location.search);
      if (hash.includes('type=recovery') || params.get('type') === 'recovery' || params.get('code')) {
        router.replace(`/reset-password${window.location.search}${window.location.hash}`);
      }
    }
  }, [router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // Purge any stale admin console session when logging in as student
      clearAdminSession();

      const { data, error } = await signInWithEmail(email, password);

      if (error) {
        if (error.message.toLowerCase().includes('email not confirmed')) {
          setIsUnconfirmedEmail(true);
          setErrorMsg('Your email address has not been verified yet. Please check your inbox (including Spam/Junk), or use the button below to resend the verification link.');
        } else {
          setIsUnconfirmedEmail(false);
          setErrorMsg(error.message);
        }
        setLoading(false);
        return;
      }

      setIsUnconfirmedEmail(false);

      if (data?.user) {
        await fetchAndSyncCloudUser(data.user);
      } else {
        updateProfile({
          email,
          displayName: email ? email.split('@')[0] : 'Developer'
        });
      }

      if (redirectTo) {
        router.push(redirectTo);
      } else {
        const latestProfile = useWaynauticStore.getState().profile;
        const isPaid = latestProfile.plan === 'pro' || latestProfile.plan === 'enterprise';
        if (isPaid) {
          router.push('/dashboard');
        } else {
          router.push('/?enroll=cohort');
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred during login.';
      setErrorMsg(message);
      setLoading(false);
    }
  };

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError('');
    setShowUserNotFoundModal(false);

    try {
      const targetEmail = (resetEmail || email).trim().toLowerCase();
      if (!targetEmail) {
        setResetError('Please provide an email address.');
        setResetLoading(false);
        return;
      }

      // 1. Check in database if account is registered
      const accountExists = await checkUserAccountExists(targetEmail);
      if (accountExists === false) {
        setResetLoading(false);
        setShowUserNotFoundModal(true);
        setResetError('User account does not exist.');
        return;
      }

      const { error } = await sendPasswordResetEmail(targetEmail);
      if (error) {
        setResetError(error.message);
        setResetLoading(false);
        return;
      }
      setResetSuccess(true);
      setResetLoading(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send password reset email.';
      setResetError(message);
      setResetLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="w-full max-w-md bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-700/80 rounded-3xl p-5 xs:p-7 sm:p-9 shadow-[0_25px_60px_-12px_rgba(15,23,42,0.32),0_12px_24px_-8px_rgba(15,23,42,0.18),0_0_0_1px_rgba(15,23,42,0.06)] dark:shadow-[0_25px_60px_-12px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.1)] ring-8 ring-black/[0.04] dark:ring-white/[0.03] space-y-6 relative transition-all animate-in fade-in duration-200">
        <div className="w-14 h-1.5 mx-auto rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 mb-2" />
        {/* User Account Does Not Exist Pop-up Modal */}
        {showUserNotFoundModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm p-4 flex items-center justify-center animate-in fade-in duration-200">
            <div className="relative w-full max-w-sm bg-white dark:bg-[#0D121F] border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 dark:bg-rose-950/80 border-2 border-rose-300 dark:border-rose-500/40 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-md">
                <AlertCircle className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  User Account Does Not Exist
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  We could not find any registered account for <span className="font-mono font-bold text-slate-900 dark:text-white">{resetEmail || email}</span>. Please verify your email or create a new student account.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUserNotFoundModal(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-bold text-xs transition-all"
                >
                  Try Another Email
                </button>
                <Link
                  href="/signup"
                  className="w-full py-2.5 rounded-xl border border-sky-300 dark:border-cyan-500/40 bg-sky-50 dark:bg-cyan-950/40 text-sky-700 dark:text-cyan-300 font-bold text-xs hover:bg-sky-100 dark:hover:bg-cyan-900/50 transition-all flex items-center justify-center space-x-1.5"
                >
                  <span>Create New Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="text-center space-y-1.5">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Reset Password</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Enter your email and we&apos;ll send you instructions to reset your password.
          </p>
        </div>

        {resetSuccess ? (
          <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border-2 border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-xs space-y-3 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <div className="font-bold text-sm">Reset Link Dispatched</div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              We have sent password recovery instructions to <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">{resetEmail || email}</span>. Please check your inbox and spam folder.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => { setShowForgotPassword(false); setResetSuccess(false); }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
              >
                Back to Log In
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
            {resetError && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/80 border-2 border-rose-300 dark:border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs font-mono font-bold">
                {resetError}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-400">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="student@waynautic.com"
                  className="w-full py-3 pl-10 pr-4 bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={resetLoading}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-bold text-sm transition-all flex items-center justify-center space-x-2 min-h-[44px] shadow-sm disabled:opacity-60"
            >
              <span>{resetLoading ? 'Sending Instructions...' : 'Send Reset Link'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowForgotPassword(false)}
              className="w-full text-center text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold transition-colors py-1 flex items-center justify-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Log In</span>
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-700/80 rounded-3xl p-5 xs:p-7 sm:p-9 shadow-[0_25px_60px_-12px_rgba(15,23,42,0.32),0_12px_24px_-8px_rgba(15,23,42,0.18),0_0_0_1px_rgba(15,23,42,0.06)] dark:shadow-[0_25px_60px_-12px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.1)] ring-8 ring-black/[0.04] dark:ring-white/[0.03] space-y-5 sm:space-y-6 relative transition-all">
      
      {/* Top accent pill indicator */}
      <div className="w-14 h-1.5 mx-auto rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 mb-2" />

      {searchParams.get('notice') === 'enroll_required' && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-500/40 text-amber-800 dark:text-amber-200 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Please log in to your account to enroll in the 4-Week Intensive Cohort.</span>
        </div>
      )}

      <div className="text-center space-y-1.5">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Student Login</h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
          Enter your email and password to access your courses & track progress
        </p>
      </div>

      {isVerified && !errorMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-xs font-medium space-y-1 animate-in fade-in">
          <div className="flex items-center space-x-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Email Verified Successfully!</span>
          </div>
          <p className="text-emerald-700 dark:text-emerald-300/90 pl-6 text-[11px]">
            Your email is confirmed and your account is active. Enter your password to log in.
          </p>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/80 border-2 border-rose-300 dark:border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs font-mono font-bold space-y-2.5">
          <div>{errorMsg}</div>
          {isUnconfirmedEmail && (
            <div className="pt-2 border-t border-rose-200 dark:border-rose-800/60">
              <button
                type="button"
                onClick={handleResendFromLogin}
                disabled={resendLoading || countdown > 0 || !email}
                className="w-full py-2.5 px-3 rounded-lg border border-sky-400 dark:border-cyan-500/50 bg-sky-100/80 hover:bg-sky-200 dark:bg-cyan-950/60 dark:hover:bg-cyan-900/60 text-sky-800 dark:text-cyan-200 text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1.5 min-h-[44px]"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resendLoading ? 'animate-spin' : ''}`} />
                <span>
                  {resendLoading
                    ? 'Resending verification link...'
                    : countdown > 0
                    ? `Resend available in ${countdown}s`
                    : `Resend verification link to ${email || 'your email'}`}
                </span>
              </button>
            </div>
          )}
        </div>
      )}

      {resendStatus === 'sent' && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-medium flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{resendMsg}</span>
        </div>
      )}

      <form onSubmit={handleEmailLogin} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-400">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@waynautic.com"
              className="w-full py-3 pl-10 pr-4 bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-xl text-base sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 font-medium min-h-[44px]"
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-400">Password</label>
            <button
              type="button"
              onClick={() => {
                setResetEmail(email);
                setShowForgotPassword(true);
                setErrorMsg('');
              }}
              className="text-xs text-sky-600 dark:text-cyan-400 hover:underline font-semibold py-1"
            >
              Forgot Password?
            </button>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full py-3 pl-10 pr-10 bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-xl text-base sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 font-medium min-h-[44px]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-bold text-sm transition-all flex items-center justify-center space-x-2 min-h-[46px] shadow-sm disabled:opacity-60"
        >
          <ShieldCheck className="w-4 h-4 text-current" />
          <span>{loading ? 'Signing In...' : 'Log In & Start Learning'}</span>
        </button>
      </form>

      <div className="text-center text-xs text-slate-600 dark:text-slate-400 pt-2 font-medium">
        Don&apos;t have an account?{' '}
        <Link href={`/signup${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`} className="text-sky-600 dark:text-cyan-400 hover:underline font-extrabold">
          Create Free Student Account
        </Link>
      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center text-sm font-bold text-slate-500">Loading Login...</div>}>
      <LoginForm />
    </Suspense>
  );
}
