'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ShieldCheck, Clock } from 'lucide-react';
import { signInWithEmail } from '@/lib/supabaseAuth';
import { fetchAndSyncCloudUser, useWaynauticStore } from '@/lib/store';

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

      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred during login.';
      setErrorMsg(message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0D121F] border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        
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
          <h2 className="text-2xl font-bold text-white pt-1">Student Login</h2>
          <p className="text-xs text-slate-400">Enter your email and password to access your account & progress</p>
        </div>

        {/* 8-Hour Inactivity Info Chip */}
        <div className="flex items-center justify-center space-x-2 py-2 px-3 bg-cyan-950/40 border border-cyan-500/20 rounded-xl text-[11px] text-cyan-300 font-mono">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Session auto-expires after 8 hrs of inactivity</span>
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
                placeholder="student@waynautic.com"
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
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-bold text-sm hover:brightness-110 shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center space-x-2"
          >
            <ShieldCheck className="w-4 h-4 text-cyan-200" />
            <span>{loading ? 'Signing In...' : 'Log In to Account'}</span>
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-cyan-400 hover:underline font-bold">
            Create Student Account
          </Link>
        </div>

      </div>
    </div>
  );
}
