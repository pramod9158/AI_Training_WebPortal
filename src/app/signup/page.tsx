'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, User, ShieldCheck, Clock, CheckCircle2, ArrowRight, Eye, EyeOff, RefreshCw, AlertCircle } from 'lucide-react';
import { signUpWithEmail, resendVerificationEmail } from '@/lib/supabaseAuth';
import { fetchAndSyncCloudUser, useWaynauticStore } from '@/lib/store';
import { clearAdminSession } from '@/lib/adminService';
import { supabase } from '@/lib/supabaseClient';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/?enroll=cohort';
  const notice = searchParams.get('notice');

  const { profile, updateProfile } = useWaynauticStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);
  const [isConfirmationPending, setIsConfirmationPending] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  // Requirement: If authenticated user lands on signup from anywhere, redirect to main page
  React.useEffect(() => {
    if (profile.userId || profile.email) {
      router.replace('/');
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        router.replace('/');
      }
    });
  }, [profile.userId, profile.email, router]);

  // Resend verification state
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

  const handleResend = async () => {
    if (countdown > 0 || resendLoading || !registeredEmail) return;
    setResendLoading(true);
    setResendStatus('idle');
    setResendMsg('');

    const { error } = await resendVerificationEmail(registeredEmail);
    setResendLoading(false);

    if (error) {
      setResendStatus('error');
      if (error.message.toLowerCase().includes('rate limit')) {
        setResendMsg('Email rate limit reached: Supabase limits email requests to prevent abuse. Please wait 1-2 minutes before trying again.');
      } else {
        setResendMsg(error.message);
      }
    } else {
      setResendStatus('sent');
      setResendMsg('Verification email resent! Please check your Inbox and Spam/Junk folder.');
      setCountdown(60);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setIsAlreadyRegistered(false);

    try {
      // Purge any stale admin console session
      clearAdminSession();

      const { data, error } = await signUpWithEmail(email, password, name.trim());

      // Requirement: When already registered user creates account again, it should say "You are already registered"
      const userIdentities = (data?.user as { identities?: unknown[] } | undefined)?.identities;
      const userAlreadyExists = 
        Boolean(userIdentities && userIdentities.length === 0) ||
        Boolean(error && (
          error.message.toLowerCase().includes('already registered') ||
          error.message.toLowerCase().includes('already exists') ||
          error.message.toLowerCase().includes('user already registered')
        ));

      if (userAlreadyExists) {
        setIsAlreadyRegistered(true);
        setErrorMsg('You are already registered! Please log in with your email and password.');
        setLoading(false);
        return;
      }

      if (error) {
        if (error.message.toLowerCase().includes('rate limit')) {
          setErrorMsg('Email rate limit reached: Supabase restricts verification emails to prevent spam. Please wait a few minutes before trying again, or log in if you already created this account.');
        } else {
          setErrorMsg(error.message);
        }
        setLoading(false);
        return;
      }

      // If email confirmation is required by Supabase, data.session is null
      if (data?.user && !data?.session) {
        setRegisteredEmail(email);
        setIsConfirmationPending(true);
        setLoading(false);
      } else if (data?.session && data?.user) {
        // If email confirmation is disabled in Supabase, sign in directly
        await fetchAndSyncCloudUser(data.user);
        router.push(redirectTo);
      } else {
        setRegisteredEmail(email);
        setIsConfirmationPending(true);
        setLoading(false);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred during registration.';
      setErrorMsg(message);
      setLoading(false);
    }
  };

  if (profile.userId || profile.email) {
    return null;
  }

  if (isConfirmationPending) {
    return (
    <div className="w-full max-w-md bg-white/90 dark:bg-[#0D121F]/90 backdrop-blur-2xl border-2 border-slate-200/80 dark:border-slate-700/60 rounded-3xl p-6 sm:p-8 shadow-[0_32px_80px_-12px_rgba(0,0,0,0.18)] dark:shadow-[0_32px_80px_-12px_rgba(0,0,0,0.6)] ring-1 ring-white/60 dark:ring-white/5 space-y-6 text-center animate-in fade-in duration-300">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-sky-100 dark:bg-cyan-950/80 border-2 border-sky-300 dark:border-cyan-500/40 flex items-center justify-center text-sky-600 dark:text-cyan-400 shadow-md">
          <Mail className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Account Registered</span>
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Confirm Your Email First
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            We have sent a verification link to:
          </p>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs text-sky-600 dark:text-cyan-400 font-bold truncate">
            {registeredEmail}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-500/30 text-left space-y-2 text-xs text-amber-900 dark:text-amber-200 font-medium">
          <div className="font-bold flex items-center space-x-1.5 text-amber-800 dark:text-amber-300">
            <span>Important: Verify Email to Log In</span>
          </div>
          <p>
            Please check your inbox and click the verification link before logging in. If you don&apos;t see the email within a couple minutes, please check your <strong>Spam or Junk folder</strong>.
          </p>
        </div>

        {resendStatus === 'sent' && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-medium flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{resendMsg}</span>
          </div>
        )}

        {resendStatus === 'error' && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-500/40 text-rose-800 dark:text-rose-300 text-xs font-mono font-medium">
            {resendMsg}
          </div>
        )}


        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendLoading || countdown > 0}
            className="w-full py-2.5 rounded-xl border-2 border-sky-300 dark:border-cyan-500/40 bg-sky-50/70 hover:bg-sky-100 dark:bg-cyan-950/40 dark:hover:bg-cyan-950/70 text-sky-700 dark:text-cyan-300 text-xs font-mono font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 min-h-[42px]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resendLoading ? 'animate-spin' : ''}`} />
            <span>
              {resendLoading
                ? 'Sending Verification Link...'
                : countdown > 0
                ? `Resend available in ${countdown}s`
                : 'Didn’t get the email? Resend Link'}
            </span>
          </button>

          <Link
            href={`/login${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`}
            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-bold text-sm transition-all flex items-center justify-center space-x-2 min-h-[44px] shadow-sm"
          >
            <span>Proceed to Log In</span>
            <ArrowRight className="w-4 h-4 text-current" />
          </Link>

          <button
            type="button"
            onClick={() => {
              setIsConfirmationPending(false);
              setPassword('');
              setResendStatus('idle');
              setResendMsg('');
            }}
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white font-medium underline"
          >
            Need to change email or re-register?
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-700/80 rounded-3xl p-5 xs:p-7 sm:p-9 shadow-[0_25px_60px_-12px_rgba(15,23,42,0.32),0_12px_24px_-8px_rgba(15,23,42,0.18),0_0_0_1px_rgba(15,23,42,0.06)] dark:shadow-[0_25px_60px_-12px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.1)] ring-8 ring-black/[0.04] dark:ring-white/[0.03] space-y-5 sm:space-y-6 relative transition-all">
      
      {/* Top accent pill indicator */}
      <div className="w-14 h-1.5 mx-auto rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 mb-2" />

      <div className="text-center space-y-1.5">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Create Student Account</h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
          Unlock all 10 modules, video lectures, code notes, quizzes & certificates
        </p>
      </div>

      {/* 8-Hour Session Info Chip */}
      <div className="flex items-center justify-center space-x-2 py-2 px-3 bg-sky-50 dark:bg-cyan-950/40 border border-sky-300 dark:border-cyan-500/20 rounded-xl text-[11px] text-sky-800 dark:text-cyan-300 font-mono font-bold">
        <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
        <span>8-Hour Protected Session</span>
      </div>

      {/* Notice Banner when redirected from enrollment or locked portal */}
      {notice === 'enroll_required' && (
        <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border-2 border-sky-300 dark:border-sky-700/60 text-sky-900 dark:text-sky-200 text-xs font-medium space-y-1 animate-in fade-in">
          <div className="font-extrabold flex items-center space-x-1.5 text-sky-800 dark:text-sky-300 text-xs">
            <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
            <span>Step 1: Create Account to Enroll</span>
          </div>
          <p className="text-[11px] text-sky-700/90 dark:text-sky-300/90 leading-relaxed">
            Please register your student account first. Once created, you will be taken directly to checkout to complete your 4-Week Cohort enrollment.
          </p>
        </div>
      )}

      {isAlreadyRegistered ? (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border-2 border-amber-300 dark:border-amber-600/50 text-amber-900 dark:text-amber-200 text-xs font-medium space-y-3 animate-in fade-in">
          <div className="flex items-center space-x-2 font-extrabold text-amber-800 dark:text-amber-300 text-sm">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>You are already registered!</span>
          </div>
          <p className="text-xs text-amber-800/90 dark:text-amber-200/90">
            An account already exists for <strong>{email}</strong>. Please log in with your credentials or reset your password.
          </p>
          <Link
            href={`/login?email=${encodeURIComponent(email)}${redirectTo ? `&redirectTo=${encodeURIComponent(redirectTo)}` : ''}`}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-sm min-h-[44px]"
          >
            <span>Proceed to Log In</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : errorMsg ? (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/80 border-2 border-rose-300 dark:border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs font-mono font-bold leading-relaxed space-y-1">
          <div>{errorMsg}</div>
          {errorMsg.includes('rate limit') && (
            <div className="pt-1">
              <Link href={`/login${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`} className="text-sky-600 dark:text-cyan-400 underline font-extrabold hover:text-sky-700">
                Already registered? Go to Log In →
              </Link>
            </div>
          )}
        </div>
      ) : null}

      <form onSubmit={handleSignup} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-400">Full Name</label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Morgan"
              className="w-full py-3 pl-10 pr-4 bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-xl text-base sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 font-medium min-h-[44px]"
            />
          </div>
        </div>

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
          <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-400">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
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
          <span>{loading ? 'Creating Account...' : 'Register & Start Learning'}</span>
        </button>
      </form>

      <div className="text-center text-xs text-slate-600 dark:text-slate-400 pt-2 font-medium">
        Already have an account?{' '}
        <Link href={`/login${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`} className="text-sky-600 dark:text-cyan-400 hover:underline font-extrabold">
          Log In
        </Link>
      </div>

    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="text-center text-sm font-bold text-slate-500">Loading Signup...</div>}>
      <SignupForm />
    </Suspense>
  );
}
