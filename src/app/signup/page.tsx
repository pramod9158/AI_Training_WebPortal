'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, ShieldCheck, Clock } from 'lucide-react';
import { signUpWithEmail } from '@/lib/supabaseAuth';
import { fetchAndSyncCloudUser, useWaynauticStore } from '@/lib/store';

export default function SignupPage() {
  const router = useRouter();
  const { updateProfile } = useWaynauticStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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

      if (data?.user) {
        await fetchAndSyncCloudUser(data.user);
      } else {
        updateProfile({
          email,
          displayName: name || (email ? email.split('@')[0] : 'Developer')
        });
      }

      router.push('/onboarding');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred during registration.';
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
          <h2 className="text-2xl font-bold text-white pt-1">Create Student Account</h2>
          <p className="text-xs text-slate-400">Register with your email to save and resume your learning progress</p>
        </div>

        {/* 8-Hour Session Info Chip */}
        <div className="flex items-center justify-center space-x-2 py-2 px-3 bg-cyan-950/40 border border-cyan-500/20 rounded-xl text-[11px] text-cyan-300 font-mono">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Includes automatic 8-hour inactivity session protection</span>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/30 text-rose-300 text-xs font-mono">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-400">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Developer"
                className="w-full py-3 pl-10 pr-4 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

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
            <span>{loading ? 'Creating Account...' : 'Sign Up & Begin'}</span>
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2">
          Already have an account?{' '}
          <Link href="/login" className="text-cyan-400 hover:underline font-bold">
            Log In
          </Link>
        </div>

      </div>
    </div>
  );
}
