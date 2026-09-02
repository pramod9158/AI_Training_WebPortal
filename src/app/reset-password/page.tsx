'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, KeyRound } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { updateUserPassword } from '@/lib/supabaseAuth';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSessionValid, setIsSessionValid] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkRecoverySession() {
      if (!isSupabaseConfigured) {
        // In local demo mode without Supabase keys
        if (isMounted) {
          setIsSessionValid(true);
          setIsVerifying(false);
        }
        return;
      }

      // Check if code exists in search params for PKCE flow
      const code = searchParams.get('code');
      if (code) {
        try {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (!error && isMounted) {
            setIsSessionValid(true);
            setIsVerifying(false);
            return;
          }
        } catch {
          // Continue to fallback check
        }
      }

      // Check current session
      const { data: { session } } = await supabase.auth.getSession();
      if (session && isMounted) {
        setIsSessionValid(true);
        setIsVerifying(false);
        return;
      }

      // Check hash fragment for implicit access_token
      if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
        if (isMounted) {
          setIsSessionValid(true);
          setIsVerifying(false);
          return;
        }
      }

      // Listen for PASSWORD_RECOVERY or SIGNED_IN event
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN' || (session && isMounted)) {
          if (isMounted) {
            setIsSessionValid(true);
            setIsVerifying(false);
          }
        }
      });

      // Give auth state 2.5 seconds to settle before declaring session invalid
      const timer = setTimeout(() => {
        if (isMounted && !isSessionValid) {
          setIsVerifying(false);
        }
      }, 2500);

      return () => {
        authListener.subscription.unsubscribe();
        clearTimeout(timer);
      };
    }

    checkRecoverySession();

    return () => {
      isMounted = false;
    };
  }, [searchParams, isSessionValid]);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await updateUserPassword(password);

      if (error) {
        setErrorMsg(error.message || 'Failed to update password. Your reset link may have expired.');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred while updating password.';
      setErrorMsg(msg);
      setLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="w-full max-w-md bg-white dark:bg-[#0D121F] border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl space-y-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-cyan-950/60 border border-sky-300 dark:border-cyan-500/30 flex items-center justify-center mx-auto animate-pulse">
          <KeyRound className="w-6 h-6 text-sky-600 dark:text-cyan-400" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Verifying Recovery Link</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Connecting to authentication service...
        </p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="w-full max-w-md bg-white dark:bg-[#0D121F] border-2 border-emerald-300 dark:border-emerald-500/40 rounded-3xl p-8 shadow-2xl space-y-6 text-center animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-400 dark:border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-9 h-9 text-emerald-500" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Password Updated!
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            Your new password has been saved to the database. You can now use your new password to sign in to your Waynautic Academy account.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/login"
            className="w-full py-3.5 rounded-2xl bg-[#58CC02] hover:bg-[#61E002] border-2 border-[#58A700] shadow-[0_3px_0_0_#58A700] text-white font-extrabold text-sm transition-all flex items-center justify-center space-x-2"
          >
            <span>Log In with New Password</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (!isSessionValid) {
    return (
      <div className="w-full max-w-md bg-white dark:bg-[#0D121F] border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border-2 border-amber-300 dark:border-amber-500/40 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7 text-amber-500" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Reset Link Invalid or Expired</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            This password recovery link has already been used or has expired. Please request a fresh link from the login page.
          </p>
        </div>

        <div className="pt-2 space-y-2">
          <Link
            href="/login"
            className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-colors"
          >
            <span>Return to Login</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white dark:bg-[#0D121F] border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in duration-300">
      
      <div className="text-center space-y-1.5">
        <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-cyan-950/60 border border-sky-300 dark:border-cyan-500/30 flex items-center justify-center mx-auto mb-2">
          <KeyRound className="w-6 h-6 text-sky-600 dark:text-cyan-400" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Create New Password</h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
          Choose a secure new password for your Waynautic Academy account
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/80 border-2 border-rose-300 dark:border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs font-mono font-bold">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handlePasswordUpdate} className="space-y-4">
        {/* New Password */}
        <div className="space-y-1">
          <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-400">New Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full py-3 pl-10 pr-10 bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 font-medium"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm New Password */}
        <div className="space-y-1">
          <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-400">Confirm New Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your new password"
              className="w-full py-3 pl-10 pr-10 bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 font-medium"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-2xl bg-[#58CC02] hover:bg-[#61E002] border-2 border-[#58A700] shadow-[0_3px_0_0_#58A700] text-white font-extrabold text-sm transition-all flex items-center justify-center space-x-2 min-h-[46px]"
        >
          <Lock className="w-4 h-4 text-white" />
          <span>{loading ? 'Updating Password in Database...' : 'Save New Password'}</span>
        </button>
      </form>

      <div className="text-center text-xs text-slate-600 dark:text-slate-400 pt-1 font-medium">
        Remember your password?{' '}
        <Link href="/login" className="text-sky-600 dark:text-cyan-400 hover:underline font-extrabold">
          Return to Login
        </Link>
      </div>

    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center text-sm font-bold text-slate-500">Loading Password Reset...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
