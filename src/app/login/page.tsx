'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Zap, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { useWaynauticStore } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const { updateProfile } = useWaynauticStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }
      if (data?.user) {
        updateProfile({ displayName: data.user.email?.split('@')[0] || 'Developer' });
        router.push('/dashboard');
        return;
      }
    }

    // Demo mode fallback
    updateProfile({ displayName: email ? email.split('@')[0] : 'Developer' });
    router.push('/dashboard');
  };

  const handleGoogleLogin = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signInWithOAuth({ provider: 'google' });
    } else {
      updateProfile({ displayName: 'Google Developer' });
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0D121F] border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-600 p-[2px]">
              <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <span className="font-bold text-lg text-white">Waynautic <span className="text-cyan-400">Academy</span></span>
          </Link>
          <h2 className="text-2xl font-bold text-white pt-2">Welcome Back</h2>
          <p className="text-xs text-slate-400">Log in to track progress and sync credentials</p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/30 text-rose-300 text-xs font-mono">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-400">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dev@waynautic.com"
                className="w-full py-3 pl-10 pr-4 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-400">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full py-3 pl-10 pr-4 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-bold text-sm hover:brightness-110 shadow-lg shadow-cyan-500/20 transition-all"
          >
            {loading ? 'Signing In...' : 'Log In to Account'}
          </button>
        </form>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-[#0D121F] px-3 text-[10px] font-mono text-slate-500 uppercase absolute">OR</span>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-medium text-xs hover:bg-slate-800 hover:text-white transition-colors flex items-center justify-center space-x-2"
        >
          <span>Continue with Google OAuth</span>
        </button>

        <div className="text-center text-xs text-slate-400">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-cyan-400 hover:underline font-bold">
            Sign Up
          </Link>
        </div>

      </div>
    </div>
  );
}
