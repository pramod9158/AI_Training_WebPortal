'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { fetchAndSyncCloudUser } from '@/lib/store';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function AuthConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [statusMsg, setStatusMsg] = useState('Verifying your email address...');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function verify() {
      if (!isSupabaseConfigured) {
        if (isMounted) {
          router.replace('/dashboard');
        }
        return;
      }

      const tokenHash = searchParams.get('token_hash');
      const type = (searchParams.get('type') || 'email') as 'email' | 'signup' | 'recovery' | 'magiclink';
      const code = searchParams.get('code');

      // 1. If code param exists (PKCE)
      if (code) {
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          if (data?.session?.user) {
            await fetchAndSyncCloudUser(data.session.user);
            if (isMounted) {
              setStatus('success');
              setStatusMsg('Email confirmed! Redirecting to your dashboard...');
              setTimeout(() => router.replace('/dashboard'), 500);
            }
            return;
          }
        } catch (err: unknown) {
          console.error('Code exchange error:', err);
        }
      }

      // 2. If token_hash exists
      if (tokenHash) {
        try {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type,
          });

          if (error) throw error;

          if (data?.session?.user) {
            await fetchAndSyncCloudUser(data.session.user);
            if (isMounted) {
              setStatus('success');
              setStatusMsg('Email verified successfully! Preparing your student dashboard...');
              setTimeout(() => router.replace('/dashboard'), 500);
            }
            return;
          }
        } catch (err: unknown) {
          console.error('VerifyOtp error in /auth/confirm:', err);
          if (isMounted) {
            // Check if user has an active session regardless
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
              await fetchAndSyncCloudUser(session.user);
              setStatus('success');
              setStatusMsg('Session confirmed! Launching your dashboard...');
              setTimeout(() => router.replace('/dashboard'), 500);
              return;
            }

            setStatus('error');
            const message = err instanceof Error ? err.message : 'Verification failed.';
            if (message.toLowerCase().includes('expired') || message.toLowerCase().includes('otp')) {
              setErrorMsg('This confirmation link has already been used or expired. Your email may already be verified!');
            } else {
              setErrorMsg(message);
            }
            setVerifying(false);
          }
          return;
        }
      }

      // 3. Check existing session
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchAndSyncCloudUser(session.user);
        if (isMounted) {
          setStatus('success');
          setStatusMsg('Welcome back! Launching your dashboard...');
          setTimeout(() => router.replace('/dashboard'), 500);
        }
        return;
      }

      // If no token_hash or code provided
      if (isMounted) {
        setStatus('error');
        setErrorMsg('No verification token found in link.');
        setVerifying(false);
      }
    }

    verify();

    return () => {
      isMounted = false;
    };
  }, [router, searchParams]);

  return (
    <div className="w-full max-w-md bg-white dark:bg-[#0D121F] border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 text-center animate-in fade-in duration-300">
      {status === 'verifying' && (
        <>
          <div className="w-16 h-16 mx-auto rounded-3xl bg-cyan-100 dark:bg-cyan-950/80 border-2 border-cyan-300 dark:border-cyan-500/40 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shadow-lg">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Confirming Email
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
              {statusMsg}
            </p>
          </div>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-100 dark:bg-emerald-950/80 border-2 border-emerald-300 dark:border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-lg">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Account Activated!
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
              {statusMsg}
            </p>
          </div>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-100 dark:bg-amber-950/80 border-2 border-amber-300 dark:border-amber-500/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-lg">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Verification Notice
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              {errorMsg}
            </p>
          </div>

          <div className="pt-4 space-y-3">
            <Link
              href="/login?verified=true"
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-slate-950 font-bold text-sm transition-all flex items-center justify-center space-x-2 shadow-md"
            >
              <span>Sign In to Your Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function AuthConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md bg-white dark:bg-[#0D121F] border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-cyan-500" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            Loading confirmation...
          </p>
        </div>
      }
    >
      <AuthConfirmContent />
    </Suspense>
  );
}
