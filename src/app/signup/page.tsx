'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, User, ShieldCheck, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { signUpWithEmail } from '@/lib/supabaseAuth';
import { fetchAndSyncCloudUser, useWaynauticStore } from '@/lib/store';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/onboarding';

  const { updateProfile } = useWaynauticStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isConfirmationPending, setIsConfirmationPending] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await signUpWithEmail(email, password, name);

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      // Check if email confirmation is required or standard new user signup
      setRegisteredEmail(email);
      setIsConfirmationPending(true);
      setLoading(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred during registration.';
      setErrorMsg(message);
      setLoading(false);
    }
  };

  if (isConfirmationPending) {
    return (
      <div className="w-full max-w-md bg-white dark:bg-[#0D121F] border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center animate-in fade-in duration-300">
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
            Please check your inbox and click the verification link before logging in. If you don&apos;t see the email within a couple minutes, please check your spam or junk folder.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <Link
            href={`/login${redirectTo !== '/onboarding' && redirectTo !== '/dashboard' ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`}
            className="w-full py-3.5 rounded-2xl bg-[#58CC02] hover:bg-[#61E002] border-2 border-[#58A700] shadow-[0_3px_0_0_#58A700] text-white font-extrabold text-sm transition-all flex items-center justify-center space-x-2 min-h-[46px]"
          >
            <span>Proceed to Log In</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </Link>

          <button
            type="button"
            onClick={() => {
              setIsConfirmationPending(false);
              setPassword('');
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
    <div className="w-full max-w-md bg-white dark:bg-[#0D121F] border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      
      <div className="text-center space-y-3">
        <Link href="/" className="inline-block">
          <Image
            src="/waynautic-logo.png"
            alt="Waynautic"
            width={180}
            height={40}
            className="h-9 w-auto mx-auto object-contain"
          />
        </Link>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white pt-1">Create Student Account</h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
          Unlock all 10 modules, video lectures, code notes, quizzes & certificates
        </p>
      </div>

      {/* 8-Hour Session Info Chip */}
      <div className="flex items-center justify-center space-x-2 py-2 px-3 bg-sky-50 dark:bg-cyan-950/40 border border-sky-300 dark:border-cyan-500/20 rounded-xl text-[11px] text-sky-800 dark:text-cyan-300 font-mono font-bold">
        <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
        <span>8-Hour Protected Session</span>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/80 border-2 border-rose-300 dark:border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs font-mono font-bold">
          {errorMsg}
        </div>
      )}

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
              className="w-full py-3 pl-10 pr-4 bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 font-medium"
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
              className="w-full py-3 pl-10 pr-4 bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 font-medium"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-400">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full py-3 pl-10 pr-4 bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 font-medium"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-2xl bg-[#58CC02] hover:bg-[#61E002] border-2 border-[#58A700] shadow-[0_3px_0_0_#58A700] text-white font-extrabold text-sm transition-all flex items-center justify-center space-x-2 min-h-[46px]"
        >
          <ShieldCheck className="w-4 h-4 text-white" />
          <span>{loading ? 'Creating Account...' : 'Register & Start Learning'}</span>
        </button>
      </form>

      <div className="text-center text-xs text-slate-600 dark:text-slate-400 pt-2 font-medium">
        Already have an account?{' '}
        <Link href={`/login${redirectTo !== '/onboarding' && redirectTo !== '/dashboard' ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`} className="text-sky-600 dark:text-cyan-400 hover:underline font-extrabold">
          Log In
        </Link>
      </div>

    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#0B0F19] flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-center text-sm font-bold text-slate-500">Loading Signup...</div>}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
