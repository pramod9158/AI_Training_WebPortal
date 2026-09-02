'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, ShieldCheck, Clock, ArrowRight } from 'lucide-react';
import { signInWithEmail } from '@/lib/supabaseAuth';
import { fetchAndSyncCloudUser, useWaynauticStore } from '@/lib/store';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';

  const { updateProfile } = useWaynauticStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await signInWithEmail(email, password);

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      if (data?.user) {
        await fetchAndSyncCloudUser(data.user);
      } else {
        updateProfile({
          email,
          displayName: email ? email.split('@')[0] : 'Developer'
        });
      }

      router.push(redirectTo);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred during login.';
      setErrorMsg(message);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-[#0D121F] border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      
      <div className="text-center space-y-1.5">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Student Login</h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
          Enter your email and password to access your courses & track progress
        </p>
      </div>

      {/* 8-Hour Inactivity Info Chip */}
      <div className="flex items-center justify-center space-x-2 py-2 px-3 bg-sky-50 dark:bg-cyan-950/40 border border-sky-300 dark:border-cyan-500/20 rounded-xl text-[11px] text-sky-800 dark:text-cyan-300 font-mono font-bold">
        <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
        <span>Session protected for 8 hrs of inactivity</span>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/80 border-2 border-rose-300 dark:border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs font-mono font-bold">
          {errorMsg}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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
          <span>{loading ? 'Signing In...' : 'Log In & Start Learning'}</span>
        </button>
      </form>

      <div className="text-center text-xs text-slate-600 dark:text-slate-400 pt-2 font-medium">
        Don&apos;t have an account?{' '}
        <Link href={`/signup${redirectTo !== '/dashboard' ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`} className="text-sky-600 dark:text-cyan-400 hover:underline font-extrabold">
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
