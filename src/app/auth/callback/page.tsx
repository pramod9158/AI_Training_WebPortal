'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { fetchAndSyncCloudUser } from '@/lib/store';
import { Sparkles, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email and preparing your dashboard...');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function handleAuth() {
      if (!isSupabaseConfigured) {
        if (isMounted) {
          router.replace('/dashboard');
        }
        return;
      }

      try {
        const hash = typeof window !== 'undefined' ? window.location.hash : '';
        const search = typeof window !== 'undefined' ? window.location.search : '';

        // 1. Check for error in URL hash or search params
        const hashParams = new URLSearchParams(hash.replace(/^#/, ''));
        const errorCode = hashParams.get('error_code') || searchParams.get('error_code');
        const errorDesc = hashParams.get('error_description') || searchParams.get('error_description');

        if (errorCode || errorDesc) {
          // Check if session is actually established anyway (e.g. scanner verified it)
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            await fetchAndSyncCloudUser(session.user);
            if (isMounted) {
              setStatus('success');
              setMessage('Email verified! Launching your dashboard...');
              setTimeout(() => router.replace('/dashboard'), 400);
            }
            return;
          }

          if (isMounted) {
            setStatus('error');
            if (errorCode === 'otp_expired' || errorDesc?.toLowerCase().includes('expired')) {
              setMessage('Your email confirmation link was already used or expired.');
              setErrorDetails('Your email is likely already verified! Please sign in with your password to access your dashboard.');
            } else {
              setMessage('Authentication link error');
              setErrorDetails(errorDesc || 'The authentication link is invalid or has expired.');
            }
          }
          return;
        }

        // 2. Check for PKCE 'code' in query params
        const code = searchParams.get('code');
        if (code) {
          setMessage('Exchanging authorization code...');
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          if (data.session?.user) {
            await fetchAndSyncCloudUser(data.session.user);
            if (isMounted) {
              setStatus('success');
              setMessage('Authentication successful! Launching your dashboard...');
              setTimeout(() => router.replace('/dashboard'), 400);
            }
            return;
          }
        }

        // 3. Check for token_hash and type in query params
        const tokenHash = searchParams.get('token_hash');
        const type = (searchParams.get('type') || 'signup') as 'signup' | 'email' | 'recovery' | 'magiclink';
        if (tokenHash) {
          setMessage('Verifying your verification token...');
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type,
          });
          if (error) throw error;
          if (data.session?.user) {
            await fetchAndSyncCloudUser(data.session.user);
            if (isMounted) {
              setStatus('success');
              setMessage('Email successfully verified! Launching your dashboard...');
              setTimeout(() => router.replace('/dashboard'), 400);
            }
            return;
          }
        }

        // 4. Check for implicit access_token in URL hash
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        if (accessToken && refreshToken) {
          setMessage('Validating security tokens...');
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
          if (data.session?.user) {
            await fetchAndSyncCloudUser(data.session.user);
            if (isMounted) {
              setStatus('success');
              setMessage('Session verified! Launching your dashboard...');
              setTimeout(() => router.replace('/dashboard'), 400);
            }
            return;
          }
        }

        // 5. Fallback: check existing active session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await fetchAndSyncCloudUser(session.user);
          if (isMounted) {
            setStatus('success');
            setMessage('Welcome back! Launching your dashboard...');
            setTimeout(() => router.replace('/dashboard'), 400);
          }
          return;
        }

        // No token or session found
        if (isMounted) {
          router.replace('/dashboard');
        }
      } catch (err: unknown) {
        console.error('Auth callback error:', err);
        if (isMounted) {
          const errMessage = err instanceof Error ? err.message : 'Failed to complete authentication.';
          setStatus('error');
          setMessage('Authentication issue');
          setErrorDetails(errMessage);
        }
      }
    }

    handleAuth();

    return () => {
      isMounted = false;
    };
  }, [router, searchParams]);

  return (
    <div className="w-full max-w-md bg-white dark:bg-[#0D121F] border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 text-center animate-in fade-in duration-300">
      {status === 'loading' && (
        <>
          <div className="w-16 h-16 mx-auto rounded-3xl bg-cyan-100 dark:bg-cyan-950/80 border-2 border-cyan-300 dark:border-cyan-500/40 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shadow-lg">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Authenticating Session
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
              {message}
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
              Success!
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
              {message}
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
              {message}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
              {errorDetails}
            </p>
          </div>

          <div className="pt-4 space-y-3">
            <Link
              href="/login?verified=true"
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-slate-950 font-bold text-sm transition-all flex items-center justify-center space-x-2 shadow-md"
            >
              <span>Log In to Your Account</span>
            </Link>
            <Link
              href="/dashboard"
              className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all inline-block"
            >
              Continue to Dashboard as Guest
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md bg-white dark:bg-[#0D121F] border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-cyan-500" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            Initializing secure callback...
          </p>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
